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


class ActionSummary(BaseModel):
    total_actions: int
    action_breakdown: dict
    most_frequent_action: Optional[str]
    total_points_from_actions: int