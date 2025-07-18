"""
Analytics API Endpoints
Các endpoint phân tích dữ liệu từ BigQuery
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.db.bigquery import get_bigquery_client

router = APIRouter()

# GET /api/v1/analytics/dashboard - Dashboard tổng quan
@router.get("/dashboard")
async def get_dashboard_stats() -> Dict[str, Any]:
    """
    Lấy thống kê tổng quan cho dashboard
    """
    try:
        client = get_bigquery_client()
        
        # Query tổng hợp nhiều thống kê
        query = f"""
        WITH user_stats AS (
            SELECT COUNT(*) as total_users
            FROM `{client.project}.demo_dataset.users`
        ),
        item_stats AS (
            SELECT 
                COUNT(*) as total_items,
                AVG(price) as avg_price,
                MAX(price) as max_price,
                MIN(price) as min_price
            FROM `{client.project}.demo_dataset.items`
        )
        SELECT 
            u.total_users,
            i.total_items,
            ROUND(i.avg_price, 2) as avg_price,
            i.max_price,
            i.min_price
        FROM user_stats u, item_stats i
        """
        
        results = list(client.query(query).result())
        if results:
            stats = dict(results[0])
        else:
            stats = {
                "total_users": 0,
                "total_items": 0,
                "avg_price": 0,
                "max_price": 0,
                "min_price": 0
            }
        
        return {
            "dashboard": stats,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

# GET /api/v1/analytics/items-by-category - Phân tích theo category
@router.get("/items-by-category")
async def get_items_by_category():
    """
    Thống kê items theo category
    """
    try:
        client = get_bigquery_client()
        
        query = f"""
        SELECT 
            category,
            COUNT(*) as item_count,
            ROUND(AVG(price), 2) as avg_price,
            ROUND(SUM(price), 2) as total_value
        FROM `{client.project}.demo_dataset.items`
        GROUP BY category
        ORDER BY item_count DESC
        """
        
        results = client.query(query).result()
        categories = [dict(row) for row in results]
        
        return {
            "categories": categories,
            "total_categories": len(categories)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

# GET /api/v1/analytics/trends - Xu hướng theo thời gian
@router.get("/trends")
async def get_trends(days: int = 30):
    """
    Phân tích xu hướng theo thời gian (mặc định 30 ngày)
    """
    try:
        client = get_bigquery_client()
        
        query = f"""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as daily_items
        FROM `{client.project}.demo_dataset.items`
        WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        """
        
        results = client.query(query).result()
        trends = [{"date": str(row.date), "count": row.daily_items} for row in results]
        
        return {
            "trends": trends,
            "period_days": days,
            "total_days": len(trends)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}") 