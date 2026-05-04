from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Badge(Base):
    __tablename__ = "badges"

    # ─── Kolom utama ───────────────────────────
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    badge_type: Mapped[str] = mapped_column(String(50), default="scan")
    requirement_count: Mapped[int] = mapped_column(Integer, default=1)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ─── Relasi MANY TO MANY ───────────────────
    users: Mapped[List["User"]] = relationship(
        "User",
        secondary="user_badges",
        back_populates="badges",
    )

    def __repr__(self):
        return f"<Badge id={self.id} name={self.name}>"



class UserBadge(Base):
    __tablename__ = "user_badges"

    # ─── Foreign Key ───────────────────────────
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )

    badge_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("badges.id", ondelete="CASCADE"),
        primary_key=True,
    )