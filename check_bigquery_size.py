#!/usr/bin/env python3
"""
Script kiểm tra dung lượng dữ liệu trong Google BigQuery và dự báo tăng trưởng
"""

import os
import sys
from google.cloud import bigquery
from google.oauth2 import service_account

def check_bigquery_data_size():
    """Kiểm tra dung lượng dữ liệu trong BigQuery và dự báo tăng trưởng"""
    
    try:
        # Thiết lập credentials
        credentials_path = "credentials/invertible-now-462103-m3-c75684b0bb78.json"
        
        if not os.path.exists(credentials_path):
            print(f"❌ Không tìm thấy file credentials: {credentials_path}")
            return
        
        # Khởi tạo BigQuery client
        credentials = service_account.Credentials.from_service_account_file(credentials_path)
        client = bigquery.Client(credentials=credentials, project=credentials.project_id)
        
        print(f"🔍 Đang kiểm tra dự án: {credentials.project_id}")
        print("=" * 70)
        
        # Danh sách các bảng cần kiểm tra
        tables_to_check = [
            "Daily_Aggregated_Data",
            "Dim_Location", 
            "Dim_Time",
            "Fact_Weather_AirQuality",
            "Staging_RawData",
            "forecast_aqi_next_7d"  # Bảng forecast mới thấy trong console
        ]
        
        total_size_bytes = 0
        total_rows = 0
        table_info = {}
        
        for table_name in tables_to_check:
            try:
                # Query để lấy thông tin về kích thước bảng
                query = f"""
                SELECT 
                    table_id,
                    size_bytes,
                    row_count,
                    ROUND(size_bytes / 1024 / 1024 / 1024, 2) as size_gb,
                    ROUND(size_bytes / 1024 / 1024, 2) as size_mb,
                    ROUND(size_bytes / 1024, 2) as size_kb
                FROM `{credentials.project_id}.weather_and_air_dataset.__TABLES__`
                WHERE table_id = '{table_name}'
                """
                
                query_job = client.query(query)
                results = query_job.result()
                
                for row in results:
                    print(f"📊 Bảng: {row.table_id}")
                    print(f"   📏 Kích thước: {row.size_gb} GB ({row.size_mb} MB)")
                    print(f"   📈 Số dòng: {row.row_count:,}")
                    print(f"   💾 Bytes: {row.size_bytes:,}")
                    print("-" * 50)
                    
                    total_size_bytes += row.size_bytes
                    total_rows += row.row_count
                    table_info[row.table_id] = {
                        'size_bytes': row.size_bytes,
                        'row_count': row.row_count,
                        'size_gb': row.size_gb
                    }
                    
            except Exception as e:
                print(f"⚠️  Không thể kiểm tra bảng {table_name}: {str(e)}")
                print("-" * 50)
        
        # Tổng kết hiện tại
        print("=" * 70)
        print("📋 TỔNG KẾT HIỆN TẠI:")
        print(f"   💾 Tổng dung lượng: {total_size_bytes / 1024 / 1024 / 1024:.2f} GB")
        print(f"   📈 Tổng số dòng: {total_rows:,}")
        
        # Dự báo tăng trưởng
        print("\n🚀 DỰ BÁO TĂNG TRƯỞNG DỮ LIỆU:")
        print("=" * 70)
        
        if total_size_bytes > 0:
            current_size_gb = total_size_bytes / 1024 / 1024 / 1024
            current_rows = total_rows
            
            # Giả sử dữ liệu được cập nhật mỗi giờ (24 lần/ngày)
            daily_growth_rate = 24  # 24 records per day per location
            locations = 30  # 30 điểm quận huyện
            
            # Tính tăng trưởng theo thời gian
            time_periods = [
                ("1 tháng", 30),
                ("3 tháng", 90),
                ("6 tháng", 180),
                ("1 năm", 365),
                ("2 năm", 730),
                ("5 năm", 1825),
                ("10 năm", 3650)
            ]
            
            for period_name, days in time_periods:
                # Tính số dòng mới
                new_rows = daily_growth_rate * locations * days
                total_future_rows = current_rows + new_rows
                
                # Ước tính dung lượng dựa trên tỷ lệ hiện tại
                if current_rows > 0:
                    bytes_per_row = total_size_bytes / current_rows
                    new_size_bytes = new_rows * bytes_per_row
                    total_future_size_gb = (total_size_bytes + new_size_bytes) / 1024 / 1024 / 1024
                    
                    print(f"📅 {period_name} ({days} ngày):")
                    print(f"   📈 Số dòng mới: +{new_rows:,}")
                    print(f"   📊 Tổng dòng: {total_future_rows:,}")
                    print(f"   💾 Dung lượng mới: +{new_size_bytes / 1024 / 1024 / 1024:.2f} GB")
                    print(f"   🗂️  Tổng dung lượng: {total_future_size_gb:.2f} GB")
                    print("-" * 50)
            
            # Phân tích chi phí
            print("\n💰 PHÂN TÍCH CHI PHÍ BIGQUERY:")
            print("=" * 70)
            
            # Giá BigQuery (ước tính)
            storage_cost_per_gb_month = 0.02  # $0.02 per GB per month
            
            # Chi phí lưu trữ
            monthly_storage_cost = current_size_gb * storage_cost_per_gb_month
            yearly_storage_cost = monthly_storage_cost * 12
            
            print(f"💾 Chi phí lưu trữ hiện tại:")
            print(f"   📅 Hàng tháng: ${monthly_storage_cost:.2f}")
            print(f"   📅 Hàng năm: ${yearly_storage_cost:.2f}")
            
            # Dự báo chi phí 1 năm và 10 năm
            if current_rows > 0:
                bytes_per_row = total_size_bytes / current_rows
                future_1year_size = (total_size_bytes + (daily_growth_rate * locations * 365 * bytes_per_row)) / 1024 / 1024 / 1024
                future_10year_size = (total_size_bytes + (daily_growth_rate * locations * 3650 * bytes_per_row)) / 1024 / 1024 / 1024
                
                cost_1year = future_1year_size * storage_cost_per_gb_month * 12
                cost_10year = future_10year_size * storage_cost_per_gb_month * 12
                
                print(f"\n🔮 Dự báo chi phí:")
                print(f"   📅 1 năm: ${cost_1year:.2f}")
                print(f"   📅 10 năm: ${cost_10year:.2f}")
        
        print("\n✅ Hoàn thành kiểm tra và dự báo!")
        
    except Exception as e:
        print(f"❌ Lỗi khi kết nối BigQuery: {str(e)}")
        print("💡 Hãy đảm bảo:")
        print("   1. File credentials tồn tại và hợp lệ")
        print("   2. Service account có quyền truy cập BigQuery")
        print("   3. Dự án BigQuery đang hoạt động")

if __name__ == "__main__":
    check_bigquery_data_size()
