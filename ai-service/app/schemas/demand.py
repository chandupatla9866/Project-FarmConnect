from typing import Literal, Optional

from pydantic import BaseModel, Field


class SalesPoint(BaseModel):
    date: str
    quantity: float


class DemandPredictionRequest(BaseModel):
    product_category: str = Field(..., alias="productCategory")
    region: str
    season: Optional[str] = None
    historical_sales_last_30_days: Optional[list[SalesPoint]] = Field(default=None, alias="historicalSalesLast30Days")

    model_config = {"populate_by_name": True}


class DemandPredictionResponse(BaseModel):
    predicted_demand_next_week: float = Field(..., alias="predictedDemandNextWeek")
    unit: str
    trend: Literal["increasing", "stable", "decreasing"]
    confidence_score: float = Field(..., alias="confidenceScore")
    seasonality_factor: float = Field(..., alias="seasonalityFactor")
    explanation: str

    model_config = {"populate_by_name": True}
