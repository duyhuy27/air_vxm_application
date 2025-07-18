"""
Application Configuration
Quản lý cấu hình và environment variables
"""
import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Project metadata
    PROJECT_NAME: str = "FastAPI BigQuery App"
    API_V1_STR: str = "/api/v1"
    
    # CORS settings - cho phép frontend kết nối
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React default
        "http://localhost:8080",  # Vue default
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:8000",  # FastAPI default
        "http://localhost",       # Localhost any port
        "http://127.0.0.1",      # 127.0.0.1 any port
        "file://",               # File protocol
        "*"                      # Allow all origins for development
    ]
    
    # BigQuery configuration
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "invertible-now-462103-m3")
    BIGQUERY_DATASET: str = os.getenv("BIGQUERY_DATASET", "weather_and_air_dataset")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "credentials/invertible-now-462103-m3-23f2fe58ae65.json")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Tạo instance global settings
settings = Settings() 