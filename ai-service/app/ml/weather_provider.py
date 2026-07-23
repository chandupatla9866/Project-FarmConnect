import random
from abc import ABC, abstractmethod
from datetime import date, timedelta

import httpx

from app.core.config import settings
from app.schemas.weather import WeatherAlertItem, WeatherAlertResponse

_CONDITIONS = ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain", "Humid"]

_ALERT_TEMPLATES = [
    ("HEAVY_RAIN", "high", "Heavy rainfall expected in the next 48 hours. Secure harvested stock and delay pesticide spraying."),
    ("HEAT_WAVE", "high", "Heat wave warning: temperatures may exceed 40°C. Increase irrigation frequency for young crops."),
    ("STORM", "medium", "Thunderstorm activity forecast this week. Avoid field work during storm windows."),
    ("HIGH_HUMIDITY", "medium", "High humidity levels may increase fungal disease risk. Monitor crops closely."),
]


class WeatherProvider(ABC):
    """Swap point for a real provider (e.g. OpenWeatherMap) once WEATHER_API_KEY is set."""

    @abstractmethod
    def get_alerts(self, lat: float, lon: float) -> WeatherAlertResponse:
        raise NotImplementedError


class SyntheticWeatherProvider(WeatherProvider):
    """
    Derives deterministic pseudo-random weather from (rounded lat/lon, current date)
    so the same location returns consistent results within a day, without calling
    any external API. Behind the same interface a real provider would implement.
    """

    def get_alerts(self, lat: float, lon: float) -> WeatherAlertResponse:
        seed = f"{round(lat, 1)}:{round(lon, 1)}:{date.today().isoformat()}"
        rng = random.Random(seed)

        condition = rng.choice(_CONDITIONS)
        temp = round(rng.uniform(22.0, 38.0), 1)
        humidity = round(rng.uniform(40.0, 90.0), 1)

        alerts = []
        if rng.random() < 0.55:
            alert_type, severity, message = rng.choice(_ALERT_TEMPLATES)
            valid_until = (date.today() + timedelta(days=rng.randint(1, 3))).isoformat()
            alerts.append(WeatherAlertItem(type=alert_type, severity=severity, message=message, validUntil=valid_until))

        forecast_summary = (
            f"Expect mostly {condition.lower()} conditions over the next few days with temperatures "
            f"around {temp}°C and humidity near {humidity}%."
        )

        return WeatherAlertResponse(
            region=f"Lat {round(lat, 2)}, Lon {round(lon, 2)}",
            currentCondition=condition,
            tempCelsius=temp,
            humidityPercent=humidity,
            alerts=alerts,
            forecastSummary=forecast_summary,
        )


class OpenWeatherMapProvider(WeatherProvider):
    """Real current-conditions data from OpenWeatherMap's free Current Weather endpoint.
    That endpoint doesn't include an "alerts" feed on the free tier (that needs the paid
    One Call API), so alerts here are derived from real temp/condition/humidity thresholds
    rather than being pseudo-random - still genuinely data-driven, just not a raw passthrough.
    """

    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self._fallback = SyntheticWeatherProvider()

    def get_alerts(self, lat: float, lon: float) -> WeatherAlertResponse:
        try:
            response = httpx.get(
                self.BASE_URL,
                params={"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"},
                timeout=5.0,
            )
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError:
            return self._fallback.get_alerts(lat, lon)

        condition = data["weather"][0]["main"]
        description = data["weather"][0]["description"]
        temp = round(data["main"]["temp"], 1)
        humidity = round(data["main"]["humidity"], 1)
        region = data.get("name") or f"Lat {round(lat, 2)}, Lon {round(lon, 2)}"

        forecast_summary = f"Currently {description} with temperatures around {temp}°C and humidity near {humidity}%."

        return WeatherAlertResponse(
            region=region,
            currentCondition=condition,
            tempCelsius=temp,
            humidityPercent=humidity,
            alerts=self._derive_alerts(condition, temp, humidity),
            forecastSummary=forecast_summary,
        )

    @staticmethod
    def _derive_alerts(condition: str, temp: float, humidity: float) -> list[WeatherAlertItem]:
        alerts: list[WeatherAlertItem] = []
        valid_until = (date.today() + timedelta(days=2)).isoformat()
        condition_lower = condition.lower()

        if temp >= 40:
            alerts.append(WeatherAlertItem(
                type="HEAT_WAVE", severity="high",
                message="Heat wave warning: temperatures may exceed 40°C. Increase irrigation frequency for young crops.",
                validUntil=valid_until,
            ))
        if "thunderstorm" in condition_lower:
            alerts.append(WeatherAlertItem(
                type="STORM", severity="medium",
                message="Thunderstorm activity forecast. Avoid field work during storm windows.",
                validUntil=valid_until,
            ))
        elif "rain" in condition_lower or "drizzle" in condition_lower:
            alerts.append(WeatherAlertItem(
                type="HEAVY_RAIN", severity="high",
                message="Rainfall expected. Secure harvested stock and delay pesticide spraying.",
                validUntil=valid_until,
            ))
        if humidity >= 85:
            alerts.append(WeatherAlertItem(
                type="HIGH_HUMIDITY", severity="medium",
                message="High humidity levels may increase fungal disease risk. Monitor crops closely.",
                validUntil=valid_until,
            ))
        return alerts


def _build_weather_provider() -> WeatherProvider:
    if settings.weather_api_key:
        return OpenWeatherMapProvider(settings.weather_api_key)
    return SyntheticWeatherProvider()


weather_provider: WeatherProvider = _build_weather_provider()
