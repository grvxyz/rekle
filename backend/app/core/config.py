from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── App ───────────────────────────────────────────────
    app_name: str = "REKLE"
    environment: str = "development"
    debug: bool = True

    # ─── Database ──────────────────────────────────────────
    database_url: str = "sqlite:///./rekle.db"

    # ─── Security ──────────────────────────────────────────
    secret_key: str = "replace-with-a-secure-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # ─── CORS — pakai str bukan List agar tidak di-parse JSON
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Pakai property ini di main.py untuk CORSMiddleware."""
        return [o.strip() for o in self.allowed_origins.split(",")]

    # ─── Upload ────────────────────────────────────────────
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10
    allowed_image_types: str = "image/jpeg,image/png,image/webp"

    @property
    def allowed_image_types_list(self) -> List[str]:
        return [t.strip() for t in self.allowed_image_types.split(",")]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    # ─── ML Model ──────────────────────────────────────────
    ml_model_path: str = "app/ml/REKLE_MobileNetV2_Final.keras"
    ml_image_size: int = 224
    ml_confidence_threshold: float = 0.6
    ml_class_labels: str = "organik,plastik_pet,plastik_hdpe,plastik_campuran,kertas_bersih,kertas_kotor,kaca_utuh,kaca_pecah"

    @property
    def ml_class_labels_list(self) -> List[str]:
        return [l.strip() for l in self.ml_class_labels.split(",")]

    # ─── Gamifikasi ────────────────────────────────────────
    points_per_scan: int = 10
    points_per_action: int = 50
    points_per_challenge: int = 200

    # ─── Object Storage ────────────────────────────────────
    use_s3: bool = False
    s3_bucket_name: Optional[str] = None
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    s3_endpoint_url: Optional[str] = None

    # ─── Helpers ───────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"


settings = Settings()