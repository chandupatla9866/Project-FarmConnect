import json
from abc import ABC, abstractmethod
from datetime import datetime

from app.core.config import DATA_DIR
from app.schemas.demand import DemandPredictionRequest, DemandPredictionResponse

with open(DATA_DIR / "sales_history.json") as f:
    _BASELINE_DEMAND = json.load(f)

# Multiplier applied per month (1-12) relative to an "average" month; a stand-in
# for a real seasonality model trained on historical order data.
_SEASONALITY_BY_MONTH = {
    1: 0.95, 2: 0.97, 3: 1.05, 4: 1.10, 5: 1.15, 6: 1.05,
    7: 0.90, 8: 0.92, 9: 1.00, 10: 1.08, 11: 1.12, 12: 1.10,
}


class DemandPredictor(ABC):
    """Swap point for a real trained forecasting model (e.g. Prophet, LSTM)."""

    @abstractmethod
    def predict(self, request: DemandPredictionRequest) -> DemandPredictionResponse:
        raise NotImplementedError


class HeuristicDemandPredictor(DemandPredictor):
    """Weighted moving average over recent sales, scaled by a seasonality factor."""

    def predict(self, request: DemandPredictionRequest) -> DemandPredictionResponse:
        baseline = self._baseline(request)
        seasonality_factor = _SEASONALITY_BY_MONTH.get(datetime.utcnow().month, 1.0)

        if request.historical_sales_last_30_days:
            points = request.historical_sales_last_30_days
            weights = list(range(1, len(points) + 1))
            weighted_sum = sum(p.quantity * w for p, w in zip(points, weights))
            recent_avg = weighted_sum / sum(weights)
            predicted = recent_avg * 7 * seasonality_factor
            trend = self._trend_from_history(points)
            confidence = min(95.0, 60.0 + len(points) * 1.0)
        else:
            predicted = baseline * seasonality_factor
            trend = "increasing" if seasonality_factor > 1.02 else "decreasing" if seasonality_factor < 0.98 else "stable"
            confidence = 55.0

        explanation = (
            f"Estimated from {'30-day order history' if request.historical_sales_last_30_days else 'category baseline demand'} "
            f"for {request.product_category} in {request.region}, adjusted by a seasonality factor of {seasonality_factor:.2f} "
            f"for the current month."
        )

        return DemandPredictionResponse(
            predictedDemandNextWeek=round(predicted, 1),
            unit="KG",
            trend=trend,
            confidenceScore=round(confidence, 1),
            seasonalityFactor=seasonality_factor,
            explanation=explanation,
        )

    def _baseline(self, request: DemandPredictionRequest) -> float:
        return _BASELINE_DEMAND.get(request.product_category, _BASELINE_DEMAND["default"])

    def _trend_from_history(self, points) -> str:
        if len(points) < 2:
            return "stable"
        midpoint = len(points) // 2
        first_half_avg = sum(p.quantity for p in points[:midpoint]) / max(midpoint, 1)
        second_half_avg = sum(p.quantity for p in points[midpoint:]) / max(len(points) - midpoint, 1)
        if second_half_avg > first_half_avg * 1.08:
            return "increasing"
        if second_half_avg < first_half_avg * 0.92:
            return "decreasing"
        return "stable"


demand_predictor: DemandPredictor = HeuristicDemandPredictor()
