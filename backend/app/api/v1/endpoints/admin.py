from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.api.v1.deps import get_current_superuser
from app.db.session import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.models.action import Action
from app.schemas.user_schema import UserResponse

router = APIRouter()


# ─── Dashboard ─────────────────────────────────────────────

@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),  # proteksi superuser
):
    """
    Ringkasan statistik keseluruhan platform.
    Hanya bisa diakses oleh superuser.
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_scans = db.query(func.count(Prediction.id)).scalar()
    total_actions = db.query(func.count(Action.id)).scalar()
    total_points = db.query(func.sum(User.total_points)).scalar() or 0

    # Top 5 kategori sampah terbanyak discan
    top_categories = (
        db.query(Prediction.result, func.count(Prediction.id).label("count"))
        .group_by(Prediction.result)
        .order_by(func.count(Prediction.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total_users":   total_users,
        "total_scans":   total_scans,
        "total_actions": total_actions,
        "total_points_distributed": total_points,
        "top_categories": [
            {"category": r, "count": c} for r, c in top_categories
        ],
    }


# ─── User management ───────────────────────────────────────

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Daftar semua user terdaftar."""
    return db.query(User).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Aktifkan atau nonaktifkan akun user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/set-superuser", response_model=UserResponse)
def set_superuser(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_superuser),
):
    """Jadikan user sebagai superuser."""
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tidak bisa mengubah status diri sendiri",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    user.is_superuser = True
    db.commit()
    db.refresh(user)
    return user


# ─── Analytics ─────────────────────────────────────────────

@router.get("/analytics/scans")
def scan_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Statistik scan per kategori dan per rekomendasi."""
    by_category = (
        db.query(Prediction.result, func.count(Prediction.id).label("count"))
        .group_by(Prediction.result)
        .order_by(func.count(Prediction.id).desc())
        .all()
    )
    by_recommendation = (
        db.query(Prediction.recommendation, func.count(Prediction.id).label("count"))
        .group_by(Prediction.recommendation)
        .order_by(func.count(Prediction.id).desc())
        .all()
    )
    return {
        "by_category": [
            {"category": r, "count": c} for r, c in by_category
        ],
        "by_recommendation": [
            {"recommendation": r, "count": c} for r, c in by_recommendation
        ],
    }


@router.get("/analytics/actions")
def action_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Statistik aksi nyata yang dilakukan user."""
    by_type = (
        db.query(Action.action_type, func.count(Action.id).label("count"))
        .group_by(Action.action_type)
        .order_by(func.count(Action.id).desc())
        .all()
    )
    total_points = db.query(func.sum(Action.points_earned)).scalar() or 0

    return {
        "by_action_type": [
            {"action_type": t, "count": c} for t, c in by_type
        ],
        "total_points_from_actions": total_points,
    }