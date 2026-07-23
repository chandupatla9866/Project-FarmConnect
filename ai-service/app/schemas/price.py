from typing import Optional

from pydantic import BaseModel, Field


class PricePredictionRequest(BaseModel):
    product_name: str = Field(..., alias="productName")
    category: str
    region: str
    quantity: float
    quality_grade: Optional[str] = Field(default="regular", alias="qualityGrade")
    current_season: Optional[str] = Field(default=None, alias="currentSeason")

    model_config = {"populate_by_name": True}


class PricePredictionResponse(BaseModel):
    predicted_price_per_unit: float = Field(..., alias="predictedPricePerUnit")
    price_range_min: float = Field(..., alias="priceRangeMin")
    price_range_max: float = Field(..., alias="priceRangeMax")
    market_factors_considered: list[str] = Field(..., alias="marketFactorsConsidered")
    confidence_score: float = Field(..., alias="confidenceScore")

    model_config = {"populate_by_name": True}
