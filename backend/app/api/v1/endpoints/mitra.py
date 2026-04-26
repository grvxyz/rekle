from fastapi import APIRouter

router = APIRouter()

@router.get("/data")
def mitra_data():
    return {
        "message": "Data mitra (belum implementasi)"
    }