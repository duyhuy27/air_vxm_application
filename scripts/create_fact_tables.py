#!/usr/bin/env python3
"""
Script tạo cấu trúc Fact Table cho AirVXM Platform
Tạo các bảng dimension và fact table theo mô hình Star Schema
"""

import os
import sys
from google.cloud import bigquery
from google.cloud.exceptions import NotFound
import pandas as pd
from datetime import datetime, timedelta

def create_dimension_tables(client, dataset_id):
    """Tạo các bảng dimension"""
    
    # 1. Dim Locations - Bảng địa điểm
    locations_schema = [
        bigquery.SchemaField("location_id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("location_name", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("district", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("latitude", "FLOAT64", mode="REQUIRED"),
        bigquery.SchemaField("longitude", "FLOAT64", mode="REQUIRED"),
        bigquery.SchemaField("location_type", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("is_active", "BOOLEAN", mode="REQUIRED"),
        bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED"),
        bigquery.SchemaField("updated_at", "TIMESTAMP", mode="REQUIRED")
    ]
    
    locations_table_id = f"{client.project}.{dataset_id}.dim_locations"
    locations_table = bigquery.Table(locations_table_id, schema=locations_schema)
    
    try:
        client.delete_table(locations_table_id, not_found_ok=True)
        locations_table = client.create_table(locations_table)
        print(f"✅ Tạo bảng {locations_table_id}")
    except Exception as e:
        print(f"❌ Lỗi tạo bảng locations: {e}")
        return False
    
    # 2. Dim Time - Bảng thời gian
    time_schema = [
        bigquery.SchemaField("time_id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("timestamp", "TIMESTAMP", mode="REQUIRED"),
        bigquery.SchemaField("year", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("month", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("day", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("hour", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("day_of_week", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("is_weekend", "BOOLEAN", mode="REQUIRED"),
        bigquery.SchemaField("season", "STRING", mode="REQUIRED")
    ]
    
    time_table_id = f"{client.project}.{dataset_id}.dim_time"
    time_table = bigquery.Table(time_table_id, schema=time_schema)
    
    try:
        client.delete_table(time_table_id, not_found_ok=True)
        time_table = client.create_table(time_table)
        print(f"✅ Tạo bảng {time_table_id}")
    except Exception as e:
        print(f"❌ Lỗi tạo bảng time: {e}")
        return False
    
    # 3. Dim Weather Conditions - Bảng điều kiện thời tiết
    weather_schema = [
        bigquery.SchemaField("condition_id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("temperature_range", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("humidity_range", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("wind_speed_range", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("pressure_range", "STRING", mode="REQUIRED")
    ]
    
    weather_table_id = f"{client.project}.{dataset_id}.dim_weather_conditions"
    weather_table = bigquery.Table(weather_table_id, schema=weather_schema)
    
    try:
        client.delete_table(weather_table_id, not_found_ok=True)
        weather_table = client.create_table(weather_table)
        print(f"✅ Tạo bảng {weather_table_id}")
    except Exception as e:
        print(f"❌ Lỗi tạo bảng weather: {e}")
        return False
    
    return True

def create_fact_table(client, dataset_id):
    """Tạo bảng fact chính"""
    
    fact_schema = [
        # Foreign Keys
        bigquery.SchemaField("location_id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("time_id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("weather_condition_id", "STRING", mode="NULLABLE"),
        
        # Measurements
        bigquery.SchemaField("pm2_5", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("pm10", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("no2", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("o3", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("co", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("so2", "FLOAT64", mode="NULLABLE"),
        
        # Calculated AQI
        bigquery.SchemaField("aqi_pm2_5", "INT64", mode="NULLABLE"),
        bigquery.SchemaField("aqi_pm10", "INT64", mode="NULLABLE"),
        bigquery.SchemaField("aqi_no2", "INT64", mode="NULLABLE"),
        bigquery.SchemaField("aqi_o3", "INT64", mode="NULLABLE"),
        bigquery.SchemaField("aqi_co", "INT64", mode="NULLABLE"),
        bigquery.SchemaField("aqi_so2", "INT64", mode="NULLABLE"),
        bigquery.SchemaField("aqi_overall", "INT64", mode="REQUIRED"),
        
        # Weather data
        bigquery.SchemaField("temperature_2m", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("relative_humidity_2m", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("wind_speed_10m", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("wind_direction_10m", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("pressure_msl", "FLOAT64", mode="NULLABLE"),
        
        # Metadata
        bigquery.SchemaField("data_source", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("quality_score", "FLOAT64", mode="REQUIRED"),
        bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED")
    ]
    
    fact_table_id = f"{client.project}.{dataset_id}.fact_air_quality"
    fact_table = bigquery.Table(fact_table_id, schema=fact_schema)
    
    try:
        client.delete_table(fact_table_id, not_found_ok=True)
        fact_table = client.create_table(fact_table)
        print(f"✅ Tạo bảng {fact_table_id}")
        return True
    except Exception as e:
        print(f"❌ Lỗi tạo bảng fact: {e}")
        return False

def create_aggregated_tables(client, dataset_id):
    """Tạo các bảng tổng hợp"""
    
    # 1. Hourly aggregation
    hourly_schema = [
        bigquery.SchemaField("location_id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("year", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("month", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("day", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("hour", "INT64", mode="REQUIRED"),
        
        # Averages
        bigquery.SchemaField("avg_pm2_5", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("avg_aqi", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("avg_temperature", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("avg_humidity", "FLOAT64", mode="NULLABLE"),
        
        # Min/Max
        bigquery.SchemaField("min_pm2_5", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("max_pm2_5", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("min_aqi", "INT64", mode="NULLABLE"),
        bigquery.SchemaField("max_aqi", "INT64", mode="NULLABLE"),
        
        # Counts
        bigquery.SchemaField("record_count", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("last_updated", "TIMESTAMP", mode="REQUIRED")
    ]
    
    hourly_table_id = f"{client.project}.{dataset_id}.agg_hourly"
    hourly_table = bigquery.Table(hourly_table_id, schema=hourly_schema)
    
    try:
        client.delete_table(hourly_table_id, not_found_ok=True)
        hourly_table = client.create_table(hourly_table)
        print(f"✅ Tạo bảng {hourly_table_id}")
    except Exception as e:
        print(f"❌ Lỗi tạo bảng hourly: {e}")
        return False
    
    # 2. Daily aggregation
    daily_schema = [
        bigquery.SchemaField("location_id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("year", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("month", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("day", "INT64", mode="REQUIRED"),
        
        # Daily statistics
        bigquery.SchemaField("daily_avg_aqi", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("daily_max_aqi", "INT64", mode="NULLABLE"),
        bigquery.SchemaField("daily_min_aqi", "INT64", mode="NULLABLE"),
        
        # Health impact
        bigquery.SchemaField("good_hours", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("moderate_hours", "INT64", mode="REQUIRED"),
        bigquery.SchemaField("unhealthy_hours", "INT64", mode="REQUIRED"),
        
        # Weather summary
        bigquery.SchemaField("avg_temperature", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("avg_humidity", "FLOAT64", mode="NULLABLE"),
        bigquery.SchemaField("total_rainfall", "FLOAT64", mode="NULLABLE"),
        
        bigquery.SchemaField("last_updated", "TIMESTAMP", mode="REQUIRED")
    ]
    
    daily_table_id = f"{client.project}.{dataset_id}.agg_daily"
    daily_table = bigquery.Table(daily_table_id, schema=daily_schema)
    
    try:
        client.delete_table(daily_table_id, not_found_ok=True)
        daily_table = client.create_table(daily_table)
        print(f"✅ Tạo bảng {daily_table_id}")
        return True
    except Exception as e:
        print(f"❌ Lỗi tạo bảng daily: {e}")
        return False

def populate_sample_data(client, dataset_id):
    """Tạo dữ liệu mẫu cho các bảng"""
    
    print("\n🔄 Đang tạo dữ liệu mẫu...")
    
    # 1. Populate dim_locations với 30 quận/huyện Hà Nội
    locations_data = [
        # 12 quận nội thành
        ("LOC_001", "Ba Đình", "Ba Đình", 21.0333, 105.8214, "station", True),
        ("LOC_002", "Hoàn Kiếm", "Hoàn Kiếm", 21.0285, 105.8542, "station", True),
        ("LOC_003", "Hai Bà Trưng", "Hai Bà Trưng", 21.0075, 105.8525, "station", True),
        ("LOC_004", "Đống Đa", "Đống Đa", 21.0167, 105.8083, "station", True),
        ("LOC_005", "Tây Hồ", "Tây Hồ", 21.0758, 105.8217, "station", True),
        ("LOC_006", "Cầu Giấy", "Cầu Giấy", 21.0333, 105.7833, "station", True),
        ("LOC_007", "Thanh Xuân", "Thanh Xuân", 21.0167, 105.7833, "station", True),
        ("LOC_008", "Hoàng Mai", "Hoàng Mai", 20.9742, 105.8733, "station", True),
        ("LOC_009", "Long Biên", "Long Biên", 21.0458, 105.8925, "station", True),
        ("LOC_010", "Nam Từ Liêm", "Nam Từ Liêm", 21.0139, 105.7656, "station", True),
        ("LOC_011", "Bắc Từ Liêm", "Bắc Từ Liêm", 21.0667, 105.7333, "station", True),
        ("LOC_012", "Hà Đông", "Hà Đông", 20.9717, 105.7692, "station", True),
        
        # 1 thị xã
        ("LOC_013", "Sơn Tây", "Sơn Tây", 21.1333, 105.5000, "station", True),
        
        # 17 huyện ngoại thành
        ("LOC_014", "Ba Vì", "Ba Vì", 21.2500, 105.4000, "station", True),
        ("LOC_015", "Phúc Thọ", "Phúc Thọ", 21.1167, 105.4167, "station", True),
        ("LOC_016", "Đan Phượng", "Đan Phượng", 21.0833, 105.6167, "station", True),
        ("LOC_017", "Hoài Đức", "Hoài Đức", 21.0000, 105.6833, "station", True),
        ("LOC_018", "Quốc Oai", "Quốc Oai", 21.0333, 105.6000, "station", True),
        ("LOC_019", "Thạch Thất", "Thạch Thất", 21.0167, 105.5667, "station", True),
        ("LOC_020", "Chương Mỹ", "Chương Mỹ", 20.8667, 105.7667, "station", True),
        ("LOC_021", "Thanh Oai", "Thanh Oai", 20.8500, 105.8000, "station", True),
        ("LOC_022", "Thường Tín", "Thường Tín", 20.8333, 105.8833, "station", True),
        ("LOC_023", "Phú Xuyên", "Phú Xuyên", 20.7167, 105.9000, "station", True),
        ("LOC_024", "Ứng Hòa", "Ứng Hòa", 20.7167, 105.7667, "station", True),
        ("LOC_025", "Mỹ Đức", "Mỹ Đức", 20.6833, 105.8000, "station", True),
        ("LOC_026", "Phú Nhuận", "Phú Nhuận", 20.9500, 105.7833, "station", True),
        ("LOC_027", "Gò Vấp", "Gò Vấp", 20.9667, 105.8000, "station", True),
        ("LOC_028", "Tân Bình", "Tân Bình", 20.9833, 105.8167, "station", True),
        ("LOC_029", "Bình Thạnh", "Bình Thạnh", 20.9667, 105.8333, "station", True),
        ("LOC_030", "Phú Yên", "Phú Yên", 20.6500, 105.7500, "station", True)
    ]
    
    now = datetime.now()
    locations_rows = []
    for loc_id, name, district, lat, lng, loc_type, is_active in locations_data:
        locations_rows.append({
            'location_id': loc_id,
            'location_name': name,
            'district': district,
            'latitude': lat,
            'longitude': lng,
            'location_type': loc_type,
            'is_active': is_active,
            'created_at': now,
            'updated_at': now
        })
    
    # Insert vào dim_locations
    locations_table_id = f"{client.project}.{dataset_id}.dim_locations"
    errors = client.insert_rows_json(
        locations_table_id, 
        locations_rows
    )
    
    if errors:
        print(f"❌ Lỗi insert locations: {errors}")
    else:
        print(f"✅ Đã insert {len(locations_rows)} locations")
    
    # 2. Populate dim_time với dữ liệu 30 ngày gần nhất
    time_rows = []
    base_time = datetime.now() - timedelta(days=30)
    
    for i in range(30 * 24):  # 30 ngày * 24 giờ
        current_time = base_time + timedelta(hours=i)
        time_id = current_time.strftime("%Y%m%d_%H")
        
        # Xác định mùa
        month = current_time.month
        if month in [3, 4, 5]:
            season = "spring"
        elif month in [6, 7, 8]:
            season = "summer"
        elif month in [9, 10, 11]:
            season = "autumn"
        else:
            season = "winter"
        
        time_rows.append({
            'time_id': time_id,
            'timestamp': current_time,
            'year': current_time.year,
            'month': current_time.month,
            'day': current_time.day,
            'hour': current_time.hour,
            'day_of_week': current_time.weekday(),
            'is_weekend': current_time.weekday() >= 5,
            'season': season
        })
    
    # Insert vào dim_time
    time_table_id = f"{client.project}.{dataset_id}.dim_time"
    errors = client.insert_rows_json(
        time_table_id, 
        time_rows
    )
    
    if errors:
        print(f"❌ Lỗi insert time: {errors}")
    else:
        print(f"✅ Đã insert {len(time_rows)} time records")
    
    # 3. Populate dim_weather_conditions
    weather_conditions = [
        ("WC_001", "cold", "dry", "calm", "low"),
        ("WC_002", "cool", "normal", "light", "normal"),
        ("WC_003", "warm", "humid", "moderate", "high"),
        ("WC_004", "hot", "dry", "strong", "low")
    ]
    
    weather_rows = []
    for wc_id, temp, humid, wind, pressure in weather_conditions:
        weather_rows.append({
            'condition_id': wc_id,
            'temperature_range': temp,
            'humidity_range': humid,
            'wind_speed_range': wind,
            'pressure_range': pressure
        })
    
    # Insert vào dim_weather_conditions
    weather_table_id = f"{client.project}.{dataset_id}.dim_weather_conditions"
    errors = client.insert_rows_json(
        weather_table_id, 
        weather_rows
    )
    
    if errors:
        print(f"❌ Lỗi insert weather: {errors}")
    else:
        print(f"✅ Đã insert {len(weather_rows)} weather conditions")

def main():
    """Main function"""
    print("🚀 Bắt đầu tạo cấu trúc Fact Table cho AirVXM Platform...")
    
    # Khởi tạo BigQuery client
    try:
        client = bigquery.Client()
        print(f"✅ Kết nối BigQuery thành công: {client.project}")
    except Exception as e:
        print(f"❌ Lỗi kết nối BigQuery: {e}")
        return
    
    dataset_id = "weather_and_air_dataset"
    
    # Kiểm tra dataset có tồn tại không
    try:
        dataset_ref = client.dataset(dataset_id)
        dataset = client.get_dataset(dataset_ref)
        print(f"✅ Dataset {dataset_id} đã tồn tại")
    except NotFound:
        print(f"❌ Dataset {dataset_id} không tồn tại. Vui lòng tạo dataset trước.")
        return
    
    # Tạo các bảng
    print("\n📊 Đang tạo các bảng dimension...")
    if not create_dimension_tables(client, dataset_id):
        print("❌ Không thể tạo dimension tables")
        return
    
    print("\n📊 Đang tạo fact table...")
    if not create_fact_table(client, dataset_id):
        print("❌ Không thể tạo fact table")
        return
    
    print("\n📊 Đang tạo các bảng tổng hợp...")
    if not create_aggregated_tables(client, dataset_id):
        print("❌ Không thể tạo aggregated tables")
        return
    
    # Tạo dữ liệu mẫu
    populate_sample_data(client, dataset_id)
    
    print("\n🎉 Hoàn thành tạo cấu trúc Fact Table!")
    print("\n📋 Các bảng đã tạo:")
    print("  - dim_locations (30 quận/huyện Hà Nội)")
    print("  - dim_time (30 ngày gần nhất)")
    print("  - dim_weather_conditions (4 điều kiện thời tiết)")
    print("  - fact_air_quality (bảng chính)")
    print("  - agg_hourly (tổng hợp theo giờ)")
    print("  - agg_daily (tổng hợp theo ngày)")
    
    print("\n💡 Bước tiếp theo:")
    print("  1. Chạy script migrate_data.py để chuyển dữ liệu từ staging")
    print("  2. Cập nhật API endpoints để sử dụng fact table")
    print("  3. Test các tính năng mới")

if __name__ == "__main__":
    main()

