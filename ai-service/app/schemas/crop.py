from typing import Optional

from pydantic import BaseModel, Field


class CropRecommendationRequest(BaseModel):
    soil_type: str = Field(..., alias="soilType")
    region: str
    season: str
    farm_size_acres: Optional[float] = Field(default=None, alias="farmSizeAcres")
    water_availability: Optional[str] = Field(default=None, alias="waterAvailability")

    model_config = {"populate_by_name": True}


class CropSuggestion(BaseModel):
    crop_name: str = Field(..., alias="cropName")
    suitability_score: float = Field(..., alias="suitabilityScore")
    expected_yield_per_acre: float = Field(..., alias="expectedYieldPerAcre")
    expected_market_price_per_unit: float = Field(..., alias="expectedMarketPricePerUnit")
    reason: str

    model_config = {"populate_by_name": True}


class CropRecommendationResponse(BaseModel):
    recommended_crops: list[CropSuggestion] = Field(..., alias="recommendedCrops")
    generated_at: str = Field(..., alias="generatedAt")

    model_config = {"populate_by_name": True}
