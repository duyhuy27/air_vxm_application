#!/usr/bin/env python3
"""
Test Script cho AQI APIs
Kiểm tra các endpoints AQI hoạt động đúng
"""

import sys
import os
import asyncio
import httpx

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = "http://localhost:8001/api/v1"

async def test_aqi_endpoints():
    """Test all AQI endpoints"""
    print("🧪 Testing AQI Endpoints")
    print("=" * 50)
    
    async with httpx.AsyncClient() as client:
        
        # Test 1: Health check
        print("1. Testing health check...")
        try:
            response = await client.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                health_data = response.json()
                bigquery_status = health_data["dependencies"]["bigquery"]["bigquery"]
                print(f"   ✅ Health check OK - BigQuery: {bigquery_status}")
            else:
                print(f"   ❌ Health check failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Health check error: {e}")
        
        # Test 2: Latest AQI data
        print("\n2. Testing latest AQI data...")
        try:
            response = await client.get(f"{BASE_URL}/aqi/latest")
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Latest AQI OK - Records: {len(data)}")
                if data:
                    sample = data[0]
                    print(f"   📊 Sample: Date={sample.get('date')}, PM2.5={sample.get('avg_pm2_5')}")
            else:
                print(f"   ❌ Latest AQI failed: {response.status_code}")
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Latest AQI error: {e}")
        
        # Test 3: AQI locations
        print("\n3. Testing AQI locations...")
        try:
            response = await client.get(f"{BASE_URL}/aqi/locations")
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Locations OK - Count: {len(data)}")
                if data:
                    sample = data[0]
                    print(f"   📍 Sample: Lat={sample.get('latitude')}, Lng={sample.get('longitude')}")
            else:
                print(f"   ❌ Locations failed: {response.status_code}")
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Locations error: {e}")
        
        # Test 4: AQI stats
        print("\n4. Testing AQI statistics...")
        try:
            response = await client.get(f"{BASE_URL}/aqi/stats")
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Stats OK")
                print(f"   📊 Total records: {data.get('total_records')}")
                print(f"   📅 Date range: {data.get('earliest_date')} to {data.get('latest_date')}")
                print(f"   🌍 Locations: {data.get('total_locations')}")
            else:
                print(f"   ❌ Stats failed: {response.status_code}")
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Stats error: {e}")
        
        # Test 5: Date range query
        print("\n5. Testing date range query...")
        try:
            response = await client.get(
                f"{BASE_URL}/aqi/date-range",
                params={"start_date": "2024-01-01", "end_date": "2024-12-31", "limit": 5}
            )
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Date range OK - Records: {len(data)}")
            else:
                print(f"   ❌ Date range failed: {response.status_code}")
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Date range error: {e}")
    
    print("\n🎉 AQI API testing completed!")
    print("\n💡 Để APIs hoạt động đầy đủ, cần:")
    print("   1. Copy credentials file vào credentials/")
    print("   2. Đảm bảo BigQuery dataset có dữ liệu")
    print("   3. Service account có quyền truy cập BigQuery")

def main():
    """Main test function"""
    asyncio.run(test_aqi_endpoints())

if __name__ == "__main__":
    main() 