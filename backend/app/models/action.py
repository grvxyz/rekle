from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.prediction import Prediction


class Action(Base):
    __tablename__ = "actions"

    # id, created_at, updated_at otomatis dari Base

    # ─── Relasi ke user dan prediction ────────────────────
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    prediction_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True
    )

    # ─── Detail aksi ──────────────────────────────────────
    # kompos | bank_sampah | daur_ulang | eco_brick | reuse | khusus
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)

    # Nama mitra jika aksi melibatkan pengiriman ke mitra
    partner_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Catatan tambahan dari user
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ─── Poin ─────────────────────────────────────────────
    points_earned: Mapped[int] = mapped_column(Integer, default=0)

    # ─── Status: confirmed | pending | rejected ───────────
    status: Mapped[str] = mapped_column(String(50), default="confirmed")

    # ─── Relasi ───────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="actions")
    prediction: Mapped[Optional["Prediction"]] = relationship(
        "Prediction", back_populates="action"
    )

    def __repr__(self) -> str:
        return f"<Action id={self.id} type={self.action_type!r} points={self.points_earned}>"