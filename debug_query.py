#!/usr/bin/env python3
"""
Script debug query trong API stats
"""

import os
from google.cloud import bigquery
from datetime import datetime, timedelta

def debug_stats_query():
    """Debug query trong API stats"""
    
    try:
        # Set credentials
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'credentials/invertible-now-462103-m3-c75684b0bb78.json'
        
        # Khởi tạo client
        client = bigquery.Client()
        print(f"✅ Kết nối BigQuery thành công: {client.project}")
        
        # Test 1: Kiểm tra dữ liệu trong 24 giờ qua
        print("\n🔍 Test 1: Kiểm tra dữ liệu trong 24 giờ qua")
        time_query = """
        SELECT 
            MIN(timestamp) as min_time,
            MAX(timestamp) as max_time,
            COUNT(*) as total_records
        FROM `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
        """
        
        time_df = client.query(time_query).to_dataframe()
        if not time_df.empty:
            print(f"  - Min time: {time_df.iloc[0]['min_time']}")
            print(f"  - Max time: {time_df.iloc[0]['max_time']}")
            print(f"  - Total records: {time_df.iloc[0]['total_records']}")
        else:
            print("  - Không có dữ liệu trong 24 giờ qua")
        
        # Test 2: Kiểm tra dữ liệu trong 7 ngày qua
        print("\n🔍 Test 2: Kiểm tra dữ liệu trong 7 ngày qua")
        time_query_7d = """
        SELECT 
            MIN(timestamp) as min_time,
            MAX(timestamp) as max_time,
            COUNT(*) as total_records
        FROM `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
        """
        
        time_df_7d = client.query(time_query_7d).to_dataframe()
        if not time_df_7d.empty:
            print(f"  - Min time: {time_df_7d.iloc[0]['min_time']}")
            print(f"  - Max time: {time_df_7d.iloc[0]['max_time']}")
            print(f"  - Total records: {time_df_7d.iloc[0]['total_records']}")
        else:
            print("  - Không có dữ liệu trong 7 ngày qua")
        
        # Test 3: Kiểm tra dữ liệu trong 30 ngày qua
        print("\n🔍 Test 3: Kiểm tra dữ liệu trong 30 ngày qua")
        time_query_30d = """
        SELECT 
            MIN(timestamp) as min_time,
            MAX(timestamp) as max_time,
            COUNT(*) as total_records
        FROM `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        """
        
        time_df_30d = client.query(time_query_30d).to_dataframe()
        if not time_df_30d.empty:
            print(f"  - Min time: {time_df_30d.iloc[0]['min_time']}")
            print(f"  - Max time: {time_df_30d.iloc[0]['max_time']}")
            print(f"  - Total records: {time_df_30d.iloc[0]['total_records']}")
        else:
            print("  - Không có dữ liệu trong 30 ngày qua")
        
        # Test 4: Kiểm tra cấu trúc bảng Fact_Weather_AirQuality
        print("\n🔍 Test 4: Kiểm tra cấu trúc bảng Fact_Weather_AirQuality")
        try:
            table_id = f"{client.project}.weather_and_air_dataset.Fact_Weather_AirQuality"
            table = client.get_table(table_id)
            print(f"  - Các cột trong Fact_Weather_AirQuality:")
            for field in table.schema[:10]:  # Chỉ hiển thị 10 cột đầu
                print(f"    + {field.name}: {field.field_type}")
            if len(table.schema) > 10:
                print(f"    ... và {len(table.schema) - 10} cột khác")
        except Exception as e:
            print(f"  - Lỗi khi lấy cấu trúc bảng: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

if __name__ == "__main__":
    debug_stats_query()
