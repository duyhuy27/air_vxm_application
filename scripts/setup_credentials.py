#!/usr/bin/env python3
"""
Script để setup credentials cho Railway deployment
Convert credentials JSON thành base64 string
"""
import base64
import json
import os

def convert_credentials_to_base64():
    """
    Convert credentials JSON file thành base64 string
    """
    credentials_path = "credentials/invertible-now-462103-m3-23f2fe58ae65.json"
    
    if not os.path.exists(credentials_path):
        print(f"❌ File credentials không tồn tại: {credentials_path}")
        return None
    
    try:
        # Đọc file JSON
        with open(credentials_path, 'r', encoding='utf-8') as f:
            credentials_data = json.load(f)
        
        # Convert thành JSON string
        credentials_json = json.dumps(credentials_data, separators=(',', ':'))
        
        # Convert thành base64
        credentials_base64 = base64.b64encode(credentials_json.encode('utf-8')).decode('utf-8')
        
        print("✅ Credentials đã được convert thành base64!")
        print("\n" + "="*80)
        print("RAILWAY ENVIRONMENT VARIABLE:")
        print("="*80)
        print(f"Variable Name: GOOGLE_APPLICATION_CREDENTIALS_BASE64")
        print(f"Variable Value:")
        print(f"{credentials_base64}")
        print("="*80)
        
        # Lưu vào file để dễ copy
        with open("railway_credentials.txt", "w") as f:
            f.write(f"GOOGLE_APPLICATION_CREDENTIALS_BASE64={credentials_base64}")
        
        print("\n✅ Đã lưu vào file 'railway_credentials.txt'")
        print("\nHướng dẫn setup Railway:")
        print("1. Truy cập Railway dashboard của project")
        print("2. Vào Settings > Environment Variables") 
        print("3. Thêm variable mới:")
        print("   - Name: GOOGLE_APPLICATION_CREDENTIALS_BASE64")
        print("   - Value: copy từ file railway_credentials.txt")
        print("4. Deploy lại application")
        
        return credentials_base64
        
    except Exception as e:
        print(f"❌ Lỗi khi convert credentials: {e}")
        return None

if __name__ == "__main__":
    convert_credentials_to_base64() 