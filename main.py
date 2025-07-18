"""
AirVXM Platform - FastAPI Backend
Hệ thống giám sát chất lượng không khí Hà Nội với BigQuery integration
"""
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

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "message": "AirVXM Platform API is running!", 
        "description": "Air Quality Monitoring for Hanoi",
        "version": "1.0.0",
        "status": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Chỉ dùng khi development
    ) 