import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "CyberShield Intelligence Engine"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./cybershield.db"
    )
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Optional Third-Party Threat Intelligence Keys (clearly marked as optional)
    GOOGLE_SAFE_BROWSING_API_KEY: str = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "")
    IPINFO_API_KEY: str = os.getenv("IPINFO_API_KEY", "")
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    
    # Strict SSRF and Safe Redirect Limits
    MAX_REDIRECT_HOPS: int = 5
    HTTP_TIMEOUT_SECONDS: float = 3.5
    MAX_RESPONSE_BYTES: int = 256 * 1024  # 256 KB max for scanning headers/meta

settings = Settings()
