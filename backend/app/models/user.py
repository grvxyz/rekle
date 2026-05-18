from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.badge import user_badges
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.badge import Badge
    from app.models.prediction import Prediction
    from app.models.action import Action


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)

    total_points: Mapped[int] = mapped_column(Integer, default=0)
    scan_count: Mapped[int] = mapped_column(Integer, default=0)
    action_count: Mapped[int] = mapped_column(Integer, default=0)

    # Saldo rupiah dari pengiriman ke mitra
    balance: Mapped[int] = mapped_column(Integer, default=0)

    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    predictions: Mapped[List["Prediction"]] = relationship(
        "Prediction", back_populates="user", cascade="all, delete-orphan"
    )
    actions: Mapped[List["Action"]] = relationship(
        "Action", back_populates="user", cascade="all, delete-orphan",
        foreign_keys="Action.user_id"
    )
    badges: Mapped[List["Badge"]] = relationship(
        "Badge", secondary=user_badges, back_populates="users"
    )

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"