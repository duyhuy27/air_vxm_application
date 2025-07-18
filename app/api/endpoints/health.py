"""
Health Check Endpoints
Kiểm tra tình trạng hệ thống và các dependencies
"""
from fastapi import APIRouter
from app.db.bigquery import bigquery_health_check

router = APIRouter()

@router.get("/health")
async def detailed_health_check():
    """
    Detailed health check với BigQuery dependencies
    Endpoint này cho monitoring và debugging
    """
    try:
        bigquery_status = await bigquery_health_check()
        
        return {
            "status": "healthy",
            "service": "FastAPI BigQuery App",
            "version": "1.0.0",
            "timestamp": "2024-01-20T10:30:00Z",
            "bigquery": bigquery_status
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "FastAPI BigQuery App", 
            "version": "1.0.0",
            "error": str(e),
            "bigquery": {"status": "error", "error": str(e)}
        }

@router.get("/ready")
async def readiness_check():
    """
    Readiness check - kiểm tra hệ thống sẵn sàng nhận request
    """
    try:
        bigquery_status = await bigquery_health_check()
        is_ready = bigquery_status.get("bigquery") == "healthy"
        
        return {
            "ready": is_ready,
            "message": "System is ready" if is_ready else "System not ready",
            "dependencies": {
                "bigquery": bigquery_status
            }
        }
    except Exception as e:
        return {
            "ready": False,
            "message": "System not ready - BigQuery connection failed",
            "error": str(e)
        } 