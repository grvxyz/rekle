from fastapi import APIRouter
from app.api.v1.endpoints import auth, prediction, user, admin, mitra

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(prediction.router, prefix="/predict", tags=["Prediction"])
api_router.include_router(user.router, prefix="/users", tags=["User"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(mitra.router, prefix="/mitra", tags=["Mitra"])