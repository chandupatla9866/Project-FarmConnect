from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import crop, demand, disease, price, weather

app = FastAPI(
    title="FarmConnect AI - AI Service",
    description="Heuristic-backed prediction service for demand, crop recommendation, "
                "price prediction, disease detection and weather alerts. Each model sits "
                "behind a swappable interface in app/ml/ so real trained models can be "
                "dropped in later without changing these endpoint contracts.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(demand.router)
app.include_router(crop.router)
app.include_router(price.router)
app.include_router(disease.router)
app.include_router(weather.router)


@app.get("/", tags=["Health"])
def root():
    return {"service": "farmconnect-ai-service", "status": "ok"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
