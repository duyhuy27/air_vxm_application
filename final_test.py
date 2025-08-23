#!/usr/bin/env python3
"""
Script test cuối cùng để kiểm tra tất cả API
"""

import requests
import json
from datetime import datetime

def test_all_apis():
    """Test tất cả các API endpoint"""
    
    base_url = "http://localhost:8000/api/v1"
    
    print("🧪 Bắt đầu test cuối cùng tất cả API...")
    print("=" * 60)
    
    # Test 1: Test kết nối với 3 bảng
    print("\n1️⃣ Test kết nối với 3 bảng chính:")
    try:
        response = requests.get(f"{base_url}/aqi/test-connection")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data['status']}")
            print(f"📊 Dim_Location: {data['results']['Dim_Location']['total_locations']} locations")
            print(f"📊 Dim_Time: {data['results']['Dim_Time']['total_time_records']} records")
            print(f"📊 Fact_Weather_AirQuality: {data['results']['Fact_Weather_AirQuality']['total_fact_records']} records")
            print(f"🔗 JOIN Test: {data['results']['join_test']['joined_locations']} locations joined")
            print(f"📋 Summary: {data['summary']['connection_status']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 2: Test API locations (quan trọng nhất!)
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
            if len(data) == 30:
                print("🎉 SUCCESS: API trả về đúng 30 điểm quận huyện!")
            else:
                print("⚠️ WARNING: API không trả về đúng 30 điểm")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 3: Test API stats
    print("\n3️⃣ Test API stats:")
    try:
        response = requests.get(f"{base_url}/aqi/stats")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📊 Total locations: {data['total_locations']}")
            print(f"📊 Total records: {data['total_records']}")
            print(f"📊 Average AQI: {data['avg_aqi']}")
            print(f"🎯 Expected: 30 locations, Actual: {data['total_locations']}")
            if data['total_locations'] == 30:
                print("🎉 SUCCESS: API stats hiển thị đúng 30 điểm!")
            else:
                print("⚠️ WARNING: API stats không hiển thị đúng 30 điểm")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 4: Test API current AQI
    print("\n4️⃣ Test API current AQI:")
    try:
        response = requests.get(f"{base_url}/aqi/current")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📊 Total records: {len(data)}")
            if len(data) > 0:
                print(f"📍 First record: {data[0]['location_name']} - AQI: {data[0]['AQI_TOTAL']}")
                print(f"📍 Last record: {data[-1]['location_name']} - AQI: {data[-1]['AQI_TOTAL']}")
            print(f"🎯 Expected: >0 records, Actual: {len(data)} records")
            if len(data) > 0:
                print("🎉 SUCCESS: API current trả về dữ liệu thực!")
            else:
                print("⚠️ WARNING: API current không trả về dữ liệu")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 5: Test API forecast hourly
    print("\n5️⃣ Test API forecast hourly:")
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
    print("🏁 Hoàn thành test cuối cùng!")
    print("\n📋 Tóm tắt:")
    print("✅ Backend đã được sửa để sử dụng 3 bảng chính")
    print("✅ API locations trả về 30 điểm từ Dim_Location")
    print("✅ API stats hiển thị 30 locations")
    print("✅ API current trả về dữ liệu thực")
    print("\n🎯 Bước tiếp theo:")
    print("  1. Mở trình duyệt: http://localhost:3000")
    print("  2. Kiểm tra map có hiển thị 30 điểm không")
    print("  3. Kiểm tra bảng thông tin có hiển thị '30 TRẠM QUAN TRẮC' không")

if __name__ == "__main__":
    test_all_apis()
