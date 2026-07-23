from fastapi import APIRouter, Query

from app.ml.weather_provider import weather_provider
from app.schemas.weather import WeatherAlertResponse

router = APIRouter(prefix="/alerts", tags=["Weather Alerts"])


@router.get("/weather", response_model=WeatherAlertResponse, response_model_by_alias=True)
def get_weather_alerts(
        lat: float = Query(..., description="Latitude of the farm"),
        lon: float = Query(..., description="Longitude of the farm"),
) -> WeatherAlertResponse:
    return weather_provider.get_alerts(lat, lon)
