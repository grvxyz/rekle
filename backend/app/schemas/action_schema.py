from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# ─── Request: user buat aksi setelah scan ──────────────────
class ActionCreateSchema(BaseModel):
    prediction_id: int
    action_type: str
    route: str                              # "mandiri" | "mitra"
    partner_name: Optional[str] = None
    notes: Optional[str] = None


# ─── Request: admin verifikasi ─────────────────────────────
class ActionVerifySchema(BaseModel):
    status: str                             # "approved" | "rejected"
    rejection_reason: Optional[str] = None  # wajib diisi jika status = "rejected"
    weight_gram: Optional[int] = None       # diisi jika route = "mitra" + approved


# ─── Embed minimal data user ────────────────────────────────
class UserMinimal(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: str
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Response ──────────────────────────────────────────────
class ActionResponse(BaseModel):
    id: int
    user_id: int
    user: Optional[UserMinimal] = None      # ← embed data user, diisi saat joinedload
    action_type: str
    route: Optional[str] = None
    partner_name: Optional[str] = None
    notes: Optional[str] = None
    proof_image_path: Optional[str] = None
    points_earned: int
    balance_earned: int
    weight_gram: Optional[int] = None
    status: str
    rejection_reason: Optional[str] = None
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ActionWithRewardResponse(BaseModel):
    """Response setelah admin approve — berisi reward lengkap."""
    action: ActionResponse
    total_points: int
    total_balance: int
    new_badges: list[str] = []