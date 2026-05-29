import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.api.v1.deps import get_current_superuser, get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.action import Action
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.action_schema import (
    ActionCreateSchema,
    ActionResponse,
    ActionVerifySchema,
    ActionWithRewardResponse,
)

router = APIRouter(prefix="/actions", tags=["Actions"])


def save_proof(image_bytes: bytes, content_type: str) -> str:
    ext = (content_type or "image/jpeg").split("/")[-1]
    filename = f"proof_{uuid.uuid4().hex}.{ext}"
    proof_dir = os.path.join(settings.upload_dir, "proofs")
    os.makedirs(proof_dir, exist_ok=True)
    filepath = os.path.join(proof_dir, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    return filepath


# ─── 1. User buat aksi setelah scan ────────────────────────
@router.post("/", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
def create_action(
    payload: ActionCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    User memilih jalur aksi setelah melihat rekomendasi scan.
    Status = pending, poin dan saldo belum diberikan.
    """
    if payload.route not in ("mandiri", "mitra"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="route harus 'mandiri' atau 'mitra'",
        )

    action = Action(
        user_id=current_user.id,
        prediction_id=payload.prediction_id,
        action_type=payload.action_type,
        route=payload.route,
        partner_name=payload.partner_name,
        notes=payload.notes,
        status="pending",
        points_earned=0,
        balance_earned=0,
    )
    db.add(action)
    db.commit()
    db.refresh(action)

    return action


# ─── 2. User lihat riwayat aksi ────────────────────────────
@router.get("/", response_model=list[ActionResponse])
def get_my_actions(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Riwayat semua aksi milik user yang sedang login."""
    return (
        db.query(Action)
        .filter(Action.user_id == current_user.id)
        .order_by(Action.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ─── 2.5 User lihat aktivitas terbaru ─────────────────────
@router.get("/activity")
def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Gabungkan riwayat scan + action user.
    Dipakai untuk dashboard activity terbaru.
    """
    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
        .all()
    )

    actions = (
        db.query(Action)
        .filter(Action.user_id == current_user.id)
        .order_by(Action.created_at.desc())
        .limit(limit)
        .all()
    )

    scan_items = [
        {
            "type": "scan",
            "id": p.id,
            "title": f"Scan {p.result}",
            "description": p.recommendation,
            "created_at": p.created_at,
        }
        for p in predictions
    ]

    action_items = [
        {
            "type": "action",
            "id": a.id,
            "title": f"Aksi {a.action_type}",
            "description": (
                getattr(a, "notes", None)
                or f"Status: {a.status}"
            ),
            "created_at": a.created_at,
            "status": getattr(a, "status", None),
            "points_earned": getattr(a, "points_earned", 0) or 0,
        }
        for a in actions
    ]

    merged = sorted(
        scan_items + action_items,
        key=lambda x: x["created_at"],
        reverse=True,
    )

    return merged[:limit]


# ─── 3. Admin: jumlah aksi pending ─────────────────────────
@router.get("/pending/count")
def get_pending_count(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Admin: hitung total aksi yang masih menunggu verifikasi."""
    count = (
        db.query(Action)
        .filter(Action.status == "pending")
        .count()
    )
    return {"count": count}


@router.get("/pending", response_model=list[ActionResponse])
def get_pending_actions(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """Admin: lihat semua aksi yang menunggu verifikasi."""
    return (
        db.query(Action)
        .options(joinedload(Action.user))          # ← sertakan data user sekalian
        .filter(Action.status == "pending")
        .order_by(Action.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
 

# ─── 5. User upload bukti foto ──────────────────────────────
@router.post("/{action_id}/proof", response_model=ActionResponse)
async def upload_proof(
    action_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    User upload foto bukti setelah olah mandiri atau antar ke mitra.
    Status tetap pending, menunggu verifikasi admin.
    """
    action = db.query(Action).filter(
        Action.id == action_id,
        Action.user_id == current_user.id,
    ).first()

    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aksi tidak ditemukan",
        )

    if action.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Aksi sudah berstatus '{action.status}', tidak bisa upload bukti",
        )

    image_bytes = await file.read()
    content_type = file.content_type or "image/jpeg"

    action.proof_image_path = save_proof(image_bytes, content_type)
    db.commit()
    db.refresh(action)
    return action


# ─── 6. Admin verifikasi ────────────────────────────────────
@router.patch("/{action_id}/verify", response_model=ActionWithRewardResponse)
def verify_action(
    action_id: int,
    payload: ActionVerifySchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Admin approve atau reject aksi user.

    Jika rejected → rejection_reason wajib diisi.
    Jika approved:
      - Semua route    → poin aksi (points_per_action = 50)
      - Route 'mitra'  → tambah saldo rupiah berdasarkan berat sampah
                         (weight_gram / 1000 * balance_per_kg)
    """
    if payload.status not in ("approved", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="status harus 'approved' atau 'rejected'",
        )

    if payload.status == "rejected" and not payload.rejection_reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alasan penolakan wajib diisi jika status rejected",
        )

    action = db.query(Action).filter(Action.id == action_id).first()

    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aksi tidak ditemukan",
        )

    if action.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Aksi sudah diverifikasi dengan status '{action.status}'",
        )

    action.status = payload.status
    action.verified_by = current_user.id
    action.verified_at = datetime.now(timezone.utc)
    action.rejection_reason = payload.rejection_reason

    user = db.query(User).filter(User.id == action.user_id).first()

    if payload.status == "approved":
        action.points_earned = settings.points_per_action
        user.total_points = (user.total_points or 0) + settings.points_per_action
        user.action_count = (user.action_count or 0) + 1

        if action.route == "mitra" and payload.weight_gram:
            action.weight_gram = payload.weight_gram  # ← disimpan ke DB
            balance = (payload.weight_gram / 1000) * settings.balance_per_kg
            action.balance_earned = int(balance)
            user.balance = (user.balance or 0) + int(balance)

    db.commit()
    db.refresh(action)

    return ActionWithRewardResponse(
        action=action,
        total_points=user.total_points,
        total_balance=user.balance,
    )


# ─── 7. Detail aktivitas user ─────────────────────────────
@router.get("/activity/{activity_type}/{activity_id}")
def get_activity_detail(
    activity_type: str,
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Detail scan / action untuk modal dashboard.
    """

    # ===== SCAN =====
    if activity_type == "scan":

        prediction = (
            db.query(Prediction)
            .options(joinedload(Prediction.action))
            .filter(
                Prediction.id == activity_id,
                Prediction.user_id == current_user.id,
            )
            .first()
        )

        if not prediction:
            raise HTTPException(
                status_code=404,
                detail="Scan tidak ditemukan",
            )

        return {
            "type": "scan",
            "id": prediction.id,
            "image_path": prediction.image_path,
            "result": prediction.result,
            "confidence": prediction.confidence,
            "recommendation": prediction.recommendation,
            "created_at": prediction.created_at,
            "action": (
                {
                    "id": prediction.action.id,
                    "action_type": prediction.action.action_type,
                    "route": prediction.action.route,
                    "status": prediction.action.status,
                    "points_earned": prediction.action.points_earned,
                    "proof_image_path": prediction.action.proof_image_path,
                    "created_at": prediction.action.created_at,
                }
                if prediction.action
                else None
            ),
        }

    # ===== ACTION =====
    elif activity_type == "action":

        action = (
            db.query(Action)
            .options(joinedload(Action.prediction))
            .filter(
                Action.id == activity_id,
                Action.user_id == current_user.id,
            )
            .first()
        )

        if not action:
            raise HTTPException(
                status_code=404,
                detail="Action tidak ditemukan",
            )

        return {
            "type": "action",
            "id": action.id,
            "action_type": action.action_type,
            "route": action.route,
            "status": action.status,
            "notes": action.notes,
            "points_earned": action.points_earned,
            "balance_earned": action.balance_earned,
            "weight_gram": action.weight_gram,           # ← ditambahkan
            "proof_image_path": action.proof_image_path,
            "rejection_reason": action.rejection_reason,
            "verified_at": action.verified_at,
            "created_at": action.created_at,
            "prediction": (
                {
                    "id": action.prediction.id,
                    "image_path": action.prediction.image_path,
                    "result": action.prediction.result,
                    "confidence": action.prediction.confidence,
                    "recommendation": action.prediction.recommendation,
                }
                if action.prediction
                else None
            ),
        }

    raise HTTPException(
        status_code=400,
        detail="activity_type tidak valid",
    )