"""
Main API Router
Tổng hợp tất cả các routes của ứng dụng
"""
from fastapi import APIRouter
from app.api.endpoints import users, items, analytics, health, aqi

# Tạo router chính cho API
api_router = APIRouter()

# Include các router endpoints với prefix và tags
api_router.include_router(
    health.router, 
    tags=["health"]
)

api_router.include_router(
    aqi.router, 
    prefix="/aqi", 
    tags=["air-quality"]
)

api_router.include_router(
    users.router, 
    prefix="/users", 
    tags=["users"]
)

api_router.include_router(
    items.router, 
    prefix="/items", 
    tags=["items"]
)

api_router.include_router(
    analytics.router, 
    prefix="/analytics", 
    tags=["analytics"]
) 