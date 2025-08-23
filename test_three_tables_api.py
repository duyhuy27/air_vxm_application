#!/usr/bin/env python3
"""
Script test API với 3 bảng chính: Dim_Location, Dim_Time, Fact_Weather_AirQuality
"""

import requests
import json
from datetime import datetime

def test_api_endpoints():
    """Test các API endpoint với 3 bảng chính"""
    
    base_url = "http://localhost:8000/api/v1"
    
    print("🧪 Bắt đầu test API với 3 bảng chính...")
    print("=" * 60)
    
    # Test 1: Test kết nối với 3 bảng
    print("\n1️⃣ Test kết nối với 3 bảng chính:")
    try:
        response = requests.get(f"{base_url}/aqi/test-connection")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data['status']}")
            print(f"📊 Dim_Location: {data['results']['dim_locations']['total_locations']} locations")
            print(f"📊 Dim_Time: {data['results']['dim_time']['total_time_records']} records")
            print(f"📊 Fact_Weather_AirQuality: {data['results']['fact_weather_airquality']['total_fact_records']} records")
            print(f"🔗 JOIN Test: {data['results']['join_test']['joined_locations']} locations joined")
            print(f"📋 Summary: {data['summary']['connection_status']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 2: Test API locations (lấy từ Dim_Location)
    print("\n2️⃣ Test API locations (từ Dim_Location):")
    try:
        response = requests.get(f"{base_url}/aqi/locations")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📊 Total locations: {len(data)}")
            if len(data) > 0:
                print(f"📍 First location: {data[0]['location_name']} - {data[0]['district']}")
                print(f"📍 Last location: {data[-1]['location_name']} - {data[-1]['district']}")
            print(f"🎯 Expected: 30 locations, Actual: {len(data)}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 3: Test API stats (từ 3 bảng JOIN)
    print("\n3️⃣ Test API stats (từ 3 bảng JOIN):")
    try:
        response = requests.get(f"{base_url}/aqi/stats")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📊 Total locations: {data['total_locations']}")
            print(f"📊 Total records: {data['total_records']}")
            print(f"📊 Average AQI: {data['avg_aqi']}")
            print(f"📊 Min AQI: {data['min_aqi']}")
            print(f"📊 Max AQI: {data['max_aqi']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 4: Test API current AQI (từ 3 bảng JOIN)
    print("\n4️⃣ Test API current AQI (từ 3 bảng JOIN):")
    try:
        response = requests.get(f"{base_url}/aqi/current")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📊 Total records: {len(data)}")
            if len(data) > 0:
                print(f"📍 First record: {data[0]['location_name']} - AQI: {data[0]['AQI_TOTAL']}")
                print(f"📍 Last record: {data[-1]['location_name']} - AQI: {data[-1]['AQI_TOTAL']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 5: Test API forecast hourly (từ 3 bảng JOIN)
    print("\n5️⃣ Test API forecast hourly (từ 3 bảng JOIN):")
    try:
        # Test với tọa độ Hà Nội
        lat, lng = 21.0285, 105.8542  # Hoàn Kiếm
        response = requests.get(f"{base_url}/forecast/hourly?lat={lat}&lng={lng}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📊 Forecast type: {data['forecast_type']}")
            print(f"📊 Total hours: {data['total_hours']}")
            print(f"📍 Location: {data['location']['name']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Hoàn thành test API với 3 bảng chính!")

if __name__ == "__main__":
    test_api_endpoints()
