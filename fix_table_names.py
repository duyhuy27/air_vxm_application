#!/usr/bin/env python3
"""
Script sửa tên bảng trong các file API để sử dụng đúng tên bảng từ BigQuery
"""

import os
import re

def fix_table_names_in_file(file_path):
    """Sửa tên bảng trong một file"""
    
    # Đọc file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Thay thế tên bảng
    replacements = [
        ('dim_locations', 'Dim_Location'),
        ('fact_weather_airquality', 'Fact_Weather_AirQuality'),
        ('dim_time', 'Dim_Time')
    ]
    
    original_content = content
    for old_name, new_name in replacements:
        content = content.replace(old_name, new_name)
    
    # Ghi lại file nếu có thay đổi
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Đã sửa {file_path}")
        return True
    else:
        print(f"ℹ️ Không có thay đổi trong {file_path}")
        return False

def main():
    """Main function"""
    print("🔧 Bắt đầu sửa tên bảng trong các file API...")
    
    # Danh sách file cần sửa
    files_to_fix = [
        'app/api/endpoints/aqi.py',
        'app/api/endpoints/forecast.py'
    ]
    
    total_fixed = 0
    
    for file_path in files_to_fix:
        if os.path.exists(file_path):
            if fix_table_names_in_file(file_path):
                total_fixed += 1
        else:
            print(f"⚠️ Không tìm thấy file: {file_path}")
    
    print(f"\n🎉 Hoàn thành! Đã sửa {total_fixed} file.")
    print("\n📋 Tên bảng đã được sửa:")
    print("  - dim_locations → Dim_Location")
    print("  - fact_weather_airquality → Fact_Weather_AirQuality")
    print("  - dim_time → Dim_Time")
    
    print("\n💡 Bước tiếp theo:")
    print("  1. Khởi động lại backend: python3 main.py")
    print("  2. Test API: curl http://localhost:8000/api/v1/aqi/test-connection")
    print("  3. Kiểm tra map có hiển thị 30 điểm không")

if __name__ == "__main__":
    main()
