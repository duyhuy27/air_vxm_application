#!/usr/bin/env python3
"""
Script kiểm tra cấu trúc bảng fact hiện có trong BigQuery
"""

from google.cloud import bigquery
import pandas as pd

def check_fact_table_structure():
    """Kiểm tra cấu trúc bảng fact"""
    
    try:
        client = bigquery.Client()
        print(f"✅ Kết nối BigQuery thành công: {client.project}")
        
        dataset_id = "weather_and_air_dataset"
        
        # Kiểm tra các bảng có sẵn
        print(f"\n📊 Kiểm tra dataset: {dataset_id}")
        
        # Lấy danh sách tất cả bảng trong dataset
        tables = list(client.list_tables(dataset_id))
        print(f"📋 Các bảng có sẵn:")
        for table in tables:
            print(f"  - {table.table_id}")
        
        # Kiểm tra cấu trúc bảng fact_air_quality nếu có
        fact_table_id = f"{client.project}.{dataset_id}.fact_air_quality"
        try:
            table = client.get_table(fact_table_id)
            print(f"\n🔍 Cấu trúc bảng {fact_table_id}:")
            for field in table.schema:
                print(f"  - {field.name}: {field.field_type} ({field.mode})")
        except Exception as e:
            print(f"❌ Không tìm thấy bảng fact_air_quality: {e}")
        
        # Kiểm tra các bảng khác có thể liên quan
        for table_name in ['dim_locations', 'dim_time', 'Staging_RawData', 'Daily_Aggregated_Data']:
            try:
                table_id = f"{client.project}.{dataset_id}.{table_name}"
                table = client.get_table(table_id)
                print(f"\n🔍 Cấu trúc bảng {table_name}:")
                for field in table.schema:
                    print(f"  - {field.name}: {field.field_type} ({field.mode})")
            except Exception as e:
                print(f"❌ Không tìm thấy bảng {table_name}")
        
        # Kiểm tra dữ liệu mẫu
        print(f"\n📊 Kiểm tra dữ liệu mẫu:")
        
        # Thử query fact table nếu có
        try:
            query = f"""
            SELECT * FROM `{fact_table_id}` 
            LIMIT 5
            """
            df = client.query(query).to_dataframe()
            if not df.empty:
                print(f"✅ Fact table có {len(df)} records mẫu:")
                print(df.head())
            else:
                print("⚠️ Fact table trống")
        except Exception as e:
            print(f"❌ Không thể query fact table: {e}")
        
        # Thử query staging table
        try:
            staging_table_id = f"{client.project}.{dataset_id}.Staging_RawData"
            query = f"""
            SELECT * FROM `{staging_table_id}` 
            LIMIT 5
            """
            df = client.query(query).to_dataframe()
            if not df.empty:
                print(f"✅ Staging table có {len(df)} records mẫu:")
                print(df.head())
            else:
                print("⚠️ Staging table trống")
        except Exception as e:
            print(f"❌ Không thể query staging table: {e}")
        
        # Kiểm tra số lượng records trong mỗi bảng
        print(f"\n📊 Số lượng records trong các bảng:")
        for table in tables:
            try:
                query = f"""
                SELECT COUNT(*) as count FROM `{client.project}.{dataset_id}.{table.table_id}`
                """
                result = client.query(query).to_dataframe()
                count = result.iloc[0]['count']
                print(f"  - {table.table_id}: {count:,} records")
            except Exception as e:
                print(f"  - {table.table_id}: Không thể đếm ({e})")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")

def test_sql_queries():
    """Test các SQL queries cơ bản"""
    
    try:
        client = bigquery.Client()
        dataset_id = "weather_and_air_dataset"
        
        print(f"\n🧪 Test SQL queries:")
        
        # Test 1: Lấy dữ liệu mới nhất
        try:
            query = f"""
            SELECT 
                time, latitude, longitude, pm2_5, temperature_2m, 
                relative_humidity_2m, wind_speed_10m
            FROM `{client.project}.{dataset_id}.Staging_RawData`
            WHERE DATE(time) = CURRENT_DATE()
            ORDER BY time DESC
            LIMIT 10
            """
            df = client.query(query).to_dataframe()
            if not df.empty:
                print(f"✅ Query 1 - Dữ liệu hôm nay: {len(df)} records")
                print(df.head(3))
            else:
                print("⚠️ Query 1 - Không có dữ liệu hôm nay")
        except Exception as e:
            print(f"❌ Query 1 lỗi: {e}")
        
        # Test 2: Lấy dữ liệu theo location
        try:
            query = f"""
            SELECT 
                latitude, longitude, 
                COUNT(*) as record_count,
                AVG(pm2_5) as avg_pm2_5,
                MAX(time) as latest_time
            FROM `{client.project}.{dataset_id}.Staging_RawData`
            WHERE DATE(time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
            GROUP BY latitude, longitude
            ORDER BY record_count DESC
            LIMIT 5
            """
            df = client.query(query).to_dataframe()
            if not df.empty:
                print(f"✅ Query 2 - Thống kê theo location: {len(df)} locations")
                print(df.head(3))
            else:
                print("⚠️ Query 2 - Không có dữ liệu")
        except Exception as e:
            print(f"❌ Query 2 lỗi: {e}")
        
        # Test 3: Lấy dữ liệu theo thời gian
        try:
            query = f"""
            SELECT 
                DATE(time) as date,
                HOUR(time) as hour,
                AVG(pm2_5) as avg_pm2_5,
                AVG(temperature_2m) as avg_temperature,
                COUNT(*) as record_count
            FROM `{client.project}.{dataset_id}.Staging_RawData`
            WHERE DATE(time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
            GROUP BY DATE(time), HOUR(time)
            ORDER BY date DESC, hour DESC
            LIMIT 10
            """
            df = client.query(query).to_dataframe()
            if not df.empty:
                print(f"✅ Query 3 - Thống kê theo thời gian: {len(df)} records")
                print(df.head(3))
            else:
                print("⚠️ Query 3 - Không có dữ liệu")
        except Exception as e:
            print(f"❌ Query 3 lỗi: {e}")
        
    except Exception as e:
        print(f"❌ Lỗi test queries: {e}")

if __name__ == "__main__":
    print("🔍 Kiểm tra cấu trúc bảng fact trong BigQuery...")
    check_fact_table_structure()
    test_sql_queries()

