import json
from abc import ABC, abstractmethod
from datetime import datetime, timezone

from app.core.config import DATA_DIR
from app.schemas.crop import CropRecommendationRequest, CropRecommendationResponse, CropSuggestion

with open(DATA_DIR / "crop_rules.json") as f:
    _CROP_RULES = json.load(f)


class CropRecommender(ABC):
    """Swap point for a real trained recommendation model."""

    @abstractmethod
    def recommend(self, request: CropRecommendationRequest) -> CropRecommendationResponse:
        raise NotImplementedError


class RuleBasedCropRecommender(CropRecommender):
    """Lookup table keyed by soil type and season, ranked by static suitability score."""

    def recommend(self, request: CropRecommendationRequest) -> CropRecommendationResponse:
        key = f"{request.soil_type.strip().lower()}|{request.season.strip().lower()}"
        rules = _CROP_RULES.get(key, _CROP_RULES["default"])

        suggestions = [
            CropSuggestion(
                cropName=r["cropName"],
                suitabilityScore=r["suitabilityScore"],
                expectedYieldPerAcre=r["expectedYieldPerAcre"],
                expectedMarketPricePerUnit=r["expectedMarketPricePerUnit"],
                reason=r["reason"],
            )
            for r in rules
        ]

        return CropRecommendationResponse(
            recommendedCrops=suggestions,
            generatedAt=datetime.now(timezone.utc).isoformat(),
        )


crop_recommender: CropRecommender = RuleBasedCropRecommender()
