from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    user,
    admin,
    mitra,
    action, 
    content,
)

api_router = APIRouter()

# Auth
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# User
api_router.include_router(user.router, prefix="/users", tags=["User"])

# Admin
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

# Mitra
api_router.include_router(mitra.router, prefix="/mitra", tags=["Mitra"])

# Actions 
api_router.include_router(action.router)

# Content
api_router.include_router(content.router, prefix="/content", tags=["Content"])