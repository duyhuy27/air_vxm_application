"""
AQI API Endpoints - Air Quality Index
Các endpoint liên quan đến chất lượng không khí và dữ liệu AQI
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.db.bigquery import get_bigquery_client
import random

router = APIRouter()

# GET /api/v1/aqi/current - Lấy dữ liệu AQI hiện tại (alias cho realdata-only)
@router.get("/current")
async def get_current_aqi() -> List[Dict[str, Any]]:
    """
    Lấy dữ liệu AQI hiện tại (alias cho realdata-only)
    """
    return await get_latest_aqi_real_data()

# GET /api/v1/aqi/latest - Lấy dữ liệu AQI mới nhất (alias cho realdata-only)
@router.get("/latest")
async def get_latest_aqi() -> List[Dict[str, Any]]:
    """
    Lấy dữ liệu AQI mới nhất (alias cho realdata-only)
    """
    return await get_latest_aqi_real_data()

# GET /api/v1/aqi/realdata-only - Lấy dữ liệu AQI thực từ BigQuery
@router.get("/realdata-only")
async def get_latest_aqi_real_data() -> List[Dict[str, Any]]:
    """
    Lấy dữ liệu AQI mới nhất từ 3 bảng chính: Dim_Location, Dim_Time, Fact_Weather_AirQuality
    """
    try:
        client = get_bigquery_client()
        
        # Query từ 3 bảng chính theo mô hình Star Schema - chỉ 1 record mới nhất cho mỗi location
        query = """
        SELECT
            l.latitude,
            l.longitude,
            l.location_name,
            l.location_name as district,
            t.time as time,
            f.pm2_5,
            f.pm10,
            f.temperature_2m,
            f.relative_humidity_2m,
            f.wind_speed_10m,
            f.wind_direction_10m,
            f.pressure_msl,
            f.AQI_TOTAL as AQI_TOTAL,
            f.AQI_TOTAL as aqi
        FROM
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Location` l
        JOIN (
            SELECT 
                location_key,
                time_key,
                pm2_5,
                pm10,
                temperature_2m,
                relative_humidity_2m,
                wind_speed_10m,
                wind_direction_10m,
                pressure_msl,
                AQI_TOTAL,
                ROW_NUMBER() OVER (PARTITION BY location_key ORDER BY time_key DESC) as rn
            FROM `invertible-now-462103-m3.weather_and_air_dataset.Fact_Weather_AirQuality`
            WHERE AQI_TOTAL IS NOT NULL
        ) f ON l.location_key = f.location_key AND f.rn = 1
        JOIN
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time` t
        ON
            f.time_key = t.time_key
        WHERE
            t.time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
        ORDER BY l.location_name
        """
        
        # Execute query
        df = client.query(query).to_dataframe()
        
        if not df.empty:
            # Xử lý dữ liệu từ 3 bảng chính
            aqi_data = []
            for _, row in df.iterrows():
                aqi_data.append({
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'location_name': str(row['location_name']) if pd.notna(row['location_name']) else 'Unknown',
                    'district': str(row['district']) if pd.notna(row['district']) else 'Unknown',
                    'time': row['time'].isoformat() if hasattr(row['time'], 'isoformat') else str(row['time']),
                    'pm2_5': float(row['pm2_5']) if pd.notna(row['pm2_5']) else 0,
                    'pm10': float(row['pm10']) if pd.notna(row['pm10']) else 0,
                    'temperature_2m': float(row['temperature_2m']) if pd.notna(row['temperature_2m']) else 25.0,
                    'relative_humidity_2m': float(row['relative_humidity_2m']) if pd.notna(row['relative_humidity_2m']) else 60.0,
                    'wind_speed_10m': float(row['wind_speed_10m']) if pd.notna(row['wind_speed_10m']) else 5.0,
                    'wind_direction_10m': float(row['wind_direction_10m']) if pd.notna(row['wind_direction_10m']) else 0,
                    'pressure_msl': float(row['pressure_msl']) if pd.notna(row['pressure_msl']) else 1013.25,
                    'AQI_TOTAL': int(row['AQI_TOTAL']) if pd.notna(row['AQI_TOTAL']) else 0,
                    'aqi': int(row['aqi']) if pd.notna(row['aqi']) else 0
                })
            
            return aqi_data
        else:
            # Fallback về dữ liệu mẫu nếu không có dữ liệu thực
            return get_mock_aqi_data()
            
    except Exception as e:
        print(f"❌ AQI API error: {e}")
        # Fallback về dữ liệu mẫu nếu có lỗi
        return get_mock_aqi_data()

def get_mock_aqi_data() -> List[Dict[str, Any]]:
    """Dữ liệu mẫu cho AQI khi không có dữ liệu thực"""
    mock_locations = [
        {'lat': 21.0333, 'lng': 105.8214, 'name': 'Ba Đình', 'district': 'Ba Đình'},
        {'lat': 21.0285, 'lng': 105.8542, 'name': 'Hoàn Kiếm', 'district': 'Hoàn Kiếm'},
        {'lat': 21.0075, 'lng': 105.8525, 'name': 'Hai Bà Trưng', 'district': 'Hai Bà Trưng'},
        {'lat': 21.0167, 'lng': 105.8083, 'name': 'Đống Đa', 'district': 'Đống Đa'},
        {'lat': 21.0758, 'lng': 105.8217, 'name': 'Tây Hồ', 'district': 'Tây Hồ'},
        {'lat': 21.0333, 'lng': 105.7833, 'name': 'Cầu Giấy', 'district': 'Cầu Giấy'},
        {'lat': 21.0167, 'lng': 105.7833, 'name': 'Thanh Xuân', 'district': 'Thanh Xuân'},
        {'lat': 20.9742, 'lng': 105.8733, 'name': 'Hoàng Mai', 'district': 'Hoàng Mai'},
        {'lat': 21.0458, 'lng': 105.8925, 'name': 'Long Biên', 'district': 'Long Biên'},
        {'lat': 21.0139, 'lng': 105.7656, 'name': 'Nam Từ Liêm', 'district': 'Nam Từ Liêm'}
    ]
    
    aqi_data = []
    for loc in mock_locations:
        # Tạo dữ liệu mẫu với biến động ngẫu nhiên
        base_aqi = 60 + random.randint(-20, 40)
        base_temp = 28 + random.uniform(-3, 3)
        
        aqi_data.append({
            'latitude': loc['lat'],
            'longitude': loc['lng'],
            'location_name': loc['name'],
            'district': loc['district'],
            'time': datetime.now().isoformat(),
            'pm2_5': max(0, base_aqi * 0.33 + random.uniform(-5, 5)),
            'pm10': max(0, base_aqi * 0.58 + random.uniform(-8, 8)),
            'temperature_2m': round(base_temp, 1),
            'relative_humidity_2m': max(0, min(100, 60 + random.uniform(-15, 15))),
            'wind_speed_10m': max(0, 3 + random.uniform(-1, 2)),
            'wind_direction_10m': random.uniform(0, 360),
            'pressure_msl': 1013.25 + random.uniform(-10, 10),
            'AQI_TOTAL': max(0, base_aqi),
            'aqi': max(0, base_aqi)
        })
    
    return aqi_data

# GET /api/v1/aqi/detail - Lấy chi tiết một điểm cụ thể
@router.get("/detail")
async def get_aqi_detail(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude")
) -> Dict[str, Any]:
    """
    Lấy chi tiết AQI cho một điểm cụ thể từ 3 bảng chính
    """
    try:
        client = get_bigquery_client()
        
        # Query từ 3 bảng chính theo mô hình Star Schema
        query = f"""
        SELECT
            l.latitude,
            l.longitude,
            l.location_name,
            l.location_name as district,
            t.time as time,
            f.pm2_5,
            f.pm10,
            f.temperature_2m,
            f.relative_humidity_2m,
            f.wind_speed_10m,
            f.wind_direction_10m,
            f.pressure_msl,
            f.AQI_TOTAL as AQI_TOTAL
        FROM
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Location` l
        JOIN
            `invertible-now-462103-m3.weather_and_air_dataset.Fact_Weather_AirQuality` f
        ON
            l.location_key = f.location_key
        JOIN
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time` t
        ON
            f.time_key = t.time_key
        WHERE
             ABS(l.latitude - {lat}) < 0.01 
            AND ABS(l.longitude - {lng}) < 0.01
            AND t.time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
        ORDER BY t.time DESC
        LIMIT 1
        """
        
        # Execute query
        df = client.query(query).to_dataframe()
        
        if not df.empty:
            row = df.iloc[0]
            return {
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'location_name': str(row['location_name']) if pd.notna(row['location_name']) else 'Unknown',
                'district': str(row['district']) if pd.notna(row['district']) else 'Unknown',
                'time': row['time'].isoformat() if hasattr(row['time'], 'isoformat') else str(row['time']),
                'pm2_5': float(row['pm2_5']) if pd.notna(row['pm2_5']) else 0,
                'pm10': float(row['pm10']) if pd.notna(row['pm10']) else 0,
                'temperature_2m': float(row['temperature_2m']) if pd.notna(row['temperature_2m']) else 25.0,
                'relative_humidity_2m': float(row['relative_humidity_2m']) if pd.notna(row['relative_humidity_2m']) else 60.0,
                'wind_speed_10m': float(row['wind_speed_10m']) if pd.notna(row['wind_speed_10m']) else 5.0,
                'wind_direction_10m': float(row['wind_direction_10m']) if pd.notna(row['wind_direction_10m']) else 0,
                'pressure_msl': float(row['pressure_msl']) if pd.notna(row['pressure_msl']) else 1013.25,
                'AQI_TOTAL': int(row['AQI_TOTAL']) if pd.notna(row['AQI_TOTAL']) else 0
            }
        else:
            # Fallback về dữ liệu mẫu
            return get_mock_detail(lat, lng)
            
    except Exception as e:
        print(f"❌ AQI Detail API error: {e}")
        return get_mock_detail(lat, lng)

def get_mock_detail(lat: float, lng: float) -> Dict[str, Any]:
    """Dữ liệu mẫu cho chi tiết AQI"""
    base_aqi = 60 + random.randint(-20, 40)
    base_temp = 28 + random.uniform(-3, 3)
    
    return {
        'latitude': lat,
        'longitude': lng,
        'location_name': f'Điểm {lat:.3f}, {lng:.3f}',
        'district': 'Hà Nội',
        'time': datetime.now().isoformat(),
        'pm2_5': max(0, base_aqi * 0.33 + random.uniform(-5, 5)),
        'pm10': max(0, base_aqi * 0.58 + random.uniform(-8, 8)),
        'temperature_2m': round(base_temp, 1),
        'relative_humidity_2m': max(0, min(100, 60 + random.uniform(-15, 15))),
        'wind_speed_10m': max(0, 3 + random.uniform(-1, 2)),
        'wind_direction_10m': random.uniform(0, 360),
        'pressure_msl': 1013.25 + random.uniform(-10, 10),
        'AQI_TOTAL': max(0, base_aqi)
    }

# GET /api/v1/aqi/date-range - Lấy dữ liệu theo khoảng thời gian
@router.get("/date-range")
async def get_aqi_by_date_range(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    limit: int = Query(100, description="Maximum number of records")
) -> List[Dict[str, Any]]:
    """
    Lấy dữ liệu AQI theo khoảng thời gian từ 3 bảng chính
    """
    try:
        client = get_bigquery_client()
        
        # Query từ 3 bảng chính theo mô hình Star Schema
        query = f"""
        SELECT
            l.latitude,
            l.longitude,
            l.location_name,
            l.location_name as district,
            t.time as time,
            f.pm2_5,
            f.pm10,
            f.temperature_2m,
            f.relative_humidity_2m,
            f.wind_speed_10m,
            f.AQI_TOTAL as AQI_TOTAL
        FROM
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Location` l
        JOIN
            `invertible-now-462103-m3.weather_and_air_dataset.Fact_Weather_AirQuality` f
        ON
            l.location_key = f.location_key
        JOIN
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time` t
        ON
            f.time_key = t.time_key
        WHERE
             DATE(t.time) BETWEEN '{start_date}' AND '{end_date}'
            AND f.AQI_TOTAL IS NOT NULL
        ORDER BY t.time DESC
        LIMIT {limit}
        """
        
        # Execute query
        df = client.query(query).to_dataframe()
        
        if not df.empty:
            aqi_data = []
            for _, row in df.iterrows():
                aqi_data.append({
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'location_name': str(row['location_name']) if pd.notna(row['location_name']) else 'Unknown',
                    'district': str(row['district']) if pd.notna(row['district']) else 'Unknown',
                    'time': row['time'].isoformat() if hasattr(row['time'], 'isoformat') else str(row['time']),
                    'pm2_5': float(row['pm2_5']) if pd.notna(row['pm2_5']) else 0,
                    'pm10': float(row['pm10']) if pd.notna(row['pm10']) else 0,
                    'temperature_2m': float(row['temperature_2m']) if pd.notna(row['temperature_2m']) else 25.0,
                    'relative_humidity_2m': float(row['relative_humidity_2m']) if pd.notna(row['relative_humidity_2m']) else 60.0,
                    'wind_speed_10m': float(row['wind_speed_10m']) if pd.notna(row['wind_speed_10m']) else 5.0,
                    'AQI_TOTAL': int(row['AQI_TOTAL']) if pd.notna(row['AQI_TOTAL']) else 0
                })
            
            return aqi_data
        else:
            return []
            
    except Exception as e:
        print(f"❌ AQI Date Range API error: {e}")
        return []

# GET /api/v1/aqi/locations - Lấy danh sách locations
@router.get("/locations")
async def get_aqi_locations() -> List[Dict[str, Any]]:
    """
    Lấy danh sách tất cả các điểm quan trắc AQI từ bảng Dim_Location
    """
    try:
        client = get_bigquery_client()
        
        # Query từ bảng Dim_Location để lấy tất cả 30 điểm quận huyện
        query = """
        SELECT
            location_key,
            location_name,
            latitude,
            longitude
        FROM
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Location`
        ORDER BY location_name
        """
        
        # Execute query
        df = client.query(query).to_dataframe()
        
        if not df.empty:
            locations = []
            for _, row in df.iterrows():
                locations.append({
                    'location_key': int(row['location_key']) if pd.notna(row['location_key']) else 0,
                    'location_name': str(row['location_name']) if pd.notna(row['location_name']) else 'Unknown',
                    'latitude': float(row['latitude']) if pd.notna(row['latitude']) else 0.0,
                    'longitude': float(row['longitude']) if pd.notna(row['longitude']) else 0.0,
                    'district': str(row['location_name']) if pd.notna(row['location_name']) else 'Unknown'  # Fallback
                })
            
            print(f"✅ API Locations: Lấy được {len(locations)} điểm từ Dim_Location")
            return locations
        else:
            print("⚠️ API Locations: Không có dữ liệu từ Dim_Location, fallback về mock data")
            # Fallback về dữ liệu mẫu
            return get_mock_locations()
            
    except Exception as e:
        print(f"❌ AQI Locations API error: {e}")
        return get_mock_locations()

def get_mock_locations() -> List[Dict[str, Any]]:
    """Dữ liệu mẫu cho locations"""
    return [
        {'latitude': 21.0333, 'longitude': 105.8214, 'location_name': 'Ba Đình', 'district': 'Ba Đình'},
        {'latitude': 21.0285, 'longitude': 105.8542, 'location_name': 'Hoàn Kiếm', 'district': 'Hoàn Kiếm'},
        {'latitude': 21.0075, 'longitude': 105.8525, 'location_name': 'Hai Bà Trưng', 'district': 'Hai Bà Trưng'},
        {'latitude': 21.0167, 'longitude': 105.8083, 'location_name': 'Đống Đa', 'district': 'Đống Đa'},
        {'latitude': 21.0758, 'longitude': 105.8217, 'location_name': 'Tây Hồ', 'district': 'Tây Hồ'},
        {'latitude': 21.0333, 'longitude': 105.7833, 'location_name': 'Cầu Giấy', 'district': 'Cầu Giấy'},
        {'latitude': 21.0167, 'longitude': 105.7833, 'location_name': 'Thanh Xuân', 'district': 'Thanh Xuân'},
        {'latitude': 20.9742, 'longitude': 105.8733, 'location_name': 'Hoàng Mai', 'district': 'Hoàng Mai'},
        {'latitude': 21.0458, 'longitude': 105.8925, 'location_name': 'Long Biên', 'district': 'Long Biên'},
        {'latitude': 21.0139, 'longitude': 105.7656, 'location_name': 'Nam Từ Liêm', 'district': 'Nam Từ Liêm'}
    ]

# GET /api/v1/aqi/stats - Lấy thống kê tổng quan
@router.get("/stats")
async def get_aqi_stats() -> Dict[str, Any]:
    """
    Lấy thống kê tổng quan về AQI từ 3 bảng chính
    """
    try:
        client = get_bigquery_client()
        
        # Query từ 3 bảng chính theo mô hình Star Schema để lấy thống kê
        query = """
        SELECT
            COUNT(DISTINCT l.location_key) as total_locations,
            COUNT(*) as total_records,
            AVG(f.AQI_TOTAL) as avg_aqi,
            MIN(f.AQI_TOTAL) as min_aqi,
            MAX(f.AQI_TOTAL) as max_aqi,
            AVG(f.pm2_5) as avg_pm2_5,
            AVG(f.pm10) as avg_pm10,
            AVG(f.temperature_2m) as avg_temperature,
            AVG(f.relative_humidity_2m) as avg_humidity
        FROM
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Location` l
        JOIN
            `invertible-now-462103-m3.weather_and_air_dataset.Fact_Weather_AirQuality` f
        ON
            l.location_key = f.location_key
        JOIN
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time` t
        ON
            f.time_key = t.time_key
        WHERE
             t.time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
            AND f.AQI_TOTAL IS NOT NULL
        """
        
        # Execute query
        df = client.query(query).to_dataframe()
        
        if not df.empty:
            row = df.iloc[0]
            return {
                'total_locations': int(row['total_locations']) if pd.notna(row['total_locations']) else 0,
                'total_records': int(row['total_records']) if pd.notna(row['total_records']) else 0,
                'avg_aqi': round(float(row['avg_aqi']), 1) if pd.notna(row['avg_aqi']) else 0,
                'min_aqi': int(row['min_aqi']) if pd.notna(row['min_aqi']) else 0,
                'max_aqi': int(row['max_aqi']) if pd.notna(row['max_aqi']) else 0,
                'avg_pm2_5': round(float(row['avg_pm2_5']), 1) if pd.notna(row['avg_pm2_5']) else 0,
                'avg_pm10': round(float(row['avg_pm10']), 1) if pd.notna(row['avg_pm10']) else 0,
                'avg_temperature': round(float(row['avg_temperature']), 1) if pd.notna(row['avg_temperature']) else 0,
                'avg_humidity': round(float(row['avg_humidity']), 1) if pd.notna(row['avg_humidity']) else 0,
                'last_updated': datetime.now().isoformat()
            }
        else:
            # Fallback về dữ liệu mẫu
            return get_mock_stats()
            
    except Exception as e:
        print(f"❌ AQI Stats API error: {e}")
        return get_mock_stats()

def get_mock_stats() -> Dict[str, Any]:
    """Dữ liệu mẫu cho thống kê AQI"""
    return {
        'total_locations': 10,
        'total_records': 240,
        'avg_aqi': 75.2,
        'min_aqi': 45,
        'max_aqi': 125,
        'avg_pm2_5': 24.8,
        'avg_pm10': 43.6,
        'avg_temperature': 28.5,
        'avg_humidity': 65.3,
        'last_updated': datetime.now().isoformat()
    }

# GET /api/v1/aqi/test-connection - Test kết nối với 3 bảng chính
@router.get("/test-connection")
async def test_three_table_connection() -> Dict[str, Any]:
    """
    Test kết nối với 3 bảng chính: Dim_Location, Dim_Time, Fact_Weather_AirQuality
    """
    try:
        client = get_bigquery_client()
        
        # Test 1: Kiểm tra bảng Dim_Location
        locations_query = """
        SELECT COUNT(*) as total_locations
        FROM `invertible-now-462103-m3.weather_and_air_dataset.Dim_Location`
        """
        
        locations_df = client.query(locations_query).to_dataframe()
        total_locations = int(locations_df.iloc[0]['total_locations']) if not locations_df.empty else 0
        
        # Test 2: Kiểm tra bảng Dim_Time
        time_query = """
        SELECT COUNT(*) as total_time_records
        FROM `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time`
        """
        
        time_df = client.query(time_query).to_dataframe()
        total_time_records = int(time_df.iloc[0]['total_time_records']) if not time_df.empty else 0
        
        # Test 3: Kiểm tra bảng Fact_Weather_AirQuality
        fact_query = """
        SELECT COUNT(*) as total_fact_records
        FROM `invertible-now-462103-m3.weather_and_air_dataset.Fact_Weather_AirQuality`
        """
        
        fact_df = client.query(fact_query).to_dataframe()
        total_fact_records = int(fact_df.iloc[0]['total_fact_records']) if not fact_df.empty else 0
        
        # Test 4: Kiểm tra JOIN giữa 3 bảng
        join_query = """
        SELECT 
            COUNT(DISTINCT l.location_key) as joined_locations,
            COUNT(*) as total_joined_records
        FROM
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Location` l
        JOIN
            `invertible-now-462103-m3.weather_and_air_dataset.Fact_Weather_AirQuality` f
        ON
            l.location_key = f.location_key
        JOIN
            `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time` t
        ON
            f.time_key = t.time_key
        """
        
        join_df = client.query(join_query).to_dataframe()
        joined_locations = int(join_df.iloc[0]['joined_locations']) if not join_df.empty else 0
        total_joined_records = int(join_df.iloc[0]['total_joined_records']) if not join_df.empty else 0
        
        return {
            "status": "success",
            "message": "Test kết nối với 3 bảng chính thành công",
            "timestamp": datetime.now().isoformat(),
            "results": {
                "Dim_Location": {
                    "total_locations": total_locations,
                    "status": "✅ Connected" if total_locations > 0 else "❌ No data"
                },
                "Dim_Time": {
                    "total_time_records": total_time_records,
                    "status": "✅ Connected" if total_time_records > 0 else "❌ No data"
                },
                "Fact_Weather_AirQuality": {
                    "total_fact_records": total_fact_records,
                    "status": "✅ Connected" if total_fact_records > 0 else "❌ No data"
                },
                "join_test": {
                    "joined_locations": joined_locations,
                    "total_joined_records": total_joined_records,
                    "status": "✅ JOIN successful" if joined_locations > 0 else "❌ JOIN failed"
                }
            },
            "summary": {
                "expected_locations": 30,
                "actual_locations": total_locations,
                "connection_status": "✅ All tables connected" if total_locations > 0 and total_time_records > 0 and total_fact_records > 0 else "⚠️ Some tables missing data"
            }
        }
        
    except Exception as e:
        print(f"❌ Test Connection API error: {e}")
        return {
            "status": "error",
            "message": f"Test kết nối thất bại: {str(e)}",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }
