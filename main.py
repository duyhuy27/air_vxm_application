"""
AirVXM Platform - FastAPI Backend
Hệ thống giám sát chất lượng không khí Hà Nội với BigQuery integration
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

# Khởi tạo FastAPI app với metadata
app = FastAPI(
    title="AirVXM Platform API",
    description="Air Quality Monitoring Platform for Hanoi - Backend API with BigQuery integration",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Cấu hình CORS middleware cho frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router với prefix
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint cho Railway
@app.get("/")
async def root():
    """Root endpoint - simple health check"""
    return {
        "message": "AirVXM Platform API is running!", 
        "description": "Air Quality Monitoring for Hanoi",
        "version": "1.0.0",
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

# Simple health endpoint cho Railway healthcheck
@app.get("/health")
async def simple_health():
    """Simple health check không phụ thuộc external services"""
    return {
        "status": "healthy",
        "service": "FastAPI BigQuery App",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    
    # Lấy port từ environment variable (Railway set $PORT)
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.DEBUG  # Chỉ reload khi DEBUG=True
    ) 