from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.v1.deps import get_current_user
from app.models.user import User
from app.services.model_service import predict_image

router = APIRouter()


@router.post("/")
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),  # wajib login
):
    """
    Upload gambar sampah → hasil klasifikasi AI + rekomendasi aksi.

    - Gunakan endpoint ini untuk scan cepat tanpa simpan ke DB
    - Untuk scan yang tersimpan ke histori, gunakan POST /scan/upload
    """
    result = await predict_image(file)

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=result.get("error", "Gagal memproses gambar"),
        )

    return result