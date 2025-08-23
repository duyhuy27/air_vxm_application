#!/usr/bin/env python3
"""
Script để kiểm tra các bảng có sẵn trong dataset
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.bigquery import get_bigquery_client
from app.core.config import settings

def check_available_tables():
    """Kiểm tra các bảng có sẵn trong dataset"""
    print("🔍 Checking available tables in dataset...")
    
    try:
        client = get_bigquery_client()
        project_id = settings.GOOGLE_CLOUD_PROJECT
        dataset_id = settings.BIGQUERY_DATASET
        
        print(f"🔍 Using project: {project_id}, dataset: {dataset_id}")
        
        # Lấy danh sách tất cả các bảng trong dataset
        dataset_ref = client.dataset(dataset_id)
        tables = list(client.list_tables(dataset_ref))
        
        if not tables:
            print("❌ No tables found in dataset")
            return False
        
        print(f"✅ Found {len(tables)} tables in dataset:")
        for table in tables:
            print(f"  - {table.table_id}")
            
            # Lấy schema của bảng
            try:
                table_obj = client.get_table(table)
                print(f"    Columns: {len(table_obj.schema)}")
                for field in table_obj.schema[:5]:  # Chỉ hiển thị 5 cột đầu
                    print(f"      - {field.name}: {field.field_type}")
                if len(table_obj.schema) > 5:
                    print(f"      ... and {len(table_obj.schema) - 5} more columns")
            except Exception as e:
                print(f"    Error getting schema: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        return False

if __name__ == "__main__":
    success = check_available_tables()
    if not success:
        sys.exit(1)
