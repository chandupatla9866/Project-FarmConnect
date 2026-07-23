import json
from abc import ABC, abstractmethod

from app.core.config import DATA_DIR
from app.schemas.price import PricePredictionRequest, PricePredictionResponse

with open(DATA_DIR / "price_base_table.json") as f:
    _BASE_PRICES = json.load(f)

_SEASON_MULTIPLIER = {
    "summer": 1.08,
    "winter": 0.95,
    "monsoon": 1.15,
    "autumn": 1.0,
    "spring": 0.98,
}


class PricePredictor(ABC):
    """Swap point for a real trained regression model."""

    @abstractmethod
    def predict(self, request: PricePredictionRequest) -> PricePredictionResponse:
        raise NotImplementedError


class LinearFormulaPricePredictor(PricePredictor):
    """base price x organic multiplier x seasonality factor, minus a quantity discount curve."""

    def predict(self, request: PricePredictionRequest) -> PricePredictionResponse:
        base_price = _BASE_PRICES.get(request.category, _BASE_PRICES["default"])

        organic_multiplier = 1.18 if (request.quality_grade or "").lower() == "organic" else 1.0
        season_key = (request.current_season or "").strip().lower()
        seasonality_multiplier = _SEASON_MULTIPLIER.get(season_key, 1.0)

        # Bulk discount: -1% per 10 units ordered, capped at -15%.
        quantity_discount = min(0.15, (request.quantity // 10) * 0.01)

        predicted = base_price * organic_multiplier * seasonality_multiplier * (1 - quantity_discount)
        price_min = predicted * 0.9
        price_max = predicted * 1.12

        factors = ["category baseline price"]
        if organic_multiplier > 1.0:
            factors.append("organic premium")
        if seasonality_multiplier != 1.0:
            factors.append("seasonal demand")
        if quantity_discount > 0:
            factors.append("bulk quantity discount")

        return PricePredictionResponse(
            predictedPricePerUnit=round(predicted, 2),
            priceRangeMin=round(price_min, 2),
            priceRangeMax=round(price_max, 2),
            marketFactorsConsidered=factors,
            confidenceScore=72.0,
        )


price_predictor: PricePredictor = LinearFormulaPricePredictor()
