from pathlib import Path
from typing import List, Optional

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "REKLE"
    environment: str = "development"
    debug: bool = True

    database_url: str = ""

    secret_key: str = ""
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    allowed_origins: str = "https://rekle.vercel.app,http://localhost:5173"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10
    allowed_image_types: str = "image/jpeg,image/png,image/webp"

    @property
    def allowed_image_types_list(self) -> List[str]:
        return [t.strip() for t in self.allowed_image_types.split(",")]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    ml_model_path: str = str(
        BASE_DIR / "app" / "ml" / "mobilenet_final.keras"
    )

    ml_class_names_path: str = str(
        BASE_DIR / "app" / "ml" / "class_names.json"
    )

    ml_image_size: int = 224

    ml_confidence_threshold: float = 0.7

    ml_confidence_gap_threshold: float = 0.2

    ml_class_labels: str = (
    "B3,Kaca,Kardus,Kertas,Logam,Medis,Plastik,nonsampah,organik"
    )

    @property
    def ml_class_labels_list(self) -> List[str]:
        import json
        p = Path(self.ml_class_names_path)
        if p.exists():
            with open(p, "r") as f:
                return json.load(f)
        return [label.strip() for label in self.ml_class_labels.split(",")]

    # Poin scan langsung
    points_per_scan: int = 10

    # Poin aksi setelah diverifikasi admin
    points_per_action: int = 50

    points_per_challenge: int = 200

    # Saldo rupiah per kg sampah yang dikirim ke mitra
    balance_per_kg: int = 2000

    use_s3: bool = False
    s3_bucket_name: Optional[str] = None
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    s3_endpoint_url: Optional[str] = None

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"


settings = Settings()

if settings.is_development:
    print("====================================")
    print("REKLE CONFIG")
    print("====================================")
    print("DATABASE_URL:")
    print(settings.database_url[:30] + "..." if settings.database_url else "NOT SET")
    print()
    print("MODEL PATH:")
    print(settings.ml_model_path)
    print()
    print("MODEL EXISTS:", Path(settings.ml_model_path).exists())
    print("====================================")