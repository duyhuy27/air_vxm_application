#!/usr/bin/env python3
"""
Setup Script cho FastAPI BigQuery Application
Chạy script này để setup BigQuery tables và sample data
"""

import sys
import os

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.bigquery import create_sample_tables, insert_sample_data, test_connection

def main():
    """Main setup function"""
    print("🚀 FastAPI BigQuery Application Setup")
    print("=" * 50)
    
    # Test connection trước
    print("1. Testing BigQuery connection...")
    if test_connection():
        print("✅ BigQuery connection successful!")
    else:
        print("❌ BigQuery connection failed!")
        print("Please check your credentials and configuration.")
        return False
    
    # Tạo tables
    print("\n2. Creating sample tables...")
    if create_sample_tables():
        print("✅ Sample tables created successfully!")
    else:
        print("❌ Failed to create sample tables!")
        return False
    
    # Insert sample data
    print("\n3. Inserting sample data...")
    if insert_sample_data():
        print("✅ Sample data inserted successfully!")
    else:
        print("❌ Failed to insert sample data!")
        return False
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the application: python main.py")
    print("2. Visit: http://localhost:8000/docs")
    print("3. Test APIs: http://localhost:8000/api/v1/health")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 