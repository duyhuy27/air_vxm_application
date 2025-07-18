"""
Health Check Endpoints
Kiểm tra tình trạng hệ thống và các dependencies
"""
from fastapi import APIRouter
from app.db.bigquery import bigquery_health_check

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health check tổng quan cho hệ thống
    """
    bigquery_status = await bigquery_health_check()
    
    return {
        "status": "healthy",
        "service": "FastAPI BigQuery App",
        "version": "1.0.0",
        "dependencies": {
            "bigquery": bigquery_status
        }
    }

@router.get("/ready")
async def readiness_check():
    """
    Readiness check - kiểm tra hệ thống sẵn sàng nhận request
    """
    bigquery_status = await bigquery_health_check()
    
    is_ready = bigquery_status.get("bigquery") == "healthy"
    
    return {
        "ready": is_ready,
        "message": "System is ready" if is_ready else "System not ready",
        "dependencies": {
            "bigquery": bigquery_status
        }
    } 