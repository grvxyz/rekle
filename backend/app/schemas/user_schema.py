from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ──────────────────────────────────────────────
# BASE
# ──────────────────────────────────────────────
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None

    # ✅ TAMBAHAN
    phone_number: Optional[str] = Field(None, max_length=20)


# ──────────────────────────────────────────────
# CREATE (REGISTER)
# ──────────────────────────────────────────────
class UserCreate(UserBase):
    """Body POST /auth/register."""
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        return v


# ──────────────────────────────────────────────
# LOGIN
# ──────────────────────────────────────────────
class UserLogin(BaseModel):
    """Body POST /auth/login."""
    email: EmailStr
    password: str


# ──────────────────────────────────────────────
# UPDATE PROFILE
# ──────────────────────────────────────────────
class UserUpdate(BaseModel):
    """Body PATCH /users/me."""
    full_name: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

    # ✅ TAMBAHAN
    phone_number: Optional[str] = Field(None, max_length=20)


# ──────────────────────────────────────────────
# RESPONSE (PRIVATE USER)
# ──────────────────────────────────────────────
class UserResponse(UserBase):
    """Data user yang aman dikirim ke client."""
    id: int
    is_active: bool
    total_points: int
    scan_count: int
    action_count: int
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# PUBLIC (LEADERBOARD)
# ──────────────────────────────────────────────
class UserPublic(BaseModel):
    """Data minimal untuk leaderboard / profil publik."""
    id: int
    full_name: Optional[str] = None
    city: Optional[str] = None
    total_points: int
    scan_count: int
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}