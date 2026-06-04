from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PointSetting(Base):
    __tablename__ = "point_settings"

    # key unik per jenis aksi: "scan", "kompos", "daur_ulang",
    # "eco_brick", "reuse", "bank_sampah", "khusus"
    key: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)

    label: Mapped[str] = mapped_column(String(100), nullable=False)

    # Poin yang diberikan saat aksi diverifikasi
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Saldo rupiah — hanya relevan untuk aksi mitra (bank_sampah, dll)
    balance: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # id, created_at, updated_at sudah dari Base
    def __repr__(self):
        return f"<PointSetting key={self.key!r} points={self.points} balance={self.balance}>"