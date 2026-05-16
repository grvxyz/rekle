from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user_schema import UserResponse, UserUpdate
from app.api.v1.deps import get_current_user

router = APIRouter()


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