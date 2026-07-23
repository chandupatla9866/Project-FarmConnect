from fastapi import APIRouter

from app.ml.crop_recommender import crop_recommender
from app.schemas.crop import CropRecommendationRequest, CropRecommendationResponse

router = APIRouter(prefix="/recommend", tags=["Crop Recommendation"])


@router.post("/crop", response_model=CropRecommendationResponse, response_model_by_alias=True)
def recommend_crop(request: CropRecommendationRequest) -> CropRecommendationResponse:
    return crop_recommender.recommend(request)
