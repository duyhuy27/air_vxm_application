#!/usr/bin/env python3
"""
Script kiểm tra cấu trúc bảng Dim_Time
"""

import os
from google.cloud import bigquery

def check_dim_time_structure():
    """Kiểm tra cấu trúc bảng Dim_Time"""
    
    try:
        # Set credentials
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'credentials/invertible-now-462103-m3-c75684b0bb78.json'
        
        # Khởi tạo client
        client = bigquery.Client()
        print(f"✅ Kết nối BigQuery thành công: {client.project}")
        
        # Kiểm tra cấu trúc bảng Dim_Time
        table_id = f"{client.project}.weather_and_air_dataset.Dim_Time"
        table = client.get_table(table_id)
        
        print(f"\n🔍 Cấu trúc bảng {table_id}:")
        for field in table.schema:
            print(f"  - {field.name}: {field.field_type} ({field.mode})")
        
        # Kiểm tra dữ liệu mẫu
        query = f"SELECT * FROM `{table_id}` LIMIT 3"
        df = client.query(query).to_dataframe()
        
        print(f"\n📊 Dữ liệu mẫu (3 records đầu):")
        print(df)
        
        # Kiểm tra tổng số records
        count_query = f"SELECT COUNT(*) as total FROM `{table_id}`"
        count_df = client.query(count_query).to_dataframe()
        total_records = count_df.iloc[0]['total']
        
        print(f"\n📈 Tổng số records: {total_records}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

if __name__ == "__main__":
    check_dim_time_structure()
