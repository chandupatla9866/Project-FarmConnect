from fastapi import APIRouter

from app.ml.price_predictor import price_predictor
from app.schemas.price import PricePredictionRequest, PricePredictionResponse

router = APIRouter(prefix="/predict", tags=["Price Prediction"])


@router.post("/price", response_model=PricePredictionResponse, response_model_by_alias=True)
def predict_price(request: PricePredictionRequest) -> PricePredictionResponse:
    return price_predictor.predict(request)
