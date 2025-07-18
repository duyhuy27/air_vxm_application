"""
BigQuery Database Layer
Quản lý kết nối và operations với Google BigQuery
"""
import os
import json
import base64
from typing import Optional
import pandas as pd
from google.cloud import bigquery
from google.oauth2 import service_account
from app.core.config import settings

# Global client instance - sẽ được khởi tạo khi cần
_bigquery_client: Optional[bigquery.Client] = None

def get_credentials():
    """
    Lấy credentials từ environment variable hoặc file
    Priority: Environment variable > File
    """
    # Thử lấy từ environment variable trước (cho production/Railway)
    credentials_base64 = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_BASE64")
    
    if credentials_base64:
        try:
            # Decode base64 thành JSON
            credentials_json = base64.b64decode(credentials_base64).decode('utf-8')
            credentials_dict = json.loads(credentials_json)
            
            # Tạo credentials từ dict
            credentials = service_account.Credentials.from_service_account_info(credentials_dict)
            print("✅ Using credentials from environment variable (Railway)")
            return credentials
            
        except Exception as e:
            print(f"❌ Error decoding credentials from environment: {e}")
            # Fall back to file method
    
    # Fallback: đọc từ file (cho local development)
    credentials_file = settings.GOOGLE_APPLICATION_CREDENTIALS
    if os.path.exists(credentials_file):
        try:
            credentials = service_account.Credentials.from_service_account_file(credentials_file)
            print(f"✅ Using credentials from file: {credentials_file}")
            return credentials
        except Exception as e:
            print(f"❌ Error loading credentials from file: {e}")
            raise e
    
    # Không tìm thấy credentials
    raise FileNotFoundError("No valid credentials found. Please set GOOGLE_APPLICATION_CREDENTIALS_BASE64 environment variable or provide credentials file.")

def get_bigquery_client() -> bigquery.Client:
    """
    Singleton pattern để lấy BigQuery client
    Sử dụng service account credentials từ environment hoặc file
    """
    global _bigquery_client
    
    if _bigquery_client is None:
        try:
            # Lấy credentials (từ env hoặc file)
            credentials = get_credentials()
            
            # Khởi tạo client với service account credentials
            _bigquery_client = bigquery.Client(
                credentials=credentials,
                project=settings.GOOGLE_CLOUD_PROJECT
            )
            
            print(f"✅ BigQuery client initialized for project: {settings.GOOGLE_CLOUD_PROJECT}")
            
        except Exception as e:
            print(f"❌ Error initializing BigQuery client: {e}")
            raise e
    
    return _bigquery_client

def test_connection() -> bool:
    """
    Test kết nối BigQuery
    """
    try:
        client = get_bigquery_client()
        
        # Simple query để test connection
        query = "SELECT 1 as test_value"
        results = client.query(query).result()
        
        for row in results:
            if row.test_value == 1:
                return True
        
        return False
    except Exception as e:
        print(f"❌ BigQuery connection test failed: {e}")
        return False

def create_sample_tables():
    """
    Tạo các bảng mẫu cho demo (chạy 1 lần duy nhất)
    Bạn có thể custom lại schema theo nhu cầu
    """
    try:
        client = get_bigquery_client()
        dataset_id = settings.BIGQUERY_DATASET
        
        # Tạo dataset nếu chưa có
        dataset_ref = client.dataset(dataset_id)
        try:
            client.get_dataset(dataset_ref)
            print(f"✅ Dataset {dataset_id} already exists")
        except:
            dataset = bigquery.Dataset(dataset_ref)
            dataset.location = "US"  # Hoặc region bạn muốn
            client.create_dataset(dataset)
            print(f"✅ Created dataset {dataset_id}")
        
        # Schema cho bảng users
        users_schema = [
            bigquery.SchemaField("id", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("name", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("email", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("age", "INTEGER", mode="NULLABLE"),
            bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED"),
        ]
        
        # Schema cho bảng items
        items_schema = [
            bigquery.SchemaField("id", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("name", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("description", "STRING", mode="NULLABLE"),
            bigquery.SchemaField("price", "FLOAT", mode="REQUIRED"),
            bigquery.SchemaField("category", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED"),
        ]
        
        # Tạo tables
        tables = [
            ("users", users_schema),
            ("items", items_schema)
        ]
        
        for table_name, schema in tables:
            table_ref = dataset_ref.table(table_name)
            try:
                client.get_table(table_ref)
                print(f"✅ Table {table_name} already exists")
            except:
                table = bigquery.Table(table_ref, schema=schema)
                client.create_table(table)
                print(f"✅ Created table {table_name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample tables: {e}")
        return False

def insert_sample_data():
    """
    Insert sample data để test (chạy 1 lần)
    """
    try:
        client = get_bigquery_client()
        
        # Sample users data
        users_data = [
            {"id": 1, "name": "John Doe", "email": "john@example.com", "age": 30},
            {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "age": 25},
            {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "age": 35},
        ]
        
        # Sample items data
        items_data = [
            {"id": 1, "name": "Laptop", "description": "Gaming laptop", "price": 1200.0, "category": "Electronics"},
            {"id": 2, "name": "Mouse", "description": "Wireless mouse", "price": 25.0, "category": "Electronics"},
            {"id": 3, "name": "Book", "description": "Python programming", "price": 35.0, "category": "Books"},
            {"id": 4, "name": "Chair", "description": "Office chair", "price": 150.0, "category": "Furniture"},
        ]
        
        # Insert users
        users_table = f"{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.users"
        for user in users_data:
            query = f"""
            INSERT INTO `{users_table}` (id, name, email, age, created_at)
            VALUES ({user['id']}, '{user['name']}', '{user['email']}', {user['age']}, CURRENT_TIMESTAMP())
            """
            client.query(query).result()
        
        # Insert items
        items_table = f"{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.items"
        for item in items_data:
            query = f"""
            INSERT INTO `{items_table}` (id, name, description, price, category, created_at)
            VALUES ({item['id']}, '{item['name']}', '{item['description']}', {item['price']}, '{item['category']}', CURRENT_TIMESTAMP())
            """
            client.query(query).result()
        
        print("✅ Sample data inserted successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {e}")
        return False

# Health check function cho API
async def bigquery_health_check() -> dict:
    """
    Health check cho BigQuery connection
    """
    try:
        is_connected = test_connection()
        
        # Kiểm tra credentials source
        credentials_source = "environment" if os.getenv("GOOGLE_APPLICATION_CREDENTIALS_BASE64") else "file"
        
        return {
            "bigquery": "healthy" if is_connected else "unhealthy",
            "project": settings.GOOGLE_CLOUD_PROJECT,
            "dataset": settings.BIGQUERY_DATASET,
            "credentials_source": credentials_source
        }
    except Exception as e:
        return {
            "bigquery": "error",
            "error": str(e)
        } 