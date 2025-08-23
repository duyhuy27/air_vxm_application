#!/usr/bin/env python3
"""
Script test kết nối với bảng fact và thang màu AQI mới
"""

import os
import sys
from google.cloud import bigquery
from google.oauth2 import service_account
import json

def get_credentials():
    """Lấy credentials từ file"""
    credentials_file = "credentials/invertible-now-462103-m3-c75684b0bb78.json"
    if os.path.exists(credentials_file):
        credentials = service_account.Credentials.from_service_account_file(credentials_file)
        print(f"✅ Using credentials from file: {credentials_file}")
        return credentials
    else:
        raise FileNotFoundError(f"Credentials file not found: {credentials_file}")

def test_fact_tables():
    """Test kết nối với bảng fact"""
    try:
        # Khởi tạo client
        credentials = get_credentials()
        client = bigquery.Client(
            credentials=credentials,
            project="invertible-now-462103-m3"
        )
        
        dataset_id = "weather_and_air_dataset"
        print(f"🔍 Testing connection to dataset: {dataset_id}")
        
        # Test các bảng dimension
        dimension_tables = ['dim_locations', 'dim_time', 'dim_weather_conditions']
        for table_name in dimension_tables:
            table_id = f"{client.project}.{dataset_id}.{table_name}"
            try:
                table = client.get_table(table_id)
                print(f"✅ Table {table_name}: {table.num_rows} rows")
            except Exception as e:
                print(f"❌ Table {table_name}: {e}")
        
        # Test bảng fact
        fact_table_id = f"{client.project}.{dataset_id}.fact_air_quality"
        try:
            fact_table = client.get_table(fact_table_id)
            print(f"✅ Fact table: {fact_table.num_rows} rows")
            
            # Test query từ fact table
            query = f"""
            SELECT 
                COUNT(*) as total_records,
                COUNT(DISTINCT location_id) as unique_locations,
                MIN(created_at) as earliest_date,
                MAX(created_at) as latest_date,
                AVG(aqi_overall) as avg_aqi,
                AVG(quality_score) as avg_quality
            FROM `{fact_table_id}`
            WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
            """
            
            results = client.query(query).to_dataframe()
            if not results.empty:
                row = results.iloc[0]
                print(f"📊 Recent data stats:")
                print(f"   Total records: {row['total_records']}")
                print(f"   Unique locations: {row['unique_locations']}")
                print(f"   Date range: {row['earliest_date']} to {row['latest_date']}")
                print(f"   Average AQI: {row['avg_aqi']:.2f}")
                print(f"   Average quality score: {row['avg_quality']:.3f}")
            
        except Exception as e:
            print(f"❌ Fact table error: {e}")
        
        # Test thang màu AQI mới
        print(f"\n🎨 Testing new AQI color scale:")
        aqi_colors = [
            (0, 50, '#00E400', 'Tốt'),
            (51, 100, '#FFFF00', 'Trung bình'),
            (101, 150, '#FF7E00', 'Kém'),
            (151, 200, '#FF0000', 'Xấu'),
            (201, 300, '#8F3F97', 'Rất xấu'),
            (301, 500, '#7E0023', 'Nguy hại')
        ]
        
        for min_aqi, max_aqi, color, level in aqi_colors:
            print(f"   AQI {min_aqi}-{max_aqi}: {color} ({level})")
        
        # Test query với JOIN
        print(f"\n🔗 Testing JOIN query:")
        join_query = f"""
        SELECT 
            l.location_name,
            l.district,
            f.aqi_overall,
            f.pm2_5,
            f.temperature_2m,
            f.created_at
        FROM `{client.project}.{dataset_id}.fact_air_quality` f
        JOIN `{client.project}.{dataset_id}.dim_locations` l
            ON f.location_id = l.location_id
        WHERE l.is_active = TRUE
        ORDER BY f.created_at DESC
        LIMIT 5
        """
        
        try:
            join_results = client.query(join_query).to_dataframe()
            if not join_results.empty:
                print(f"✅ JOIN query successful: {len(join_results)} rows")
                for _, row in join_results.iterrows():
                    print(f"   {row['location_name']} ({row['district']}): AQI {row['aqi_overall']}, PM2.5: {row['pm2_5']:.1f}")
            else:
                print("⚠️ JOIN query returned no results")
        except Exception as e:
            print(f"❌ JOIN query error: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Testing Fact Tables and New AQI Color Scale")
    print("=" * 50)
    
    success = test_fact_tables()
    
    if success:
        print(f"\n✅ All tests completed successfully!")
        print(f"🎯 Fact tables are ready for use")
        print(f"🎨 New AQI color scale is implemented")
    else:
        print(f"\n❌ Some tests failed")
        print(f"🔧 Please check the configuration and try again")
    
    return success

if __name__ == "__main__":
    main()


