from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.user import User
from app.models.action import Action
from app.schemas.action_schema import ActionCreate, ActionResponse, ActionSummary
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/actions", tags=["Actions"])


# ──────────────────────────────────────────────
# POST /actions/
# ──────────────────────────────────────────────
@router.post(
    "/",
    response_model=ActionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log user action after scan",
)
def create_action(
    payload: ActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    points_map = {
        "kompos": 10,
        "bank_sampah": 20,
        "daur_ulang": 15,
        "eco_brick": 15,
        "reuse": 10,
        "tidak_layak": 5,
        "khusus": 10,
    }

    earned_points = points_map.get(payload.action_type, 5)

    # FIX 1: Hapus id=uuid (id adalah Integer autoincrement di DB, bukan UUID string)
    # FIX 2: Pakai field yang benar sesuai models/action.py:
    #         prediction_id, partner_name, points_earned, status
    #         Hapus: scan_id, waste_label, mitra_id yang tidak ada di model
    # FIX 3: Simpan earned_points ke kolom points_earned di DB
    action = Action(
        user_id=current_user.id,
        prediction_id=payload.prediction_id,
        action_type=payload.action_type,
        partner_name=payload.partner_name,
        notes=payload.notes,
        points_earned=earned_points,  # FIX 3: sebelumnya tidak disimpan ke DB
        status="confirmed",
    )

    db.add(action)

    # Tambah poin ke user
    current_user.total_points = (current_user.total_points or 0) + earned_points

    # FIX 5: Increment action_count (sebelumnya tidak pernah di-update)
    current_user.action_count = (current_user.action_count or 0) + 1

    db.commit()
    db.refresh(action)

    return action


# ──────────────────────────────────────────────
# GET /actions/
# ──────────────────────────────────────────────
@router.get(
    "/",
    response_model=List[ActionResponse],
    summary="Get current user action history",
)
def get_my_actions(
    skip: int = 0,
    limit: int = 20,
    action_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Action).filter(Action.user_id == current_user.id)

    if action_type:
        query = query.filter(Action.action_type == action_type)

    actions = (
        query.order_by(Action.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return actions


# ──────────────────────────────────────────────
# GET /actions/summary
# ──────────────────────────────────────────────
@router.get(
    "/summary",
    response_model=ActionSummary,
    summary="Get summary of user actions",
)
def get_action_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    actions = (
        db.query(Action)
        .filter(Action.user_id == current_user.id)
        .all()
    )

    summary: dict = {}
    total_pts = 0
    for action in actions:
        summary[action.action_type] = summary.get(action.action_type, 0) + 1
        total_pts += action.points_earned or 0

    most_frequent = max(summary, key=summary.get) if summary else None

    # FIX: pakai total_points_from_actions (bukan total_points) sesuai schema ActionSummary
    return ActionSummary(
        total_actions=len(actions),
        action_breakdown=summary,
        most_frequent_action=most_frequent,
        total_points_from_actions=total_pts,
    )


# ──────────────────────────────────────────────
# GET /actions/{action_id}
# ──────────────────────────────────────────────
@router.get(
    "/{action_id}",
    response_model=ActionResponse,
    summary="Get action detail by ID",
)
def get_action_detail(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = (
        db.query(Action)
        .filter(Action.id == action_id, Action.user_id == current_user.id)
        .first()
    )

    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action not found",
        )

    return action


# ──────────────────────────────────────────────
# DELETE /actions/{action_id}
# ──────────────────────────────────────────────
@router.delete(
    "/{action_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an action",
)
def delete_action(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = (
        db.query(Action)
        .filter(Action.id == action_id, Action.user_id == current_user.id)
        .first()
    )

    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action not found",
        )

    # Kurangi action_count saat action dihapus
    current_user.action_count = max((current_user.action_count or 1) - 1, 0)

    db.delete(action)
    db.commit()