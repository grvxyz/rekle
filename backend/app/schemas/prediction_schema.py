from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class Top2Prediction(BaseModel):
    """Satu item dari top-2 prediksi (sesuai notebook)."""
    label: str
    confidence: float


class UpcycleIdea(BaseModel):
    """Satu ide upcycling."""
    id: int
    title: str
    description: str


class ScanResult(BaseModel):
    """Response dari POST /scan/upload."""
    prediction_id: int
    result: str
    confidence: float
    is_confident: bool
    recommendation: Optional[str]
    all_scores: Dict[str, float]
    image_path: Optional[str] = None
    top2: List[Top2Prediction] = []
    points_earned: int = 0
    upcycle_ideas: List[UpcycleIdea] = []  # ← ditambahkan

    model_config = {"from_attributes": True}


class ScanHistory(BaseModel):
    """Satu item riwayat scan."""
    id: int
    user_id: int                  # dipakai DataSampah.jsx → tampil sebagai User #id
    result: str
    confidence: Optional[float]
    is_confident: Optional[bool]  # dipakai DataSampah.jsx → status AI (Akurat/Kurang Yakin)
    recommendation: Optional[str]
    image_path: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class ScanHistoryList(BaseModel):
    """Response GET /scan/history dan GET /admin/scans."""
    total: int
    items: List[ScanHistory]


class ActionConfirmSchema(BaseModel):
    """Request body POST /action/confirm."""
    prediction_id: int
    action_type: str
    partner_name: Optional[str] = None
    notes: Optional[str] = None


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