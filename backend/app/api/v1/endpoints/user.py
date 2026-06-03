from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.schemas.user_schema import UserResponse, UserUpdate, UserPublic
from app.api.v1.deps import get_current_user

router = APIRouter()


# ──────────────────────────────────────────────
# GET ME
# ──────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Ambil data user yang sedang login.
    """
    return current_user


# ──────────────────────────────────────────────
# UPDATE ME
# ──────────────────────────────────────────────
@router.put(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update profil user yang sedang login (partial update).
    Hanya field yang dikirim (tidak None) yang akan diubah.
    """
    updatable_fields = ["full_name", "city", "bio", "phone_number"]

    for field in updatable_fields:
        value = getattr(payload, field, None)
        if value is not None:
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


# ──────────────────────────────────────────────
# LEADERBOARD
# ──────────────────────────────────────────────
@router.get(
    "/leaderboard",
    response_model=List[UserPublic],
    status_code=status.HTTP_200_OK,
)
def get_leaderboard(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Kembalikan top N user berdasarkan total_points.
    Menggunakan UserPublic — tidak expose email/bio/phone.
    """
    return (
        db.query(User)
        .filter(User.is_active == True)
        .order_by(User.total_points.desc())
        .limit(limit)
        .all()
    )