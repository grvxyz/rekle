from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_superuser, get_current_user
from app.db.session import get_db
from app.models.action import Action
from app.models.mitra import Mitra
from app.models.user import User
from app.schemas.mitra_schema import MitraCreate, MitraResponse, MitraUpdate

router = APIRouter()


# ─── Endpoints public (semua user login) ───────────────────

@router.get("/data", response_model=List[MitraResponse])
def mitra_data(
    city: Optional[str] = Query(None),
    waste_type: Optional[str] = Query(None),
    mitra_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Daftar semua mitra aktif. Bisa difilter by kota, jenis sampah, tipe."""
    query = db.query(Mitra).filter(Mitra.is_active == True)

    if city:
        query = query.filter(Mitra.city.ilike(f"%{city}%"))
    if mitra_type:
        query = query.filter(Mitra.mitra_type == mitra_type)
    if waste_type:
        query = query.filter(Mitra.accepted_waste.ilike(f"%{waste_type}%"))

    return query.order_by(Mitra.name).all()


@router.get("/data/{mitra_id}", response_model=MitraResponse)
def mitra_detail(
    mitra_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Detail satu mitra berdasarkan ID."""
    mitra = db.query(Mitra).filter(Mitra.id == mitra_id, Mitra.is_active == True).first()
    if not mitra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mitra tidak ditemukan")
    return mitra


@router.get("/by-waste/{waste_label}", response_model=List[MitraResponse])
def mitra_by_waste(
    waste_label: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Cari mitra yang menerima jenis sampah tertentu."""
    return (
        db.query(Mitra)
        .filter(
            Mitra.is_active == True,
            Mitra.accepted_waste.ilike(f"%{waste_label}%"),
        )
        .all()
    )


# ─── Endpoints mitra-owner (user yang punya mitra) ─────────

@router.get("/mine", response_model=List[MitraResponse])
def get_my_mitra(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Kembalikan mitra milik user yang sedang login.
    Digunakan oleh portal mitra untuk cek apakah user sudah punya mitra.
    """
    return db.query(Mitra).filter(Mitra.user_id == current_user.id).all()


@router.post("/mine", response_model=MitraResponse, status_code=status.HTTP_201_CREATED)
def create_my_mitra(
    payload: MitraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Daftarkan mitra baru atas nama user yang sedang login.
    Satu user hanya boleh punya satu mitra.
    """
    existing = db.query(Mitra).filter(Mitra.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anda sudah memiliki mitra terdaftar",
        )

    mitra = Mitra(**payload.model_dump(), user_id=current_user.id)
    db.add(mitra)
    db.commit()
    db.refresh(mitra)
    return mitra


@router.patch("/mine/{mitra_id}", response_model=MitraResponse)
def update_my_mitra(
    mitra_id: int,
    payload: MitraUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Edit profil mitra milik user sendiri."""
    mitra = db.query(Mitra).filter(
        Mitra.id == mitra_id,
        Mitra.user_id == current_user.id,
    ).first()
    if not mitra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mitra tidak ditemukan")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(mitra, key, value)

    db.commit()
    db.refresh(mitra)
    return mitra


@router.get("/mine/actions/pending", response_model=list)
def get_mitra_pending_actions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Aksi pending yang dikirim ke mitra milik user ini.
    Digunakan di halaman Verifikasi portal mitra.
    """
    mitra = db.query(Mitra).filter(Mitra.user_id == current_user.id).first()
    if not mitra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anda belum memiliki mitra")

    actions = (
        db.query(Action)
        .filter(
            Action.partner_name == mitra.name,
            Action.status == "pending",
        )
        .order_by(Action.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [_action_to_dict(a) for a in actions]


@router.get("/mine/actions/pending/count")
def get_mitra_pending_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Jumlah aksi pending untuk mitra milik user ini."""
    mitra = db.query(Mitra).filter(Mitra.user_id == current_user.id).first()
    if not mitra:
        return {"count": 0}

    count = (
        db.query(Action)
        .filter(Action.partner_name == mitra.name, Action.status == "pending")
        .count()
    )
    return {"count": count}


@router.get("/mine/actions", response_model=list)
def get_mitra_all_actions(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Semua riwayat aksi yang dikirim ke mitra milik user ini.
    Digunakan di halaman Riwayat portal mitra.
    Bisa difilter by status: pending | approved | rejected
    """
    mitra = db.query(Mitra).filter(Mitra.user_id == current_user.id).first()
    if not mitra:
        return []

    query = db.query(Action).filter(Action.partner_name == mitra.name)

    if status_filter:
        query = query.filter(Action.status == status_filter)

    actions = query.order_by(Action.created_at.desc()).offset(skip).limit(limit).all()
    return [_action_to_dict(a) for a in actions]


@router.patch("/mine/actions/{action_id}/verify")
def mitra_verify_action(
    action_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mitra konfirmasi atau tolak aksi setoran.
    payload: { "status": "approved" | "rejected" }
    """
    # Pastikan mitra milik user ini
    mitra = db.query(Mitra).filter(Mitra.user_id == current_user.id).first()
    if not mitra:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Anda tidak memiliki mitra")

    new_status = payload.get("status")
    if new_status not in ("approved", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="status harus 'approved' atau 'rejected'",
        )

    action = db.query(Action).filter(
        Action.id == action_id,
        Action.partner_name == mitra.name,
    ).first()
    if not action:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aksi tidak ditemukan")

    if action.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Aksi sudah berstatus '{action.status}'",
        )

    action.status = new_status
    db.commit()
    db.refresh(action)
    return _action_to_dict(action)


# ─── Endpoints admin only ──────────────────────────────────

@router.get("/admin/all", response_model=List[MitraResponse])
def admin_list_mitras(
    search: Optional[str] = Query(None),
    mitra_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Daftar semua mitra (aktif & non-aktif) untuk halaman admin."""
    query = db.query(Mitra)

    if search:
        query = query.filter(
            Mitra.name.ilike(f"%{search}%") | Mitra.city.ilike(f"%{search}%")
        )
    if mitra_type:
        query = query.filter(Mitra.mitra_type == mitra_type)
    if is_active is not None:
        query = query.filter(Mitra.is_active == is_active)

    return query.order_by(Mitra.name).offset(skip).limit(limit).all()


@router.post("/data", response_model=MitraResponse, status_code=status.HTTP_201_CREATED)
def create_mitra(
    payload: MitraCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Tambah mitra baru. Hanya superuser."""
    mitra = Mitra(**payload.model_dump())
    db.add(mitra)
    db.commit()
    db.refresh(mitra)
    return mitra


@router.patch("/data/{mitra_id}", response_model=MitraResponse)
def update_mitra(
    mitra_id: int,
    payload: MitraUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Edit data mitra. Hanya superuser."""
    mitra = db.query(Mitra).filter(Mitra.id == mitra_id).first()
    if not mitra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mitra tidak ditemukan")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(mitra, key, value)

    db.commit()
    db.refresh(mitra)
    return mitra


@router.patch("/data/{mitra_id}/toggle-active", response_model=MitraResponse)
def toggle_mitra_active(
    mitra_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Aktifkan atau nonaktifkan mitra. Hanya superuser."""
    mitra = db.query(Mitra).filter(Mitra.id == mitra_id).first()
    if not mitra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mitra tidak ditemukan")
    mitra.is_active = not mitra.is_active
    db.commit()
    db.refresh(mitra)
    return mitra


@router.delete("/data/{mitra_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mitra(
    mitra_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superuser),
):
    """Hapus mitra permanen. Hanya superuser."""
    mitra = db.query(Mitra).filter(Mitra.id == mitra_id).first()
    if not mitra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mitra tidak ditemukan")
    db.delete(mitra)
    db.commit()


# ─── Helper ────────────────────────────────────────────────

def _action_to_dict(action: Action) -> dict:
    """Serialize Action ke dict untuk response mitra endpoints."""
    return {
        "id": action.id,
        "action_type": action.action_type,
        "route": action.route,
        "partner_name": action.partner_name,
        "notes": action.notes,
        "proof_url": action.proof_image_path,
        "weight_kg": None,  # tidak ada di model saat ini
        "points_earned": action.points_earned,
        "balance_earned": action.balance_earned,
        "status": action.status,
        "verified_by": action.verified_by,
        "verified_at": action.verified_at.isoformat() if action.verified_at else None,
        "created_at": action.created_at.isoformat() if action.created_at else None,
    }