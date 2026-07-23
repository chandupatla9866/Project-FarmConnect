from typing import Literal

from pydantic import BaseModel, Field


class DiseaseDetectionResponse(BaseModel):
    detected_condition: str = Field(..., alias="detectedCondition")
    confidence_score: float = Field(..., alias="confidenceScore")
    severity: Literal["none", "low", "medium", "high"]
    recommended_action: str = Field(..., alias="recommendedAction")
    affected_crop_type_guess: str = Field(..., alias="affectedCropTypeGuess")

    model_config = {"populate_by_name": True}
