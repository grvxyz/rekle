from fastapi import APIRouter, UploadFile, File
from app.services.model_service import predict_image

router = APIRouter()

@router.post("/")
async def predict(file: UploadFile = File(...)):
    result = await predict_image(file)
    return result