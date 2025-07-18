"""
Users API Endpoints
Các endpoint quản lý người dùng
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from app.db.bigquery import get_bigquery_client

router = APIRouter()

# Pydantic models cho request/response
class UserCreate(BaseModel):
    name: str
    email: str
    age: int

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    age: int
    created_at: str

# GET /api/v1/users - Lấy danh sách users
@router.get("/", response_model=List[UserResponse])
async def get_users(limit: int = 10):
    """
    Lấy danh sách users từ BigQuery
    """
    try:
        client = get_bigquery_client()
        
        # Sample query - thay đổi theo bảng thực tế của bạn
        query = f"""
        SELECT 
            CAST(id as STRING) as id,
            name,
            email,
            age,
            FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', created_at) as created_at
        FROM `{client.project}.demo_dataset.users`
        LIMIT {limit}
        """
        
        results = client.query(query).result()
        users = [dict(row) for row in results]
        
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# POST /api/v1/users - Tạo user mới
@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """
    Tạo user mới trong BigQuery
    """
    try:
        client = get_bigquery_client()
        
        # Insert query - thay đổi theo schema thực tế
        query = f"""
        INSERT INTO `{client.project}.demo_dataset.users` (name, email, age, created_at)
        VALUES ('{user.name}', '{user.email}', {user.age}, CURRENT_TIMESTAMP())
        """
        
        client.query(query).result()
        
        # Return created user (simplified)
        return UserResponse(
            id="generated_id",
            name=user.name,
            email=user.email,
            age=user.age,
            created_at="2024-01-01 00:00:00"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# GET /api/v1/users/{user_id} - Lấy user theo ID
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """
    Lấy thông tin user theo ID
    """
    try:
        client = get_bigquery_client()
        
        query = f"""
        SELECT 
            CAST(id as STRING) as id,
            name,
            email,
            age,
            FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', created_at) as created_at
        FROM `{client.project}.demo_dataset.users`
        WHERE CAST(id as STRING) = '{user_id}'
        LIMIT 1
        """
        
        results = list(client.query(query).result())
        if not results:
            raise HTTPException(status_code=404, detail="User not found")
        
        return dict(results[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 