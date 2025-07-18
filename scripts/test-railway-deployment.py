#!/usr/bin/env python3
"""
Script để test Railway deployment và BigQuery connection
"""
import requests
import time
import json

# Cấu hình
RAILWAY_URL = input("Nhập Railway URL (ví dụ: https://your-app.railway.app): ").strip()
if not RAILWAY_URL:
    print("❌ Cần nhập Railway URL!")
    exit(1)

def test_health_endpoint():
    """Test health check endpoint"""
    try:
        print("🏥 Testing health endpoint...")
        response = requests.get(f"{RAILWAY_URL}/api/v1/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed!")
            print(f"📊 Response: {json.dumps(data, indent=2)}")
            
            # Kiểm tra BigQuery connection
            if 'bigquery' in data:
                bq_status = data['bigquery']
                if bq_status.get('bigquery') == 'healthy':
                    print("✅ BigQuery connection: HEALTHY")
                    print(f"📄 Credentials source: {bq_status.get('credentials_source', 'unknown')}")
                    print(f"🗂️  Project: {bq_status.get('project')}")
                    print(f"📊 Dataset: {bq_status.get('dataset')}")
                else:
                    print("❌ BigQuery connection: UNHEALTHY")
                    if 'error' in bq_status:
                        print(f"❌ Error: {bq_status['error']}")
            
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False

def test_root_endpoint():
    """Test root endpoint"""
    try:
        print("\n🏠 Testing root endpoint...")
        response = requests.get(f"{RAILWAY_URL}/", timeout=10)
        
        if response.status_code == 200:
            print("✅ Root endpoint accessible!")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False

def test_aqi_endpoints():
    """Test AQI endpoints"""
    try:
        print("\n🌬️  Testing AQI endpoints...")
        
        # Test current AQI
        response = requests.get(f"{RAILWAY_URL}/api/v1/aqi/current", timeout=15)
        if response.status_code == 200:
            print("✅ AQI current endpoint working!")
            data = response.json()
            print(f"📊 Sample data: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ AQI current endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ AQI endpoint error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 TESTING RAILWAY DEPLOYMENT")
    print("=" * 50)
    print(f"🌐 Testing URL: {RAILWAY_URL}")
    print("=" * 50)
    
    # Wait for deployment to be ready
    print("⏳ Waiting for deployment to be ready...")
    time.sleep(5)
    
    # Run tests
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Root endpoint
    if test_root_endpoint():
        tests_passed += 1
    
    # Test 2: Health endpoint  
    if test_health_endpoint():
        tests_passed += 1
    
    # Test 3: AQI endpoints
    if test_aqi_endpoints():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"✅ Tests passed: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 ALL TESTS PASSED! Deployment successful!")
        print(f"🌐 Your app is live at: {RAILWAY_URL}")
        print(f"🏥 Health check: {RAILWAY_URL}/api/v1/health")
        print(f"🌬️  AQI API: {RAILWAY_URL}/api/v1/aqi/current")
    else:
        print("⚠️  Some tests failed. Check Railway logs for details.")
        print("📋 Debugging steps:")
        print("1. Check Railway deployment logs")
        print("2. Verify environment variables are set correctly")
        print("3. Check BigQuery credentials and permissions")

if __name__ == "__main__":
    main() 