from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Dict, List, Optional
from datetime import date, datetime, timedelta, timezone
from pydantic import BaseModel
import os

from app.db.session import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.models.action import Action
from app.models.mitra import Mitra
from app.models.point_setting import PointSetting
from app.schemas.user_schema import UserResponse
from app.api.v1.deps import get_current_superuser
from app.models.content import Content
from app.schemas.content_schema import ContentCreate, ContentUpdate, ContentResponse
from app.schemas.prediction_schema import ScanHistory, ScanHistoryList
from app.schemas.mitra_schema import MitraResponse

router = APIRouter()


# =========================================================
# DASHBOARD
# =========================================================

@router.get("/dashboard")
def admin_dashboard(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    users_query = db.query(func.count(User.id))
    if start_date and end_date:
        users_query = users_query.filter(
            func.date(User.created_at).between(start_date, end_date)
        )
    total_users = users_query.scalar() or 0

    scans_query = db.query(func.count(Prediction.id))
    if start_date and end_date:
        scans_query = scans_query.filter(
            func.date(Prediction.created_at).between(start_date, end_date)
        )
    total_scans = scans_query.scalar() or 0

    actions_query = db.query(func.count(Action.id))
    if start_date and end_date:
        actions_query = actions_query.filter(
            func.date(Action.created_at).between(start_date, end_date)
        )
    total_actions = actions_query.scalar() or 0

    points_query = db.query(func.sum(Action.points_earned))
    if start_date and end_date:
        points_query = points_query.filter(
            func.date(Action.created_at).between(start_date, end_date)
        )
    total_points = points_query.scalar() or 0

    top_categories_query = db.query(
        Prediction.result,
        func.count(Prediction.id).label("count"),
    )
    if start_date and end_date:
        top_categories_query = top_categories_query.filter(
            func.date(Prediction.created_at).between(start_date, end_date)
        )
    top_categories = (
        top_categories_query
        .group_by(Prediction.result)
        .order_by(func.count(Prediction.id).desc())
        .limit(5)
        .all()
    )

    pending_mitras = (
        db.query(func.count(Mitra.id))
        .filter(Mitra.status == "pending")
        .scalar() or 0
    )

    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "total_actions": total_actions,
        "total_points_distributed": total_points,
        "pending_mitras": pending_mitras,
        "top_categories": [
            {"category": result, "count": count}
            for result, count in top_categories
        ],
    }


# =========================================================
# USER MANAGEMENT
# =========================================================

@router.get("/users")
def list_all_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,  # ← TAMBAHAN: parameter search
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    query = db.query(User)

    # ← TAMBAHAN: filter by nama atau email jika search diisi
    if search:
        keyword = f"%{search}%"
        query = query.filter(
            or_(
                User.full_name.ilike(keyword),
                User.email.ilike(keyword),
            )
        )

    # ← TAMBAHAN: hitung total SEBELUM pagination (untuk frontend pagination)
    total = query.count()

    users = (
        query
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    # ← TAMBAHAN: kembalikan dict dengan total agar frontend bisa hitung totalPages
    return {"users": users, "total": total}


@router.patch("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_superuser),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Tidak bisa mengubah status diri sendiri")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/set-superuser", response_model=UserResponse)
def set_superuser(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_superuser),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Tidak bisa mengubah diri sendiri")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user.is_superuser = True
    db.commit()
    db.refresh(user)
    return user


# =========================================================
# SCANS
# =========================================================

@router.get("/scans", response_model=ScanHistoryList)
def list_all_scans(
    skip: int = 0,
    limit: int = 50,
    result: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    query = db.query(Prediction)

    if result:
        query = query.filter(Prediction.result == result)

    total = query.count()
    items = (
        query
        .order_by(Prediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return ScanHistoryList(total=total, items=items)


@router.delete("/scans/{prediction_id}", status_code=204)
def admin_delete_scan(
    prediction_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Admin menghapus data scan berdasarkan ID."""
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Scan tidak ditemukan")

    if prediction.image_path and os.path.exists(prediction.image_path):
        try:
            os.remove(prediction.image_path)
        except OSError:
            pass

    db.delete(prediction)
    db.commit()


# =========================================================
# MITRA VERIFICATION
# =========================================================

class MitraVerifySchema(BaseModel):
    status: str
    rejection_reason: Optional[str] = None


@router.get("/mitra/pending", response_model=List[MitraResponse])
def list_pending_mitras(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    return (
        db.query(Mitra)
        .filter(Mitra.status == "pending")
        .order_by(Mitra.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/mitra/pending/count")
def count_pending_mitras(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    count = (
        db.query(func.count(Mitra.id))
        .filter(Mitra.status == "pending")
        .scalar() or 0
    )
    return {"count": count}


@router.patch("/mitra/{mitra_id}/verify", response_model=MitraResponse)
def verify_mitra(
    mitra_id: int,
    payload: MitraVerifySchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    if payload.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="status harus 'approved' atau 'rejected'")

    if payload.status == "rejected" and not payload.rejection_reason:
        raise HTTPException(status_code=400, detail="Alasan penolakan wajib diisi jika status rejected")

    mitra = db.query(Mitra).filter(Mitra.id == mitra_id).first()
    if not mitra:
        raise HTTPException(status_code=404, detail="Mitra tidak ditemukan")

    if mitra.status != "pending":
        raise HTTPException(status_code=400, detail=f"Mitra sudah berstatus '{mitra.status}'")

    mitra.status = payload.status
    mitra.rejection_reason = payload.rejection_reason
    mitra.verified_by = current_user.id
    mitra.verified_at = datetime.now(timezone.utc)
    mitra.is_active = payload.status == "approved"

    db.commit()
    db.refresh(mitra)
    return mitra


# =========================================================
# POINT SETTINGS
# =========================================================

class PointSettingItem(BaseModel):
    label:   str
    points:  int
    balance: int


@router.get("/point-settings")
def get_point_settings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    settings = db.query(PointSetting).all()
    return settings


@router.patch("/point-settings/{action_type}")
def update_point_setting(
    action_type: str,
    payload: PointSettingItem,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    setting = db.query(PointSetting).filter(PointSetting.action_type == action_type).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting tidak ditemukan")

    setting.label   = payload.label
    setting.points  = payload.points
    setting.balance = payload.balance

    db.commit()
    db.refresh(setting)
    return setting


# =========================================================
# ANALYTICS - SCANS
# =========================================================

@router.get("/analytics/scans")
def scan_analytics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    by_category_query = db.query(
        Prediction.result,
        func.count(Prediction.id).label("count"),
    )
    by_recommendation_query = db.query(
        Prediction.recommendation,
        func.count(Prediction.id).label("count"),
    )

    if start_date and end_date:
        by_category_query = by_category_query.filter(
            func.date(Prediction.created_at).between(start_date, end_date)
        )
        by_recommendation_query = by_recommendation_query.filter(
            func.date(Prediction.created_at).between(start_date, end_date)
        )

    by_category = (
        by_category_query
        .group_by(Prediction.result)
        .order_by(func.count(Prediction.id).desc())
        .all()
    )
    by_recommendation = (
        by_recommendation_query
        .group_by(Prediction.recommendation)
        .order_by(func.count(Prediction.id).desc())
        .all()
    )

    return {
        "by_category": [
            {"category": result, "count": count}
            for result, count in by_category
        ],
        "by_recommendation": [
            {"recommendation": recommendation, "count": count}
            for recommendation, count in by_recommendation
        ],
    }


# =========================================================
# ANALYTICS - ACTIONS
# =========================================================

@router.get("/analytics/actions")
def action_analytics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    query = db.query(
        Action.action_type,
        func.count(Action.id).label("count"),
    )
    points_query = db.query(func.sum(Action.points_earned))

    if start_date and end_date:
        query = query.filter(
            func.date(Action.created_at).between(start_date, end_date)
        )
        points_query = points_query.filter(
            func.date(Action.created_at).between(start_date, end_date)
        )

    by_type = (
        query
        .group_by(Action.action_type)
        .order_by(func.count(Action.id).desc())
        .all()
    )
    total_points = points_query.scalar() or 0

    return {
        "by_action_type": [
            {"action_type": action_type, "count": count}
            for action_type, count in by_type
        ],
        "total_points_from_actions": total_points,
    }


# =========================================================
# ANALYTICS - TIMESERIES
# =========================================================

@router.get("/analytics/timeseries")
def analytics_timeseries(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    from datetime import timedelta

    raw_data = (
        db.query(
            func.date(Prediction.created_at).label("date"),
            func.count(Prediction.id).label("count"),
        )
        .filter(
            func.date(Prediction.created_at).between(start_date, end_date)
        )
        .group_by(func.date(Prediction.created_at))
        .all()
    )

    data_map = {str(item.date): item.count for item in raw_data}

    result = []
    current = start_date
    while current <= end_date:
        key = str(current)
        result.append({"date": key, "count": data_map.get(key, 0)})
        current += timedelta(days=1)

    return result


# =========================================================
# ANALYTICS - INSIGHTS
# =========================================================

@router.get("/analytics/insights")
def analytics_insights(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    now = datetime.now(timezone.utc)
    this_week_start = now - timedelta(days=7)
    last_week_start = now - timedelta(days=14)

    this_week_count = (
        db.query(func.count(Prediction.id))
        .filter(Prediction.created_at >= this_week_start)
        .scalar() or 0
    )
    last_week_count = (
        db.query(func.count(Prediction.id))
        .filter(Prediction.created_at.between(last_week_start, this_week_start))
        .scalar() or 0
    )

    growth = 0.0
    if last_week_count > 0:
        growth = ((this_week_count - last_week_count) / last_week_count) * 100

    top_category = (
        db.query(
            Prediction.result,
            func.count(Prediction.id).label("count"),
        )
        .filter(Prediction.created_at >= this_week_start)
        .group_by(Prediction.result)
        .order_by(func.count(Prediction.id).desc())
        .first()
    )

    this_week_actions = (
        db.query(func.count(Action.id))
        .filter(Action.created_at >= this_week_start)
        .scalar() or 0
    )

    insights = []

    if top_category and this_week_count > 0:
        percentage = (top_category.count / this_week_count) * 100
        insights.append(
            f"{top_category.result.capitalize()} mendominasi {percentage:.0f}% scan minggu ini"
        )

    if last_week_count > 0:
        direction = "naik" if growth >= 0 else "turun"
        insights.append(f"Scan {direction} {abs(growth):.1f}% dibanding minggu lalu")
    else:
        insights.append("Belum ada data pembanding minggu lalu")

    if this_week_count > 0:
        rate = (this_week_actions / this_week_count) * 100
        insights.append(f"{rate:.0f}% scan minggu ini menghasilkan aksi")

    yesterday = now - timedelta(days=1)
    yesterday_count = (
        db.query(func.count(Prediction.id))
        .filter(Prediction.created_at >= yesterday)
        .scalar() or 0
    )

    if this_week_count > 0:
        avg_daily = this_week_count / 7
        if yesterday_count > avg_daily * 1.5:
            insights.append("⚠️ Terjadi lonjakan scan dalam 24 jam terakhir")

    if not insights:
        insights.append("Belum cukup data untuk insight")

    return {
        "insights": insights,
        "stats": {
            "this_week": this_week_count,
            "last_week": last_week_count,
            "growth_percent": round(growth, 2),
        },
    }


# =========================================================
# CONTENT MANAGEMENT
# =========================================================

@router.get("/content", response_model=List[ContentResponse])
def get_contents(
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    query = db.query(Content)

    if type:
        query = query.filter(Content.type == type)

    if status:
        query = query.filter(Content.status == status)

    return query.order_by(Content.created_at.desc()).all()


@router.get("/content/{content_id}", response_model=ContentResponse)
def get_content_detail(
    content_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content tidak ditemukan")
    return content


@router.post("/content", response_model=ContentResponse)
def create_content(
    data: ContentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    content = Content(**data.dict())
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.put("/content/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: int,
    data: ContentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content tidak ditemukan")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(content, key, value)

    db.commit()
    db.refresh(content)
    return content


@router.delete("/content/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content tidak ditemukan")

    db.delete(content)
    db.commit()
    return {"message": "Content berhasil dihapus"}