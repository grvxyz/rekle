from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# ─── Engine ────────────────────────────────────────────────
engine = create_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_pre_ping=True,  # cek koneksi sebelum pakai, hindari stale connection
    echo=settings.is_development,  # log SQL query saat development
)

# ─── Session factory ───────────────────────────────────────
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# ─── Dependency untuk FastAPI ──────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """
    Dependency injection untuk endpoint FastAPI.

    Pemakaian di endpoint:
        from sqlalchemy.orm import Session
        from fastapi import Depends
        from app.db.session import get_db

        @router.get("/contoh")
        def contoh(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()