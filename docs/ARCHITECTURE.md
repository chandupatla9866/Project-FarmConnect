# Architecture

## System overview

```
┌─────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   React SPA │  HTTP  │  Spring Boot API  │  HTTP  │  FastAPI service │
│  (Vite/TS)  │ ─────► │  (Java 17)        │ ─────► │  (Python)        │
│  :5173      │  JWT   │  :8080            │        │  :8000           │
└─────────────┘        └────────┬──────────┘        └──────────────────┘
                                 │ JDBC
                                 ▼
                          ┌─────────────┐
                          │ PostgreSQL  │
                          │   :5432     │
                          └─────────────┘
```

- **Frontend** never talks to the AI service directly — every AI call goes through the backend's `/api/ai/**` proxy, which persists an audit row (`ai_predictions` table) and can enforce auth/rate-limits centrally.
- **AI service** is stateless and has no database of its own; it's a pure function service (heuristics over request data + small seeded JSON tables).
- **Backend** is the only component that talks to PostgreSQL.

## Why the AI service is separate

The spec calls for a Python/TensorFlow/OpenCV/Scikit-learn AI stack. Rather than fake that inside the Java backend, `ai-service/` is a real, independently-runnable Python service with the correct shape for that future work: each of the 5 features sits behind a small interface in `ai-service/app/ml/` —

```python
class DemandPredictor(ABC):
    def predict(self, request: DemandPredictionRequest) -> DemandPredictionResponse: ...

class HeuristicDemandPredictor(DemandPredictor):
    ...  # today's implementation
```

Swapping in a real trained model later means implementing that same interface and changing one line (the module-level singleton), not touching the router, the schema, or the Java side at all. Today's implementations are deliberately honest heuristics, not fake ML dressed up — see each file's docstring for exactly what it does:

| Feature | File | Heuristic |
|---|---|---|
| Demand prediction | `ml/demand_predictor.py` | Weighted moving average over recent order history × a month-based seasonality multiplier |
| Crop recommendation | `ml/crop_recommender.py` | Lookup table keyed by `(soilType, season)`, ranked by static suitability score |
| Price prediction | `ml/price_predictor.py` | Category base price × organic multiplier × seasonality multiplier − bulk-quantity discount |
| Disease detection | `ml/disease_classifier.py` | Deterministic hash of the uploaded image bytes buckets into one of 9 seeded conditions — same photo always returns the same result, but it's not actually looking at pixels. **This is the explicit swap point for a real CNN.** |
| Weather alerts | `ml/weather_provider.py` | Deterministic pseudo-random values seeded from `(rounded lat/lon, today's date)` — no external API call. Swap point for a real provider (e.g. OpenWeatherMap) once `WEATHER_API_KEY` is wired up. |

## Backend layering

```
controller/   → REST endpoints, request/response DTOs only, no business logic
service/      → business logic, transactions
repository/   → Spring Data JPA interfaces
domain/entity → JPA entities
domain/enums  → shared enums (mirrored by DB CHECK-free VARCHAR columns + Flyway defaults)
security/     → JWT provider/filter, OAuth2 success handler, SecurityUser
storage/      → ImageStorageService (Cloudinary, falls back to local disk)
client/       → AiServiceClient (calls the Python service via Spring's RestClient)
exception/    → GlobalExceptionHandler (@RestControllerAdvice) + typed exceptions
```

Standard request lifecycle: `Controller` validates input (Bean Validation) → delegates to `Service` (implements business rules + `@Transactional` boundaries) → `Service` uses `Repository` for persistence → `Service` maps entities to response DTOs (kept inline rather than via a separate mapper layer, since Phase 1's DTOs are simple enough that MapStruct would add indirection without saving real code).

## Auth model

- **Local accounts**: BCrypt-hashed password, `POST /api/auth/login` → HMAC-SHA256 JWT (24h expiry) containing `userId` and `roles`.
- **Google OAuth2 accounts**: Spring Security's `oauth2Login()` flow is wired up **only when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are both set** (see `SecurityConfig.filterChain`) — this is deliberate: Spring Boot's own `OAuth2ClientAutoConfiguration` throws at startup if a registration exists with a blank client-id, so the client registration is built by hand from custom `app.oauth2.google.*` properties instead of Spring's `spring.security.oauth2.client.*` path, and `.oauth2Login()` is only attached to the filter chain when both values are present. Until then, `/oauth2/**` simply 404s and email/password login works normally.
- **New Google sign-ins with no role yet** get a short-lived (15 min) "onboarding" JWT (`OAuth2LoginSuccessHandler`) and are redirected to the frontend's role-selection screen, which calls `POST /api/auth/select-role` to get a full access token.
- **Authorization**: `@PreAuthorize("hasRole('FARMER')")` on controllers + Spring's `hasRole()` matches the `ROLE_*` authorities minted directly from the `roles` table — no separate mapping layer.

## Data model

15 tables, all created by Flyway (`backend/src/main/resources/db/migration/V1`–`V23`), seeded with demo data (`V15`–`V19`, corrected in `V22`) plus a follow-up migration adding delivery OTP/fee columns (`V23`):

`roles`, `users`, `user_roles`, `farmers`, `buyers`, `categories`, `products`, `orders`, `order_items`, `deliveries`, `payments`, `reviews`, `favorites`, `notifications`, `ai_predictions`.

The full relational model (including `buyers`, `deliveries`, `payments`, `reviews`) was built in Phase 1 specifically so later phases wouldn't require schema migrations to add their core endpoints — Buyer, Delivery, and Admin dashboards were built against tables that already existed with realistic seed data. Delivery's OTP-based confirmation flow was the one addition that did need new columns (`deliveries.otp`, `deliveries.delivery_fee`), added in `V23`.

### Delivery/OTP flow

There's no separate "dispatch" step or delivery-partner assignment UI. When a farmer marks an order `READY_FOR_PICKUP` (`OrderServiceImpl.markReadyForPickup`), the backend inline-creates the `Delivery` row: generates a random 4-digit OTP, computes `deliveryFee` via a Haversine distance between the farmer's and buyer's saved lat/lon (₹30 base + ₹5/km), and notifies the buyer. Any delivery agent can then claim it from `/api/delivery/available`. The OTP is surfaced to the buyer on their order detail page (`BuyerOrderServiceImpl`, only while status is `READY_FOR_PICKUP` or `OUT_FOR_DELIVERY`) and is the only thing the delivery agent needs from the buyer at drop-off to call `/api/delivery/{id}/complete`, which marks the order `DELIVERED` and the payment `COMPLETED` in one transaction.

## Frontend structure

```
context/     → AuthContext (JWT storage, current user), ThemeContext (dark/light)
lib/apiClient.ts → single Axios instance; request interceptor attaches the JWT,
                    response interceptor redirects to /login on 401
lib/api/*    → one thin module per resource, each unwraps the {success,data,error} envelope
components/ui/       → design-system primitives (Button, Card, Modal, Toast, ...)
components/layout/   → Navbar (shared, takes notificationsPath/profilePath/cartPath props),
                       one Sidebar + one DashboardLayout per role (Farmer/Buyer/Delivery/Admin),
                       PublicLayout, ProtectedRoute (requiredRole-gated)
components/landing/  → one component per landing-page section
components/dashboard/→ StatCard, ChartCard, RevenueTrendChart, TopProductsChart, ProductCard, OrderCard, DeliveryCard
pages/{farmer,buyer,delivery,admin}/ → route-level components, one per URL, using TanStack Query
                       directly (no extra per-entity hook layer — query keys and API calls live
                       in the page that uses them)
utils/roles.ts → resolveDashboardPath(roles) — the single source of truth for which
                  dashboard a JWT's roles resolve to, used by login/register/OAuth-callback/header
```

State: server state lives in TanStack Query (cache, loading/error states, invalidation on mutation); the only client-only state is auth (`AuthContext`), theme (`ThemeContext`), and the buyer's cart (`CartContext`, single-farmer-per-cart) — all backed by `localStorage`.

## What's deferred (see root README for the full list)

All four dashboards (Farmer, Buyer, Delivery, Admin) are built. Still deferred: real trained AI models (today's `ai-service/` implementations are honest heuristics, see above), real Cloudinary/Google/Razorpay/Maps credentials (all wired up and inert without them, not stubbed out), payment gateway calls (COD only — `Payment` rows are created/completed automatically, no real settlement), delivery route optimization, refresh-token rotation, automated CI.
