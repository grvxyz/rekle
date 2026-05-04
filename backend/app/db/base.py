from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, func
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column


class Base(DeclarativeBase):
    """
    Base class untuk semua SQLAlchemy model.
    Semua model di app/models/ otomatis punya kolom:
      - id          : primary key integer
      - created_at  : waktu row dibuat
      - updated_at  : waktu row terakhir diupdate

    Contoh pemakaian:
        from app.db.base import Base

        class User(Base):
            __tablename__ = "users"
            email: Mapped[str] = mapped_column(unique=True)
    """

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower() + "s"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )