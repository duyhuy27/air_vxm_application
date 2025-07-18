"""
Main API Router - AirVXM Platform
Router chính cho hệ thống giám sát chất lượng không khí Hà Nội
"""
from fastapi import APIRouter
from app.api.endpoints import health, aqi

# Tạo router chính cho API
api_router = APIRouter()

# Health check endpoint
api_router.include_router(
    health.router, 
    tags=["health"]
)

# Air Quality Index endpoints - Core functionality
api_router.include_router(
    aqi.router, 
    prefix="/aqi", 
    tags=["air-quality"]
) 