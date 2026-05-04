from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    prediction,
    user,
    admin,
    mitra,
    action,  # ✅ tambahin ini
)

api_router = APIRouter()

# Auth
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# Prediction
api_router.include_router(prediction.router, prefix="/predict", tags=["Prediction"])

# User
api_router.include_router(user.router, prefix="/users", tags=["User"])

# Admin
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

# Mitra
api_router.include_router(mitra.router, prefix="/mitra", tags=["Mitra"])

# 🔥 Actions (INI YANG KURANG TADI)
api_router.include_router(action.router)