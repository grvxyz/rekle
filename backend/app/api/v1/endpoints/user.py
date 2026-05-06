from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

from app.db.session import get_db
from app.models.user import User
from app.schemas.user_schema import UserResponse
from app.schemas.user_schema import UserUpdate  
from app.core.security import get_subject_from_token

router = APIRouter()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK
)
def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """
    Ambil data user yang sedang login
    """


    user_id = get_subject_from_token(token, token_type="access")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau expired",
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan",
        )

    return user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    # 🔐 ambil user dari token
    user_id = get_subject_from_token(token, token_type="access")

    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    # ✏️ update field (partial update aman)
    if payload.full_name is not None:
        user.full_name = payload.full_name

    if payload.city is not None:
        user.city = payload.city

    if payload.bio is not None:
        user.bio = payload.bio

    if payload.phone_number is not None:
        user.phone_number = payload.phone_number

    db.commit()
    db.refresh(user)

    return user