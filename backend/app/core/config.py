from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─────────────────────────────────────────────
    # APP
    # ─────────────────────────────────────────────
    app_name: str = "REKLE"
    environment: str = "development"
    debug: bool = True

    # ─────────────────────────────────────────────
    # DATABASE
    # ─────────────────────────────────────────────
    # default untuk docker compose
    database_url: str = (
        "postgresql://postgres:password@db:5432/rekle_db"
    )

    # ─────────────────────────────────────────────
    # SECURITY
    # ─────────────────────────────────────────────
    secret_key: str = "replace-with-a-secure-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # ─────────────────────────────────────────────
    # CORS
    # ─────────────────────────────────────────────
    allowed_origins: str = (
        "http://localhost:3000,http://localhost:5173"
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    # ─────────────────────────────────────────────
    # UPLOAD
    # ─────────────────────────────────────────────
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10
    allowed_image_types: str = (
        "image/jpeg,image/png,image/webp"
    )

    @property
    def allowed_image_types_list(self) -> List[str]:
        return [t.strip() for t in self.allowed_image_types.split(",")]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    # ─────────────────────────────────────────────
    # ML MODEL
    # ─────────────────────────────────────────────
    ml_model_path: str = (
        "app/ml/REKLE_MobileNetV2_Final.keras"
    )

    ml_image_size: int = 224
    ml_confidence_threshold: float = 0.6

    ml_class_labels: str = (
        "organik,plastik_pet,plastik_hdpe,"
        "plastik_campuran,kertas_bersih,"
        "kertas_kotor,kaca_utuh,kaca_pecah"
    )

    @property
    def ml_class_labels_list(self) -> List[str]:
        return [l.strip() for l in self.ml_class_labels.split(",")]

    # ─────────────────────────────────────────────
    # GAMIFIKASI
    # ─────────────────────────────────────────────
    points_per_scan: int = 10
    points_per_action: int = 50
    points_per_challenge: int = 200

    # ─────────────────────────────────────────────
    # S3 STORAGE
    # ─────────────────────────────────────────────
    use_s3: bool = False
    s3_bucket_name: Optional[str] = None
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    s3_endpoint_url: Optional[str] = None

    # ─────────────────────────────────────────────
    # HELPERS
    # ─────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"


settings = Settings()

print("DATABASE_URL:", settings.database_url)