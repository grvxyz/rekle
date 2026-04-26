from fastapi import APIRouter

router = APIRouter()

@router.get("/me")
def get_current_user():
    return {
        "id": 1,
        "name": "User Dummy",
        "points": 0
    }

@router.get("/history")
def get_history():
    return {
        "message": "History user (belum implementasi)"
    }