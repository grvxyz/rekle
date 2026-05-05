from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Table, Column
from sqlalchemy.orm import Mapped, relationship, mapped_column

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


user_badges = Table(
    "user_badges",
    Base.metadata,
    Column(
        "user_id",
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "badge_id",
        Integer,
        ForeignKey("badges.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Badge(Base):
    __tablename__ = "badges"

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    icon_url: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    badge_type: Mapped[str] = mapped_column(
        String(50),
        default="scan"
    )

    requirement_count: Mapped[int] = mapped_column(
        Integer,
        default=1
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    users: Mapped[List["User"]] = relationship(
        "User",
        secondary=user_badges,
        back_populates="badges",
    )

    def __repr__(self):
        return f"<Badge id={self.id} name={self.name}>"