"""
AQI (Air Quality Index) API Endpoints
Các endpoint liên quan đến chất lượng không khí
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from app.db.bigquery import get_bigquery_client

router = APIRouter()

def calculate_pm25_aqi(concentration):
    """
    Tính toán AQI từ nồng độ PM2.5 theo chuẩn US EPA
    Format: (aqi_low, aqi_high, c_low, c_high)
    """
    if concentration is None:
        return None
        
    # Breakpoints theo US EPA cho PM2.5
    breakpoints = [
        (0, 50, 0.0, 12.0),
        (51, 100, 12.1, 35.4),
        (101, 150, 35.5, 55.4),
        (151, 200, 55.5, 150.4),
        (201, 300, 150.5, 250.4),
        (301, 500, 250.5, 500.4)
    ]
    
    for (aqi_low, aqi_high, c_low, c_high) in breakpoints:
        if c_low <= concentration <= c_high:
            # Áp dụng công thức nội suy tuyến tính
            aqi = ((aqi_high - aqi_low) / (c_high - c_low)) * (concentration - c_low) + aqi_low
            return round(aqi)
    
    return 500  # Nếu vượt quá, trả về max AQI

# GET /api/v1/aqi/latest - Lấy dữ liệu cho bản đồ chính
@router.get("/latest")
async def get_latest_aqi() -> List[Dict[str, Any]]:
    """
    Lấy dữ liệu mới nhất của mỗi điểm để hiển thị trên bản đồ
    """
    try:
        client = get_bigquery_client()
        
        # Query theo yêu cầu mới - lấy latest data của mỗi điểm
        query = f"""
        WITH LatestData AS (
            SELECT
                *,
                ROW_NUMBER() OVER(PARTITION BY CAST(latitude AS STRING), CAST(longitude AS STRING) ORDER BY time DESC) as record_rank
            FROM
                `{client.project}.weather_and_air_dataset.Staging_RawData`
            WHERE
                DATE(time) <= CURRENT_DATE()
        )
        SELECT
            time,
            latitude,
            longitude,
            pm2_5,
            temperature_2m,
            relative_humidity_2m,
            wind_speed_10m
        FROM
            LatestData
        WHERE
            record_rank = 1
        """
        
        # Execute query và convert sang DataFrame  
        df = client.query(query).to_dataframe()
        
        if not df.empty:
            df["time"] = df["time"].astype(str)
            
            # Thêm AQI calculation cho mỗi record
            records = []
            for _, row in df.iterrows():
                aqi = calculate_pm25_aqi(row['pm2_5'])
                records.append({
                    'time': row['time'],
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'pm2_5': float(row['pm2_5']) if pd.notna(row['pm2_5']) else 0,
                    'aqi': aqi,
                    'temperature_2m': float(row['temperature_2m']) if pd.notna(row['temperature_2m']) else 25.0,
                    'relative_humidity_2m': float(row['relative_humidity_2m']) if pd.notna(row['relative_humidity_2m']) else 60.0,
                    'wind_speed_10m': float(row['wind_speed_10m']) if pd.notna(row['wind_speed_10m']) else 5.0
                })
            
            return records
        
        return []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# GET /api/v1/aqi/detail - Lấy chi tiết của một điểm cụ thể
@router.get("/detail")
async def get_aqi_detail(lat: float, lng: float) -> Dict[str, Any]:
    """
    Lấy chi tiết đầy đủ của một điểm cụ thể
    """
    try:
        client = get_bigquery_client()
        
        # Query chi tiết của một điểm
        query = f"""
        SELECT
            *
        FROM
            `{client.project}.weather_and_air_dataset.Staging_RawData`
        WHERE
            latitude = {lat} AND longitude = {lng}
            AND DATE(time) <= CURRENT_DATE()
        ORDER BY
            time DESC
        LIMIT 1
        """
        
        df = client.query(query).to_dataframe()
        
        if not df.empty:
            row = df.iloc[0]
            aqi = calculate_pm25_aqi(row['pm2_5'])
            
            result = {
                'time': str(row['time']),
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'pm2_5': float(row['pm2_5']) if pd.notna(row['pm2_5']) else 0,
                'aqi': aqi,
                'temperature_2m': float(row['temperature_2m']) if pd.notna(row['temperature_2m']) else 25.0,
                'relative_humidity_2m': float(row['relative_humidity_2m']) if pd.notna(row['relative_humidity_2m']) else 60.0,
                'wind_speed_10m': float(row['wind_speed_10m']) if pd.notna(row['wind_speed_10m']) else 5.0,
                'wind_direction_10m': float(row['wind_direction_10m']) if pd.notna(row['wind_direction_10m']) else 0.0,
                'pressure_msl': float(row['pressure_msl']) if pd.notna(row['pressure_msl']) else 1013.0
            }
            
            return result
        
        raise HTTPException(status_code=404, detail="No data found for this location")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# GET /api/v1/aqi/date-range - Lấy dữ liệu theo khoảng thời gian
@router.get("/date-range")
async def get_aqi_by_date_range(
    start_date: str = "2024-01-01",
    end_date: str = "2024-12-31",
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Lấy dữ liệu AQI theo khoảng thời gian
    Format date: YYYY-MM-DD
    """
    try:
        client = get_bigquery_client()
        
        query = f"""
        SELECT
            date,
            latitude,
            longitude,
            avg_pm2_5,
            avg_pm10,
            avg_no2,
            avg_ozone
        FROM
            `{client.project}.weather_and_air_dataset.Daily_Aggregated_Data`
        WHERE
            date >= '{start_date}'
            AND date <= '{end_date}'
        ORDER BY date DESC
        LIMIT {limit}
        """
        
        df = client.query(query).to_dataframe()
        
        if not df.empty:
            df["date"] = df["date"].astype(str)
        
        result = df.to_dict(orient="records")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# GET /api/v1/aqi/locations - Lấy danh sách locations có dữ liệu
@router.get("/locations")
async def get_aqi_locations() -> List[Dict[str, Any]]:
    """
    Lấy danh sách các vị trí (latitude, longitude) có dữ liệu AQI
    """
    try:
        client = get_bigquery_client()
        
        query = f"""
        SELECT DISTINCT
            latitude,
            longitude,
            COUNT(*) as data_points,
            MIN(date) as first_date,
            MAX(date) as last_date
        FROM
            `{client.project}.weather_and_air_dataset.Daily_Aggregated_Data`
        GROUP BY latitude, longitude
        ORDER BY data_points DESC
        """
        
        df = client.query(query).to_dataframe()
        
        if not df.empty:
            df["first_date"] = df["first_date"].astype(str)
            df["last_date"] = df["last_date"].astype(str)
        
        result = df.to_dict(orient="records")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# GET /api/v1/aqi/stats - Thống kê tổng quan
@router.get("/stats")
async def get_aqi_stats() -> Dict[str, Any]:
    """
    Lấy thống kê tổng quan về dữ liệu AQI
    """
    try:
        client = get_bigquery_client()
        
        query = f"""
        SELECT
            COUNT(*) as total_records,
            COUNT(DISTINCT date) as total_dates,
            COUNT(DISTINCT CONCAT(latitude, ',', longitude)) as total_locations,
            MIN(date) as earliest_date,
            MAX(date) as latest_date,
            AVG(avg_pm2_5) as overall_avg_pm2_5,
            AVG(avg_pm10) as overall_avg_pm10,
            AVG(avg_no2) as overall_avg_no2,
            AVG(avg_ozone) as overall_avg_ozone
        FROM
            `{client.project}.weather_and_air_dataset.Daily_Aggregated_Data`
        """
        
        df = client.query(query).result()
        result = list(df)[0]
        
        stats = {
            "total_records": result.total_records,
            "total_dates": result.total_dates,
            "total_locations": result.total_locations,
            "earliest_date": str(result.earliest_date),
            "latest_date": str(result.latest_date),
            "averages": {
                "pm2_5": round(float(result.overall_avg_pm2_5 or 0), 2),
                "pm10": round(float(result.overall_avg_pm10 or 0), 2),
                "no2": round(float(result.overall_avg_no2 or 0), 2),
                "ozone": round(float(result.overall_avg_ozone or 0), 2)
            }
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 