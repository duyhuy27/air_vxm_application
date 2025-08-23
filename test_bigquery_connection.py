#!/usr/bin/env python3
"""
Script test để kiểm tra kết nối BigQuery và dữ liệu từ các bảng thật
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.bigquery import get_bigquery_client, test_connection
from app.core.config import settings
import pandas as pd

def test_bigquery_data():
    """Test kết nối và dữ liệu từ BigQuery"""
    print("🔍 Testing BigQuery connection and data...")
    
    try:
        # Test connection
        if not test_connection():
            print("❌ BigQuery connection failed")
            return False
        
        print("✅ BigQuery connection successful")
        
        # Get client
        client = get_bigquery_client()
        project_id = settings.GOOGLE_CLOUD_PROJECT
        dataset_id = settings.BIGQUERY_DATASET
        
        print(f"🔍 Using project: {project_id}, dataset: {dataset_id}")
        
        # Test 1: Kiểm tra Dim_Location
        print("\n🔍 Test 1: Checking Dim_Location table...")
        locations_query = f"""
        SELECT 
            location_key,
            location_name,
            latitude,
            longitude
        FROM `{project_id}.{dataset_id}.Dim_Location`
        ORDER BY location_key
        LIMIT 5
        """
        
        try:
            locations_df = client.query(locations_query).to_dataframe()
            print(f"✅ Dim_Location: Found {len(locations_df)} records")
            if not locations_df.empty:
                print("Sample locations:")
                for _, row in locations_df.iterrows():
                    print(f"  - {row['location_name']} (Key: {row['location_key']}, Lat: {row['latitude']}, Lng: {row['longitude']})")
        except Exception as e:
            print(f"❌ Dim_Location query failed: {e}")
            return False
        
        # Test 2: Kiểm tra Dim_Time
        print("\n🔍 Test 2: Checking Dim_Time table...")
        time_query = f"""
        SELECT 
            time_key,
            time,
            year,
            month,
            day_of_month,
            hour
        FROM `{project_id}.{dataset_id}.Dim_Time`
        ORDER BY time_key DESC
        LIMIT 5
        """
        
        try:
            time_df = client.query(time_query).to_dataframe()
            print(f"✅ Dim_Time: Found {len(time_df)} records")
            if not time_df.empty:
                print("Sample time records:")
                for _, row in time_df.iterrows():
                    print(f"  - {row['time']} (Key: {row['time_key']}, {row['year']}-{row['month']}-{row['day_of_month']} {row['hour']}:00)")
        except Exception as e:
            print(f"❌ Dim_Time query failed: {e}")
            return False
        
        # Test 3: Kiểm tra Fact_Weather_AirQuality
        print("\n🔍 Test 3: Checking Fact_Weather_AirQuality table...")
        fact_query = f"""
        SELECT 
            location_key,
            time_key,
            pm2_5,
            pm10,
            AQI_TOTAL,
            temperature_2m,
            relative_humidity_2m
        FROM `{project_id}.{dataset_id}.Fact_Weather_AirQuality`
        ORDER BY time_key DESC, location_key
        LIMIT 10
        """
        
        try:
            fact_df = client.query(fact_query).to_dataframe()
            print(f"✅ Fact_Weather_AirQuality: Found {len(fact_df)} records")
            if not fact_df.empty:
                print("Sample fact records:")
                for _, row in fact_df.iterrows():
                    print(f"  - Location: {row['location_key']}, Time: {row['time_key']}, AQI: {row['AQI_TOTAL']}, PM2.5: {row['pm2_5']}, PM10: {row['pm10']}")
        except Exception as e:
            print(f"❌ Fact_Weather_AirQuality query failed: {e}")
            return False
        
        # Test 4: Kiểm tra JOIN giữa các bảng
        print("\n🔍 Test 4: Testing JOIN between tables...")
        join_query = f"""
        SELECT 
            l.location_name,
            t.time,
            f.AQI_TOTAL,
            f.pm2_5,
            f.pm10
        FROM `{project_id}.{dataset_id}.Fact_Weather_AirQuality` f
        JOIN `{project_id}.{dataset_id}.Dim_Location` l ON f.location_key = l.location_key
        JOIN `{project_id}.{dataset_id}.Dim_Time` t ON f.time_key = t.time_key
        ORDER BY t.time DESC, l.location_name
        LIMIT 10
        """
        
        try:
            join_df = client.query(join_query).to_dataframe()
            print(f"✅ JOIN query: Found {len(join_df)} records")
            if not join_df.empty:
                print("Sample joined records:")
                for _, row in join_df.iterrows():
                    print(f"  - {row['location_name']}: {row['time']}, AQI: {row['AQI_TOTAL']}, PM2.5: {row['pm2_5']}, PM10: {row['pm10']}")
        except Exception as e:
            print(f"❌ JOIN query failed: {e}")
            return False
        
        # Test 5: Kiểm tra dữ liệu mới nhất
        print("\n🔍 Test 5: Getting latest data for all locations...")
        latest_query = f"""
        SELECT 
            l.location_name,
            l.latitude,
            l.longitude,
            f.AQI_TOTAL,
            f.pm2_5,
            f.pm10,
            t.time
        FROM `{project_id}.{dataset_id}.Dim_Location` l
        LEFT JOIN (
            SELECT 
                f1.location_key,
                f1.AQI_TOTAL,
                f1.pm2_5,
                f1.pm10,
                t1.time
            FROM `{project_id}.{dataset_id}.Fact_Weather_AirQuality` f1
            JOIN `{project_id}.{dataset_id}.Dim_Time` t1 ON f1.time_key = t1.time_key
            WHERE f1.time_key = (
                SELECT MAX(time_key) 
                FROM `{project_id}.{dataset_id}.Fact_Weather_AirQuality`
            )
        ) f ON l.location_key = f.location_key
        LEFT JOIN (
            SELECT 
                t2.time
            FROM `{project_id}.{dataset_id}.Dim_Time` t2
            WHERE t2.time_key = (
                SELECT MAX(time_key) 
                FROM `{project_id}.{dataset_id}.Fact_Weather_AirQuality`
            )
        ) t ON 1=1
        ORDER BY l.location_key
        """
        
        try:
            latest_df = client.query(latest_query).to_dataframe()
            print(f"✅ Latest data query: Found {len(latest_df)} locations")
            if not latest_df.empty:
                print("Sample latest data:")
                for _, row in latest_df.iterrows():
                    aqi = row['AQI_TOTAL'] if pd.notna(row['AQI_TOTAL']) else 'N/A'
                    pm25 = row['pm2_5'] if pd.notna(row['pm2_5']) else 'N/A'
                    pm10 = row['pm10'] if pd.notna(row['pm10']) else 'N/A'
                    print(f"  - {row['location_name']}: AQI={aqi}, PM2.5={pm25}, PM10={pm10}")
        except Exception as e:
            print(f"❌ Latest data query failed: {e}")
            return False
        
        print("\n✅ All tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    success = test_bigquery_data()
    if success:
        print("\n🎉 BigQuery connection and data access working correctly!")
        print("✅ Ready to use with real data from Fact_Weather_AirQuality table")
    else:
        print("\n❌ BigQuery test failed. Please check configuration and credentials.")
        sys.exit(1)
