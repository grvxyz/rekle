from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.action import Action
from app.schemas.action_schema import ActionCreate, ActionResponse, ActionSummary
from app.api.v1.deps import get_current_user

# ✅ FIX: jangan pakai /api/v1 lagi
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
        "pabrik": 20,
        "kurangi_penggunaan": 5,
        "khusus": 10,
    }

    earned_points = points_map.get(payload.action_type, 5)

    action = Action(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        scan_id=payload.scan_id,
        action_type=payload.action_type,
        waste_label=payload.waste_label,
        mitra_id=payload.mitra_id,
        notes=payload.notes,
        created_at=datetime.utcnow(),
    )

    db.add(action)

    # tambah poin ke user
    current_user.total_points = (current_user.total_points or 0) + earned_points

    db.commit()
    db.refresh(action)

    return ActionResponse(
        id=action.id,
        user_id=action.user_id,
        scan_id=action.scan_id,
        action_type=action.action_type,
        waste_label=action.waste_label,
        mitra_id=action.mitra_id,
        notes=action.notes,
        earned_points=earned_points,
        created_at=action.created_at,
    )


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

    return [
        ActionResponse(
            id=a.id,
            user_id=a.user_id,
            scan_id=a.scan_id,
            action_type=a.action_type,
            waste_label=a.waste_label,
            mitra_id=a.mitra_id,
            notes=a.notes,
            earned_points=None,  # optional
            created_at=a.created_at,
        )
        for a in actions
    ]


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
    for action in actions:
        summary[action.action_type] = summary.get(action.action_type, 0) + 1

    most_frequent = max(summary, key=summary.get) if summary else None

    return ActionSummary(
        total_actions=len(actions),
        action_breakdown=summary,
        most_frequent_action=most_frequent,
        total_points=current_user.total_points or 0,
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
    action_id: str,
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

    return ActionResponse(
        id=action.id,
        user_id=action.user_id,
        scan_id=action.scan_id,
        action_type=action.action_type,
        waste_label=action.waste_label,
        mitra_id=action.mitra_id,
        notes=action.notes,
        earned_points=None,
        created_at=action.created_at,
    )


# ──────────────────────────────────────────────
# DELETE /actions/{action_id}
# ──────────────────────────────────────────────
@router.delete(
    "/{action_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an action",
)
def delete_action(
    action_id: str,
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

    db.delete(action)
    db.commit()