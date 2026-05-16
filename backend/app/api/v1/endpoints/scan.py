import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.ml.classifier import predict
from app.ml.preprocessor import validate_image
from app.ml.recommendation import get_recommendation
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction_schema import ScanHistory, ScanHistoryList, ScanResult
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/scan", tags=["scan"])


# ─── Helper: simpan gambar ke disk ─────────────────────────

def save_image(image_bytes: bytes, content_type: str) -> str:
    """Simpan gambar ke UPLOAD_DIR, kembalikan path relatif."""
    ext = content_type.split("/")[-1]  # jpeg | png | webp
    filename = f"{uuid.uuid4().hex}.{ext}"
    os.makedirs(settings.upload_dir, exist_ok=True)
    filepath = os.path.join(settings.upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    return filepath


# ─── Endpoints ─────────────────────────────────────────────

@router.post("/upload", response_model=ScanResult, status_code=status.HTTP_201_CREATED)
async def upload_and_scan(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload gambar sampah → klasifikasi AI → kembalikan hasil + rekomendasi.

    - Validasi file (tipe, ukuran)
    - Jalankan model MobileNetV2
    - Simpan hasil ke tabel predictions
    - Update scan_count dan poin user
    """
    image_bytes = await file.read()
    content_type = file.content_type or "image/jpeg"

    # 1. Validasi
    is_valid, error_msg = validate_image(image_bytes, content_type)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=error_msg)

    # 2. Simpan gambar
    image_path = save_image(image_bytes, content_type)

    # 3. Inferensi ML
    try:
        label, confidence, all_scores, is_confident = predict(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses gambar: {str(e)}",
        )

    # 4. Rekomendasi aksi
    recommendation = get_recommendation(label)

    # 5. Simpan ke DB
    prediction = Prediction(
        user_id=current_user.id,
        result=label,
        confidence=confidence,
        is_confident=is_confident,
        recommendation=recommendation,
        image_path=image_path,
        raw_output=str(all_scores),
    )
    db.add(prediction)

    # 6. Update statistik user
    # FIX: tambah guard (or 0) agar konsisten dan aman untuk data lama yang mungkin NULL
    current_user.scan_count = (current_user.scan_count or 0) + 1
    current_user.total_points = (current_user.total_points or 0) + settings.points_per_scan

    db.commit()
    db.refresh(prediction)

    return ScanResult(
        prediction_id=prediction.id,
        result=label,
        confidence=confidence,
        is_confident=is_confident,
        recommendation=recommendation,
        all_scores=all_scores,
        image_path=image_path,
    )


@router.get("/history", response_model=ScanHistoryList)
def get_scan_history(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Riwayat scan milik user yang sedang login."""
    total = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .count()
    )
    items = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return ScanHistoryList(total=total, items=items)


@router.get("/{prediction_id}", response_model=ScanResult)
def get_scan_detail(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Detail satu hasil scan berdasarkan ID."""
    prediction = (
        db.query(Prediction)
        .filter(
            Prediction.id == prediction_id,
            Prediction.user_id == current_user.id,
        )
        .first()
    )
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan tidak ditemukan")

    return ScanResult(
        prediction_id=prediction.id,
        result=prediction.result,
        confidence=prediction.confidence,
        is_confident=prediction.is_confident,
        recommendation=prediction.recommendation,
        all_scores={},
        image_path=prediction.image_path,
    )