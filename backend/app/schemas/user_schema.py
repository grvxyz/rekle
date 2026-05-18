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
    phone_number: Optional[str] = Field(None, max_length=20)


# ──────────────────────────────────────────────
# CREATE (REGISTER)
# ──────────────────────────────────────────────
class UserCreate(UserBase):
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
    email: EmailStr
    password: str


# ──────────────────────────────────────────────
# UPDATE PROFILE
# ──────────────────────────────────────────────
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    phone_number: Optional[str] = Field(None, max_length=20)


# ──────────────────────────────────────────────
# RESPONSE
# ──────────────────────────────────────────────
class UserResponse(UserBase):
    id: int
    is_active: bool
    is_superuser: bool  
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