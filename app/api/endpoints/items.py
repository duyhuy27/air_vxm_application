"""
Items API Endpoints  
Các endpoint quản lý sản phẩm/items
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.db.bigquery import get_bigquery_client

router = APIRouter()

# Pydantic models
class ItemCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str

class ItemResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    created_at: str

# GET /api/v1/items - Lấy danh sách items
@router.get("/", response_model=List[ItemResponse])
async def get_items(
    category: Optional[str] = None, 
    limit: int = 20
):
    """
    Lấy danh sách items, có thể filter theo category
    """
    try:
        client = get_bigquery_client()
        
        # Build query với conditional WHERE
        where_clause = ""
        if category:
            where_clause = f"WHERE category = '{category}'"
        
        query = f"""
        SELECT 
            CAST(id as STRING) as id,
            name,
            description,
            price,
            category,
            FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', created_at) as created_at
        FROM `{client.project}.demo_dataset.items`
        {where_clause}
        ORDER BY created_at DESC
        LIMIT {limit}
        """
        
        results = client.query(query).result()
        items = [dict(row) for row in results]
        
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# POST /api/v1/items - Tạo item mới
@router.post("/", response_model=ItemResponse)
async def create_item(item: ItemCreate):
    """
    Tạo item mới
    """
    try:
        client = get_bigquery_client()
        
        query = f"""
        INSERT INTO `{client.project}.demo_dataset.items` 
        (name, description, price, category, created_at)
        VALUES (
            '{item.name}', 
            '{item.description}', 
            {item.price}, 
            '{item.category}', 
            CURRENT_TIMESTAMP()
        )
        """
        
        client.query(query).result()
        
        return ItemResponse(
            id="generated_id",
            name=item.name,
            description=item.description,
            price=item.price,
            category=item.category,
            created_at="2024-01-01 00:00:00"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# GET /api/v1/items/categories - Lấy danh sách categories
@router.get("/categories")
async def get_categories():
    """
    Lấy danh sách unique categories
    """
    try:
        client = get_bigquery_client()
        
        query = f"""
        SELECT DISTINCT category, COUNT(*) as count
        FROM `{client.project}.demo_dataset.items`
        GROUP BY category
        ORDER BY count DESC
        """
        
        results = client.query(query).result()
        categories = [{"category": row.category, "count": row.count} for row in results]
        
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 