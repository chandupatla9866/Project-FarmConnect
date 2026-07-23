from fastapi import APIRouter

from app.ml.demand_predictor import demand_predictor
from app.schemas.demand import DemandPredictionRequest, DemandPredictionResponse

router = APIRouter(prefix="/predict", tags=["Demand Prediction"])


@router.post("/demand", response_model=DemandPredictionResponse, response_model_by_alias=True)
def predict_demand(request: DemandPredictionRequest) -> DemandPredictionResponse:
    return demand_predictor.predict(request)
