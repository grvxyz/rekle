from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Badge(Base):
    __tablename__ = "badges"

    # id, created_at, updated_at otomatis dari Base

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Jenis badge: scan | action | challenge
    badge_type: Mapped[str] = mapped_column(String(50), nullable=False, default="scan")

    # Syarat mendapatkan badge (misal: scan 10x, aksi kompos 5x)
    requirement_count: Mapped[int] = mapped_column(Integer, default=1)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ─── Relasi ────────────────────────────────────────────
    # Satu badge bisa dimiliki banyak user (via tabel pivot user_badges)
    users: Mapped[List["User"]] = relationship(
        "User",
        secondary="user_badges",
        back_populates="badges",
    )

    def __repr__(self) -> str:
        return f"<Badge id={self.id} name={self.name!r}>"


class UserBadge(Base):
    """Tabel pivot antara User dan Badge."""
    __tablename__ = "user_badges"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    badge_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("badges.id", ondelete="CASCADE"), primary_key=True
    )