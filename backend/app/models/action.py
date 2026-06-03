from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.prediction import Prediction


class Action(Base):
    __tablename__ = "actions"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    prediction_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True
    )

    # kompos | daur_ulang | eco_brick | reuse | khusus
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)

    # mandiri | mitra
    route: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    partner_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Foto bukti dari user
    proof_image_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Poin dari aksi
    points_earned: Mapped[int] = mapped_column(Integer, default=0)

    # Saldo rupiah khusus dari pengiriman ke mitra
    balance_earned: Mapped[int] = mapped_column(Integer, default=0)

    # Berat sampah dalam gram — diisi admin saat verifikasi route mitra
    weight_gram: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # pending | approved | rejected
    status: Mapped[str] = mapped_column(String(50), default="pending")

    # Alasan penolakan — wajib diisi admin jika status = rejected
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    verified_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(
        "User", back_populates="actions", foreign_keys=[user_id]
    )
    prediction: Mapped[Optional["Prediction"]] = relationship(
        "Prediction", back_populates="action"
    )

    def __repr__(self) -> str:
        return f"<Action id={self.id} type={self.action_type!r} route={self.route!r} status={self.status!r}>"