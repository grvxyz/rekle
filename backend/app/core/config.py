from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "REKLE"
    environment: str = "development"
    database_url: str = "sqlite:///./rekle.db"
    secret_key: str = "replace-with-a-secure-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
