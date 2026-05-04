from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.badge import Badge
    from app.models.prediction import Prediction
    from app.models.action import Action


class User(Base):
    __tablename__ = "users"

    # ─── Identitas ────────────────────────────────────────
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # ─── Nomor HP (BARU) ─────────────────────────────────
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # ─── Status akun ─────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)

    # ─── Gamifikasi ──────────────────────────────────────
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    scan_count: Mapped[int] = mapped_column(Integer, default=0)
    action_count: Mapped[int] = mapped_column(Integer, default=0)

    # ─── Profil ──────────────────────────────────────────
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ─── Relasi ──────────────────────────────────────────
    predictions: Mapped[List["Prediction"]] = relationship(
        "Prediction", back_populates="user", cascade="all, delete-orphan"
    )
    actions: Mapped[List["Action"]] = relationship(
        "Action", back_populates="user", cascade="all, delete-orphan"
    )
    badges: Mapped[List["Badge"]] = relationship(
        "Badge", secondary="user_badges", back_populates="users"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"

    def add_points(self, points: int) -> None:
        self.total_points += points