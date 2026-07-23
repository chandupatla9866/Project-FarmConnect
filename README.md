# FarmConnect AI

AI-powered agritech platform connecting farmers directly with apartment communities and restaurants, cutting out middlemen. Final-year CS engineering project.

## Monorepo layout

```
backend/      Spring Boot 3 REST API (Java 17, PostgreSQL, Spring Security, JWT + Google OAuth2)
frontend/     React 18 + TypeScript + Tailwind + Framer Motion SPA
ai-service/   Python FastAPI microservice (demand/crop/price prediction, disease detection, weather alerts)
docs/         Setup, architecture and API documentation
docker-compose.yml   Local PostgreSQL + pgAdmin
```

## Status

All four dashboards are built end to end on the full relational schema: **Farmer** (products, orders, analytics, AI tools), **Buyer** (browse/search farmers & products, cart + checkout, order tracking, reviews, favorites), **Delivery** (claim pickups, OTP-verified drop-off, earnings), and **Admin** (farmer/buyer/product moderation, platform-wide orders & deliveries, analytics) — plus auth (JWT + Google OAuth2 scaffold) and the public landing page.

See [docs/SETUP.md](docs/SETUP.md) to run everything locally, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system design, and [docs/API.md](docs/API.md) for the REST contract.

## Quick start

```bash
# 1. Start Postgres + pgAdmin (or point at a Postgres instance you already have — see docs/SETUP.md)
docker compose up -d

# 2. Backend (http://localhost:8080)
cd backend
./mvnw spring-boot:run

# 3. AI service (http://localhost:8000, docs at /docs)
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 4. Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Demo logins (all seeded via Flyway):

| Role | Email | Password |
|---|---|---|
| Farmer | `farmer1@farmconnect.ai` | `Farmer@123` |
| Buyer | `buyer1@farmconnect.ai` | `Buyer@123` |
| Delivery | `delivery1@farmconnect.ai` | `Delivery@123` |
| Admin | `admin@farmconnect.ai` | `Admin@123` |

Full details, including the second farmer/buyer demo accounts, are in [docs/SETUP.md](docs/SETUP.md).
