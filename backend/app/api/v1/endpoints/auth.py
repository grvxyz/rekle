from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    get_subject_from_token,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth_schema import RefreshRequest, TokenPair
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse

router = APIRouter()


# ─────────────────────────────
# REGISTER (FIX FINAL)
# ─────────────────────────────
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        phone_number=payload.phone_number,
        city=payload.city,   # ✅ FIX
        bio=payload.bio,     # ✅ FIX
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ─────────────────────────────
# LOGIN
# ─────────────────────────────
@router.post("/login", response_model=TokenPair)
def login(payload: UserLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    return TokenPair(
        access_token=create_access_token(subject=str(user.id)),
        refresh_token=create_refresh_token(subject=str(user.id)),
    )