from typing import TYPE_CHECKING, Optional

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.action import Action


class Prediction(Base):
    __tablename__ = "predictions"

    # id, created_at, updated_at otomatis dari Base

    # ─── Relasi ke user (sudah ada) ────────────────────────
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ─── Hasil klasifikasi (sudah ada, confidence difix) ───
    # result: kategori utama, misal "plastik_pet", "organik", dll
    result: Mapped[str] = mapped_column(String(100), nullable=False)

    # confidence diubah dari String ke Float (0.0 - 1.0)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # ─── Tambahan baru ─────────────────────────────────────
    # Path gambar yang diupload (local atau S3 key)
    image_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Semua label + confidence dari model, disimpan sebagai JSON string
    # Contoh: '{"organik": 0.12, "plastik_pet": 0.85, "kertas_bersih": 0.03}'
    raw_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Rekomendasi aksi dari recommendation engine
    # Contoh: "daur_ulang" | "kompos" | "bank_sampah" | "eco_brick"
    recommendation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Apakah confidence di atas threshold (valid untuk ditindaklanjuti)
    is_confident: Mapped[bool] = mapped_column(default=True)

    # ─── Relasi ────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="predictions")

    # Satu scan bisa menghasilkan satu aksi nyata (opsional)
    action: Mapped[Optional["Action"]] = relationship(
        "Action", back_populates="prediction", uselist=False
    )

    def __repr__(self) -> str:
        return f"<Prediction id={self.id} result={self.result!r} confidence={self.confidence}>"