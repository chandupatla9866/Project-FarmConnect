from fastapi import APIRouter, File, HTTPException, UploadFile

from app.ml.disease_classifier import disease_classifier
from app.schemas.disease import DiseaseDetectionResponse

router = APIRouter(prefix="/detect", tags=["Disease Detection"])

_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/disease", response_model=DiseaseDetectionResponse, response_model_by_alias=True)
async def detect_disease(image: UploadFile = File(...)) -> DiseaseDetectionResponse:
    if image.content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG or WEBP images are supported")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")

    return disease_classifier.classify(image_bytes)
