from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Mitra(Base):
    __tablename__ = "mitras"

    # id, created_at, updated_at otomatis dari Base

    # ─── Pemilik mitra (user yang mendaftar) ───────────────
    # NULL berarti mitra didaftarkan langsung oleh admin
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # ─── Identitas ─────────────────────────────────────────
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ─── Kontak ────────────────────────────────────────────
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # ─── Lokasi ────────────────────────────────────────────
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # ─── Jenis sampah yang diterima ────────────────────────
    # Disimpan sebagai comma-separated: "plastik_pet,kertas_bersih,kaca_utuh"
    accepted_waste: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Jenis aksi: bank_sampah | daur_ulang | eco_brick | kompos
    mitra_type: Mapped[str] = mapped_column(String(100), nullable=False, default="bank_sampah")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ─── Verifikasi pendaftaran mitra ──────────────────────
    # pending  : baru daftar, menunggu review admin
    # approved : disetujui admin, mitra aktif
    # rejected : ditolak admin
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")

    # Wajib diisi admin jika status = rejected
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Admin yang memverifikasi
    verified_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<Mitra id={self.id} name={self.name!r} status={self.status!r}>"

    @property
    def accepted_waste_list(self) -> list[str]:
        """Kembalikan accepted_waste sebagai list."""
        if not self.accepted_waste:
            return []
        return [w.strip() for w in self.accepted_waste.split(",")]