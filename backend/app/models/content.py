from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
)

from datetime import datetime

from app.db.base import Base


class Content(Base):

    __tablename__ = "contents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    description = Column(
        Text
    )

    # tip
    # challenge
    # reward
    type = Column(
        String(50),
        nullable=False,
    )

    status = Column(
        String(50),
        nullable=False,
        default="draft",
    )

    # challenge specific
    challenge_type = Column(
        String(50),
        nullable=True,
    )
    # scan
    # action
    # points

    target = Column(
        Integer,
        nullable=True,
    )

    reward_points = Column(
        Integer,
        nullable=True,
        default=0,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )