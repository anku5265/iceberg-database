from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    cohere_api_key: str = ""
    master_api_key: str = "qr_dev_test123"

    # Cloudflare R2
    r2_account_id: str = ""
    r2_access_key: str = ""
    r2_secret_key: str = ""
    r2_bucket: str = "qora-storage"

    # BYOC — set this if self-hosting
    byoc_license_key: str = ""
    byoc_mode: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
