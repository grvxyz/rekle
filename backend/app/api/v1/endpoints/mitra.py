from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_superuser, get_current_user
from app.db.session import get_db
from app.models.mitra import Mitra
from app.models.user import User

router = APIRouter()


# ─── Schemas (inline, simpel) ──────────────────────────────

class MitraResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    address: Optional[str]
    city: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    accepted_waste: Optional[str]
    mitra_type: str
    is_active: bool

    model_config = {"from_attributes": True}


class MitraCreate(BaseModel):
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accepted_waste: Optional[str] = None
    mitra_type: str = "bank_sampah"
    is_active: bool = True


class MitraUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accepted_waste: Optional[str] = None
    mitra_type: Optional[str] = None
    is_active: Optional[bool] = None


# ─── Endpoints public ──────────────────────────────────────

@router.get("/data", response_model=List[MitraResponse])
def mitra_data(
    city: Optional[str] = Query(None, description="Filter berdasarkan kota"),
    waste_type: Optional[str] = Query(None, description="Filter berdasarkan jenis sampah"),
    mitra_type: Optional[str] = Query(None, description="Filter berdasarkan tipe mitra"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Daftar mitra daur ulang yang aktif.
    Bisa difilter by kota, jenis sampah, atau tipe mitra.
    """
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
    """
    Cari mitra yang menerima jenis sampah tertentu.
    Dipanggil otomatis setelah scan — kirim label hasil klasifikasi.
    Contoh: GET /mitra/by-waste/plastik_pet
    """
    mitras = (
        db.query(Mitra)
        .filter(
            Mitra.is_active == True,
            Mitra.accepted_waste.ilike(f"%{waste_label}%"),
        )
        .all()
    )
    return mitras


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
    """
    Daftar semua mitra (aktif & non-aktif) untuk halaman admin.
    Bisa difilter dan dipaginasi.
    """
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

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
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