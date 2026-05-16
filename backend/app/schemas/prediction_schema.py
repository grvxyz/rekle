from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class ScanResult(BaseModel):
    """Response dari POST /scan/upload."""
    prediction_id: int
    result: str
    confidence: float
    is_confident: bool
    recommendation: Optional[str]
    all_scores: Dict[str, float]
    image_path: Optional[str] = None

    model_config = {"from_attributes": True}


class ScanHistory(BaseModel):
    """Satu item riwayat scan."""
    id: int
    result: str
    confidence: Optional[float]
    recommendation: Optional[str]
    image_path: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class ScanHistoryList(BaseModel):
    """Response GET /scan/history."""
    total: int
    items: List[ScanHistory]


class ActionConfirmSchema(BaseModel):
    """Request body POST /action/confirm."""
    prediction_id: int
    action_type: str
    partner_name: Optional[str] = None
    notes: Optional[str] = None


# FIX: Hapus duplikasi ActionResponse dari file ini.
# ActionResponse kini hanya ada di schemas/action_schema.py agar tidak konflik.
# ActionConfirmed tetap di sini karena hanya dipakai oleh prediction flow.
class ActionConfirmedResponse(BaseModel):
    """Response lengkap POST /action/confirm."""
    id: int
    action_type: str
    partner_name: Optional[str]
    points_earned: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ActionConfirmed(BaseModel):
    """Response wrapper lengkap."""
    action: ActionConfirmedResponse
    total_points: int
    new_badges: List[str] = []