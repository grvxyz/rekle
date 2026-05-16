from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ActionBase(BaseModel):
    action_type: str
    partner_name: Optional[str] = None
    notes: Optional[str] = None


class ActionCreate(ActionBase):
    prediction_id: Optional[int] = None


class ActionUpdateStatus(BaseModel):
    status: str


# FIX: field disesuaikan dengan models/action.py
# Hapus: scan_id, waste_label, mitra_id, earned_points (tidak ada di DB)
# Tambah: prediction_id, partner_name, points_earned, status
class ActionResponse(BaseModel):
    id: int
    user_id: int
    prediction_id: Optional[int]
    action_type: str
    partner_name: Optional[str]
    notes: Optional[str]
    points_earned: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True  # WAJIB untuk SQLAlchemy


# FIX: field total_points_from_actions (bukan total_points)
class ActionSummary(BaseModel):
    total_actions: int
    action_breakdown: dict
    most_frequent_action: Optional[str]
    total_points_from_actions: int