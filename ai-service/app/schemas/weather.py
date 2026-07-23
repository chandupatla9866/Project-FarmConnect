from pydantic import BaseModel, Field


class WeatherAlertItem(BaseModel):
    type: str
    severity: str
    message: str
    valid_until: str = Field(..., alias="validUntil")

    model_config = {"populate_by_name": True}


class WeatherAlertResponse(BaseModel):
    region: str
    current_condition: str = Field(..., alias="currentCondition")
    temp_celsius: float = Field(..., alias="tempCelsius")
    humidity_percent: float = Field(..., alias="humidityPercent")
    alerts: list[WeatherAlertItem]
    forecast_summary: str = Field(..., alias="forecastSummary")

    model_config = {"populate_by_name": True}
