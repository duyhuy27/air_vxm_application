"""
API endpoints for historical AQI data
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import logging
from google.cloud import bigquery
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize BigQuery client when needed
def get_bigquery_client():
    return bigquery.Client()

@router.get("/daily", response_model=List[Dict[str, Any]])
async def get_daily_history(
    location_name: str = Query(..., description="Location name to get history for"),
    days: int = Query(7, description="Number of days to retrieve (default: 7)")
):
    """
    Get daily average AQI data for the past N days for a specific location
    
    Args:
        location_name: Name of the location (e.g., 'Hà Đông')
        days: Number of days to retrieve (default: 7)
    
    Returns:
        List of daily AQI averages with date and avg_aqi
    """
    try:
        logger.info(f"🔍 Getting daily AQI history for location: {location_name}, days: {days}")
        
        # SQL query for daily AQI averages
        query = f"""
        SELECT
            DATE(t.time, 'Asia/Ho_Chi_Minh') AS report_date,
            ROUND(AVG(f.AQI_TOTAL), 2) AS avg_aqi,
            COUNT(*) as data_points
        FROM
            `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.Fact_Weather_AirQuality` AS f
        JOIN
            `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.Dim_Time` AS t ON f.time_key = t.time_key
        JOIN
            `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.Dim_Location` AS loc ON f.location_key = loc.location_key
        WHERE
            loc.location_name = @location_name
            AND DATE(t.time, 'Asia/Ho_Chi_Minh') BETWEEN 
                DATE_SUB(CURRENT_DATE('Asia/Ho_Chi_Minh'), INTERVAL @days DAY) 
                AND CURRENT_DATE('Asia/Ho_Chi_Minh')
            AND f.AQI_TOTAL IS NOT NULL
        GROUP BY
            report_date
        ORDER BY
            report_date ASC
        """
        
        # Configure query parameters
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("location_name", "STRING", location_name),
                bigquery.ScalarQueryParameter("days", "INT64", days),
            ]
        )
        
        # Execute query
        client = get_bigquery_client()
        query_job = client.query(query, job_config=job_config)
        results = query_job.result()
        
        # Process results
        daily_data = []
        for row in results:
            daily_data.append({
                "report_date": row.report_date.strftime("%Y-%m-%d"),
                "avg_aqi": float(row.avg_aqi) if row.avg_aqi else 0,
                "data_points": int(row.data_points)
            })
        
        logger.info(f"✅ Retrieved {len(daily_data)} daily records for {location_name}")
        
        if not daily_data:
            logger.warning(f"⚠️ No daily data found for location: {location_name}")
            # Return empty data structure to maintain consistency
            return []
        
        return daily_data
        
    except Exception as e:
        logger.error(f"❌ Error retrieving daily history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve daily AQI history: {str(e)}"
        )


@router.get("/hourly", response_model=List[Dict[str, Any]])
async def get_hourly_history(
    location_name: str = Query(..., description="Location name to get history for"),
    hours: int = Query(24, description="Number of hours to retrieve (default: 24)")
):
    """
    Get hourly AQI data for the past N hours for a specific location
    
    Args:
        location_name: Name of the location (e.g., 'Hà Đông')
        hours: Number of hours to retrieve (default: 24)
    
    Returns:
        List of hourly AQI data with datetime and AQI_TOTAL
    """
    try:
        logger.info(f"🔍 Getting hourly AQI history for location: {location_name}, hours: {hours}")
        
        # SQL query for hourly AQI data
        query = f"""
        SELECT
            t.time,
            f.AQI_TOTAL,
            loc.location_name
        FROM
            `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.Fact_Weather_AirQuality` AS f
        JOIN
            `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.Dim_Time` AS t ON f.time_key = t.time_key
        JOIN
            `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.Dim_Location` AS loc ON f.location_key = loc.location_key
        WHERE
            loc.location_name = @location_name
            AND t.time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @hours HOUR)
            AND f.AQI_TOTAL IS NOT NULL
        ORDER BY
            t.time ASC
        """
        
        # Configure query parameters
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("location_name", "STRING", location_name),
                bigquery.ScalarQueryParameter("hours", "INT64", hours),
            ]
        )
        
        # Execute query
        client = get_bigquery_client()
        query_job = client.query(query, job_config=job_config)
        results = query_job.result()
        
        # Process results
        hourly_data = []
        for row in results:
            # Convert to UTC timezone aware datetime
            if row.time:
                if row.time.tzinfo is None:
                    # If naive datetime, assume UTC
                    time_utc = row.time.replace(tzinfo=timezone.utc)
                else:
                    # If timezone aware, convert to UTC
                    time_utc = row.time.astimezone(timezone.utc)
                
                hourly_data.append({
                    "time": time_utc.isoformat(),
                    "AQI_TOTAL": float(row.AQI_TOTAL) if row.AQI_TOTAL else 0,
                    "location_name": row.location_name
                })
        
        logger.info(f"✅ Retrieved {len(hourly_data)} hourly records for {location_name}")
        
        if not hourly_data:
            logger.warning(f"⚠️ No hourly data found for location: {location_name}")
            # Return empty data structure to maintain consistency
            return []
        
        return hourly_data
        
    except Exception as e:
        logger.error(f"❌ Error retrieving hourly history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve hourly AQI history: {str(e)}"
        )


@router.get("/summary", response_model=Dict[str, Any])
async def get_history_summary(
    location_name: str = Query(..., description="Location name to get summary for")
):
    """
    Get summary statistics for AQI history at a location
    
    Args:
        location_name: Name of the location
    
    Returns:
        Summary statistics including min, max, avg AQI for different time periods
    """
    try:
        logger.info(f"🔍 Getting AQI summary for location: {location_name}")
        
        # SQL query for summary statistics
        query = f"""
        WITH recent_data AS (
            SELECT
                t.time,
                f.AQI_TOTAL,
                DATE(t.time, 'Asia/Ho_Chi_Minh') AS report_date
            FROM
                `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.Fact_Weather_AirQuality` AS f
            JOIN
                `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.Dim_Time` AS t ON f.time_key = t.time_key
            JOIN
                `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.Dim_Location` AS loc ON f.location_key = loc.location_key
            WHERE
                loc.location_name = @location_name
                AND t.time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
                AND f.AQI_TOTAL IS NOT NULL
        )
        SELECT
            COUNT(*) as total_records,
            ROUND(AVG(AQI_TOTAL), 2) as avg_aqi_30d,
            ROUND(MIN(AQI_TOTAL), 2) as min_aqi_30d,
            ROUND(MAX(AQI_TOTAL), 2) as max_aqi_30d,
            COUNT(DISTINCT report_date) as days_with_data
        FROM recent_data
        """
        
        # Configure query parameters
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("location_name", "STRING", location_name),
            ]
        )
        
        # Execute query
        client = get_bigquery_client()
        query_job = client.query(query, job_config=job_config)
        results = query_job.result()
        
        # Process results
        summary = {}
        for row in results:
            summary = {
                "location_name": location_name,
                "total_records": int(row.total_records),
                "avg_aqi_30d": float(row.avg_aqi_30d) if row.avg_aqi_30d else 0,
                "min_aqi_30d": float(row.min_aqi_30d) if row.min_aqi_30d else 0,
                "max_aqi_30d": float(row.max_aqi_30d) if row.max_aqi_30d else 0,
                "days_with_data": int(row.days_with_data),
                "data_quality": "good" if int(row.days_with_data) >= 25 else "limited"
            }
            break
        
        if not summary:
            summary = {
                "location_name": location_name,
                "total_records": 0,
                "avg_aqi_30d": 0,
                "min_aqi_30d": 0,
                "max_aqi_30d": 0,
                "days_with_data": 0,
                "data_quality": "no_data"
            }
        
        logger.info(f"✅ Retrieved summary for {location_name}: {summary}")
        return summary
        
    except Exception as e:
        logger.error(f"❌ Error retrieving history summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve AQI history summary: {str(e)}"
        )
