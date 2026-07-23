# API Reference

Base URL: `http://localhost:8080/api` (backend). Interactive Swagger UI: `http://localhost:8080/swagger-ui.html`.

All responses are wrapped in a standard envelope:

```json
{ "success": true, "data": { }, "error": null }
```

On failure: `{ "success": false, "data": null, "error": { "code": "...", "message": "...", "timestamp": "...", "fieldErrors": [] } }`.

Paginated endpoints accept `page` (0-based) and `size` query params and return:

```json
{ "content": [...], "page": 0, "size": 10, "totalElements": 42, "totalPages": 5, "last": false }
```

Protected endpoints require `Authorization: Bearer <jwt>`.

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Email+password signup with role selection (`FARMER` or `BUYER`) |
| POST | `/login` | Public | Email+password login → JWT |
| GET | `/me` | JWT | Current user profile + roles |
| POST | `/select-role` | Onboarding JWT | Assigns a role to a newly-provisioned Google OAuth account |
| GET | `/oauth2/authorization/google` | Public | Starts Google OAuth2 login (Spring-managed redirect) |

## Farmer Profile — `/api/farmers/me`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ROLE_FARMER | Get own farm profile |
| PUT | `/` | ROLE_FARMER | Update farm profile |

## Categories — `/api/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | List all product categories |

## Products — `/api/farmer/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ROLE_FARMER | Paginated list, filter by `status` / `categoryId` |
| POST | `/` | ROLE_FARMER | Create (multipart: fields + optional `image`) |
| GET | `/{id}` | ROLE_FARMER | Detail (owner only) |
| PUT | `/{id}` | ROLE_FARMER | Update (multipart, owner only) |
| DELETE | `/{id}` | ROLE_FARMER | Delete (owner only) |
| PATCH | `/{id}/status` | ROLE_FARMER | Set status to `ACTIVE` / `OUT_OF_STOCK` / `INACTIVE` |

## Orders — `/api/farmer/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ROLE_FARMER | Paginated list, filter by `status` |
| GET | `/history` | ROLE_FARMER | `DELIVERED` / `REJECTED` / `CANCELLED` orders |
| GET | `/{id}` | ROLE_FARMER | Detail incl. line items |
| PATCH | `/{id}/accept` | ROLE_FARMER | `PENDING` → `ACCEPTED` |
| PATCH | `/{id}/reject` | ROLE_FARMER | `PENDING` → `REJECTED` |
| PATCH | `/{id}/ready-for-pickup` | ROLE_FARMER | `ACCEPTED` → `READY_FOR_PICKUP` |

Illegal status transitions return `409 CONFLICT`.

## Analytics — `/api/farmer/analytics`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/summary` | ROLE_FARMER | Total revenue, delivered orders, avg order value, pending orders, active products |
| GET | `/revenue-trend?range=weekly\|monthly` | ROLE_FARMER | Time series for charting |
| GET | `/top-products?limit=5` | ROLE_FARMER | Top products ranked by revenue (delivered orders) |

## Buyer Browse — `/api/buyer`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | ROLE_BUYER | Paginated product search, filter by `search` / `categoryId` / `farmerId` / `organic` |
| GET | `/products/{id}` | ROLE_BUYER | Product detail |
| GET | `/farmers` | ROLE_BUYER | Paginated farmer search, filter by `search` / `nearby` (Haversine distance from the buyer's saved location) |
| GET | `/farmers/{id}` | ROLE_BUYER | Farmer profile as seen by a buyer |

## Buyer Orders — `/api/buyer/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ROLE_BUYER | Place an order for a single farmer: `{ farmerId, items: [{productId, quantity}], deliveryAddress?, expectedDeliveryDate?, notes? }` |
| GET | `/` | ROLE_BUYER | Paginated list of the buyer's own orders, filter by `status` |
| GET | `/{id}` | ROLE_BUYER | Order detail, incl. `deliveryOtp` (populated only while status is `READY_FOR_PICKUP` or `OUT_FOR_DELIVERY`) |

There is no separate cart/checkout endpoint — an order is created with all line items in one call. The frontend cart is client-side only (`localStorage`), scoped to a single farmer at a time.

## Buyer Profile — `/api/buyers/me`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ROLE_BUYER | Get own buyer profile |
| PUT | `/` | ROLE_BUYER | Update profile (business name, delivery address, city/state/pincode, lat/lon, GST number) |

## Reviews — `/api/buyer/reviews`, `/api/farmer/reviews`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/buyer/reviews` | ROLE_BUYER | Rate a completed (`DELIVERED`) order: `{ orderId, rating: 1-5, comment? }` |
| GET | `/api/farmer/reviews` | ROLE_FARMER | Paginated reviews left on the farmer's orders |

## Favorites — `/api/buyer/favorites`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ROLE_BUYER | Paginated list of favorited products |
| POST | `/{productId}` | ROLE_BUYER | Add a product to favorites |
| DELETE | `/{productId}` | ROLE_BUYER | Remove a product from favorites |

## Delivery — `/api/delivery`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/available` | ROLE_DELIVERY | Unclaimed deliveries, oldest first |
| GET | `/mine` | ROLE_DELIVERY | Deliveries claimed by the current agent, filter by `status` |
| GET | `/history` | ROLE_DELIVERY | Completed deliveries, most recent first |
| GET | `/earnings` | ROLE_DELIVERY | Earnings summary (₹30 base + ₹5/km, per completed delivery) |
| GET | `/{id}` | ROLE_DELIVERY | Delivery detail |
| PATCH | `/{id}/claim` | ROLE_DELIVERY | Claim an available delivery |
| PATCH | `/{id}/picked-up` | ROLE_DELIVERY | Mark picked up from the farmer |
| PATCH | `/{id}/complete` | ROLE_DELIVERY | Complete delivery by verifying the buyer's OTP: `{ otp }`. Marks the order `DELIVERED` and payment `COMPLETED`. |

A `Delivery` record (with a generated 4-digit OTP and a Haversine-computed delivery fee) is auto-created the moment a farmer marks an order `READY_FOR_PICKUP` — there's no manual dispatch step.

## Delivery Profile — `/api/delivery/me`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ROLE_DELIVERY | Get own profile (name, email, phone, image) |
| PUT | `/` | ROLE_DELIVERY | Update name/phone |

## Admin — `/api/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/farmers` | ROLE_ADMIN | Paginated farmers, filter by `search` / `verifiedOnly` |
| PATCH | `/farmers/{id}/verify` | ROLE_ADMIN | `{ verified: boolean }` |
| PATCH | `/farmers/{id}/enabled` | ROLE_ADMIN | `{ enabled: boolean }` |
| GET | `/buyers` | ROLE_ADMIN | Paginated buyers, filter by `search` |
| PATCH | `/buyers/{id}/enabled` | ROLE_ADMIN | `{ enabled: boolean }` |
| GET | `/products` | ROLE_ADMIN | Paginated products across all farmers, filter by `search` / `status` |
| PATCH | `/products/{id}/status` | ROLE_ADMIN | `{ status: string }` |
| GET | `/orders` | ROLE_ADMIN | Paginated platform-wide orders, filter by `status` |
| GET | `/deliveries` | ROLE_ADMIN | Paginated platform-wide deliveries, filter by `status` |
| GET | `/analytics/summary` | ROLE_ADMIN | Platform KPIs: farmer/buyer/product counts, orders by status, total revenue |
| GET | `/analytics/revenue-trend?range=weekly\|monthly` | ROLE_ADMIN | Time series for charting |
| GET | `/analytics/top-farmers?limit=5` | ROLE_ADMIN | Top farmers ranked by delivered-order revenue |

## Admin Profile — `/api/admin/me`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ROLE_ADMIN | Get own account details |
| PUT | `/` | ROLE_ADMIN | Update name/phone |

## Notifications — `/api/notifications`

Shared by all four roles — one controller, no role restriction, scoped to the caller via the JWT.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | Paginated, newest first |
| GET | `/unread-count` | JWT | `{ count: number }` |
| PATCH | `/{id}/read` | JWT | Mark one as read |
| PATCH | `/read-all` | JWT | Mark all as read |

## AI — `/api/ai`

Proxies to the ai-service and persists every call as an `AiPrediction` audit row.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/demand-prediction` | ROLE_FARMER | `{ productCategory, region, season? }` → demand forecast |
| POST | `/crop-recommendation` | ROLE_FARMER | `{ soilType, region, season, farmSizeAcres?, waterAvailability? }` → ranked crop suggestions |
| POST | `/price-prediction` | ROLE_FARMER | `{ productName, category, region, quantity, qualityGrade?, currentSeason? }` → price estimate |
| POST | `/disease-detection` | ROLE_FARMER | multipart `image` → detected condition + treatment advice |
| GET | `/weather-alerts?lat=&lon=` | ROLE_FARMER | Alerts for given coords, or the farmer's saved farm location if omitted |
| GET | `/history` | ROLE_FARMER | Paginated past AI predictions for the current farmer |

## AI Service (internal) — `http://localhost:8000`

Called by the backend only; not exposed to the frontend directly. Full contract + interactive testing at `http://localhost:8000/docs`.

| Method | Path |
|---|---|
| POST | `/predict/demand` |
| POST | `/recommend/crop` |
| POST | `/predict/price` |
| POST | `/detect/disease` (multipart) |
| GET | `/alerts/weather?lat=&lon=` |
