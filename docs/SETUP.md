# Setup Guide

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Java | 17+ | [Eclipse Temurin](https://adoptium.net/) recommended |
| Node.js | 20+ | includes npm |
| Python | 3.11+ | includes pip |
| Docker Desktop | latest | for one-command PostgreSQL (optional — see below) |

You do **not** need Maven installed — `backend/mvnw` (the Maven Wrapper) downloads it automatically on first run.

## 1. Database

**Option A — Docker (recommended):**

```bash
docker compose up -d
```

This starts PostgreSQL 16 on `localhost:5432` (db `farmconnect`, user `farmconnect`, password `1234`) and pgAdmin on `http://localhost:5050` (login `admin@farmconnect.ai` / `1234`).

> **Port conflict:** if you already have a PostgreSQL instance running on 5432 (a local install, a Windows/mac service, another project's container), either stop it first or remap the port in `docker-compose.yml` (`"5433:5432"`) and set `DB_PORT=5433` when running the backend.

**Option B — a PostgreSQL instance you already have:** just create a database and point the env vars in `backend/.env.example` at it — the schema is created entirely by Flyway on first boot, no manual DDL needed.

## 2. Backend (Spring Boot)

```bash
cd backend
cp .env.example .env   # then edit values — safe to leave everything blank for local dev
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`. On first boot, Flyway creates the full schema (23 migrations) and seeds demo data automatically — nothing else to run.

**Demo logins** (seeded via Flyway, all passwords documented here since they're demo-only):

| Role | Email | Password |
|---|---|---|
| Farmer | `farmer1@farmconnect.ai` | `Farmer@123` |
| Farmer | `farmer2@farmconnect.ai` | `Farmer@123` |
| Buyer (apartment) | `buyer1@farmconnect.ai` | `Buyer@123` |
| Buyer (restaurant) | `buyer2@farmconnect.ai` | `Buyer@123` |
| Admin | `admin@farmconnect.ai` | `Admin@123` |
| Delivery | `delivery1@farmconnect.ai` | `Delivery@123` |

All four dashboards are implemented — **Farmer**, **Buyer**, **Delivery**, and **Admin** — each behind its own role-gated routes (`/farmer/**`, `/buyer/**`, `/delivery/**`, `/admin/**`). Logging in redirects automatically to the dashboard matching the account's role. There is no public self-registration for the Delivery or Admin roles — use the seeded accounts above.

API docs: `http://localhost:8080/swagger-ui.html`

### Enabling optional integrations

Everything below is optional — the app runs correctly with all of it left blank.

- **Google OAuth2 login**: create an OAuth client at [Google Cloud Console](https://console.cloud.google.com/apis/credentials), authorized redirect URI `http://localhost:8080/login/oauth2/code/google`, then set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. Until set, the "Continue with Google" button leads to a 404 — everything else works via email/password.
- **Cloudinary image uploads**: set `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`. Until set, uploaded product/disease-detection images are stored on local disk under `backend/uploads/` and served from `/uploads/**`.

## 3. AI Service (FastAPI)

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000`, interactive docs at `http://localhost:8000/docs`. The backend calls this service internally — you generally don't call it directly, but the docs page is useful for testing predictions in isolation.

## 4. Frontend (React)

```bash
cd frontend
cp .env.example .env   # defaults already point at localhost:8080
npm install
npm run dev
```

Runs on `http://localhost:5173` (Vite picks the next free port if that's taken — check the terminal output).

## Running everything together

Start in this order: **Postgres → backend → ai-service → frontend**. Each reads its config from environment variables with working local defaults, so once Postgres is up, `./mvnw spring-boot:run`, `uvicorn app.main:app --reload --port 8000`, and `npm run dev` each succeed with zero required setup.

## Troubleshooting

- **"Port 8080 was already in use"** — something else on your machine is bound to it (common on Windows with existing dev services). Set `SERVER_PORT=8081` (backend) and update `VITE_API_BASE_URL`/`VITE_BACKEND_BASE_URL` in `frontend/.env` to match, or free the port.
- **CORS errors in the browser console** — the backend only allows the origin in `FRONTEND_BASE_URL` (default `http://localhost:5173`). If Vite started on a different port (5174, 5175...), set `FRONTEND_BASE_URL` to match before starting the backend.
- **Flyway checksum mismatch** — only happens if a migration file already applied to your DB gets edited afterward. Drop the database and let Flyway recreate it, or `docker compose down -v && docker compose up -d` to reset the Docker volume.
