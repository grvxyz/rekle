from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# ─── Request: user buat aksi setelah scan ──────────────────
class ActionCreateSchema(BaseModel):
    prediction_id: int
    action_type: str
    route: str                        # "mandiri" | "mitra"
    partner_name: Optional[str] = None
    notes: Optional[str] = None


# ─── Request: admin verifikasi ─────────────────────────────
class ActionVerifySchema(BaseModel):
    status: str                       # "approved" | "rejected"
    notes: Optional[str] = None
    # Diisi jika route = "mitra", estimasi berat sampah dalam gram
    weight_gram: Optional[int] = None


# ─── Response ──────────────────────────────────────────────
class ActionResponse(BaseModel):
    id: int
    action_type: str
    route: Optional[str]
    partner_name: Optional[str]
    notes: Optional[str]
    proof_image_path: Optional[str]
    points_earned: int
    balance_earned: int
    status: str
    verified_by: Optional[int]
    verified_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class ActionWithRewardResponse(BaseModel):
    """Response setelah admin approve — berisi reward lengkap."""
    action: ActionResponse
    total_points: int
    total_balance: int
    new_badges: list[str] = []