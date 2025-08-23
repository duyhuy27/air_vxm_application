#!/usr/bin/env python3
"""
BigQuery Cost Monitor và Data Growth Tracker
Theo dõi chi phí và dự báo tăng trưởng dữ liệu
"""

import os
import sys
from datetime import datetime, timedelta
from google.cloud import bigquery
from google.oauth2 import service_account

def get_bigquery_client():
    """Khởi tạo BigQuery client"""
    credentials_path = "credentials/invertible-now-462103-m3-c75684b0bb78.json"
    
    if not os.path.exists(credentials_path):
        print(f"❌ Không tìm thấy file credentials: {credentials_path}")
        return None
    
    credentials = service_account.Credentials.from_service_account_file(credentials_path)
    client = bigquery.Client(credentials=credentials, project=credentials.project_id)
    return client

def analyze_data_growth():
    """Phân tích tốc độ tăng trưởng dữ liệu thực tế"""
    client = get_bigquery_client()
    if not client:
        return
    
    print("📊 PHÂN TÍCH TỐC ĐỘ TĂNG TRƯỞNG DỮ LIỆU")
    print("=" * 60)
    
    # Kiểm tra dữ liệu trong 7 ngày gần nhất
    query = """
    SELECT 
        DATE(t.time) as date,
        COUNT(*) as daily_records,
        AVG(f.pm2_5) as avg_pm25,
        AVG(f.temperature_2m) as avg_temp
    FROM `invertible-now-462103-m3.weather_and_air_dataset.Fact_Weather_AirQuality` f
    JOIN `invertible-now-462103-m3.weather_and_air_dataset.Dim_Time` t
    ON f.time_key = t.time_key
    WHERE DATE(t.time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    GROUP BY DATE(t.time)
    ORDER BY date DESC
    """
    
    try:
        results = client.query(query).result()
        
        total_records = 0
        dates = []
        
        for row in results:
            print(f"📅 {row.date}: {row.daily_records:,} records, PM2.5: {row.avg_pm25:.1f}, Temp: {row.avg_temp:.1f}°C")
            total_records += row.daily_records
            dates.append(row.date)
        
        if len(dates) > 0:
            avg_daily_records = total_records / len(dates)
            print(f"\n📈 Trung bình: {avg_daily_records:.0f} records/ngày")
            
            # Dự báo based on actual data
            print(f"\n🔮 DỰ BÁO DỰA TRÊN DỮ LIỆU THỰC TẾ:")
            periods = [
                ("1 tháng", 30),
                ("1 năm", 365), 
                ("10 năm", 3650)
            ]
            
            current_size_gb = 0.63  # From previous analysis
            bytes_per_record = 300  # Estimated
            
            for period_name, days in periods:
                new_records = avg_daily_records * days
                new_size_gb = (new_records * bytes_per_record) / (1024**3)
                total_size_gb = current_size_gb + new_size_gb
                
                print(f"📊 {period_name}: +{new_records:,.0f} records, +{new_size_gb:.2f} GB → Tổng: {total_size_gb:.2f} GB")
    
    except Exception as e:
        print(f"❌ Lỗi: {e}")

def calculate_storage_costs():
    """Tính toán chi phí lưu trữ chi tiết"""
    client = get_bigquery_client()
    if not client:
        return
    
    print("\n💰 PHÂN TÍCH CHI PHÍ BIGQUERY CHI TIẾT")
    print("=" * 60)
    
    # Lấy thông tin storage thực tế
    query = """
    SELECT 
        table_id,
        ROUND(size_bytes / 1024 / 1024 / 1024, 4) as size_gb,
        row_count,
        ROUND(size_bytes / 1024 / 1024 / 1024 * 0.020, 4) as monthly_storage_cost_usd
    FROM `invertible-now-462103-m3.weather_and_air_dataset.__TABLES__`
    WHERE table_id IN ('Fact_Weather_AirQuality', 'Staging_RawData', 'Dim_Time', 'Dim_Location')
    ORDER BY size_bytes DESC
    """
    
    try:
        results = client.query(query).result()
        
        total_size = 0
        total_cost = 0
        
        print("📋 Chi phí theo bảng:")
        for row in results:
            print(f"   📊 {row.table_id}: {row.size_gb} GB → ${row.monthly_storage_cost_usd:.4f}/tháng")
            total_size += row.size_gb
            total_cost += row.monthly_storage_cost_usd
        
        print(f"\n💾 Tổng storage: {total_size:.3f} GB")
        print(f"💵 Chi phí storage hiện tại: ${total_cost:.4f}/tháng (${total_cost*12:.2f}/năm)")
        
        # Dự báo chi phí
        print(f"\n🔮 DỰ BÁO CHI PHÍ:")
        growth_scenarios = [
            ("Conservative (hiện tại)", 1.0),
            ("1 năm", 1.1),  # +10%
            ("5 năm", 1.5),  # +50% 
            ("10 năm", 2.0)  # +100%
        ]
        
        for scenario, multiplier in growth_scenarios:
            future_size = total_size * multiplier
            future_monthly_cost = future_size * 0.020
            future_yearly_cost = future_monthly_cost * 12
            print(f"   📊 {scenario}: {future_size:.3f} GB → ${future_monthly_cost:.4f}/tháng (${future_yearly_cost:.2f}/năm)")
    
    except Exception as e:
        print(f"❌ Lỗi: {e}")

def query_cost_analysis():
    """Phân tích chi phí query"""
    print(f"\n🔍 PHÂN TÍCH CHI PHÍ QUERY")
    print("=" * 60)
    
    current_size_gb = 0.63
    query_cost_per_tb = 5.0  # $5 per TB
    
    print("💡 Chi phí query ước tính:")
    query_types = [
        ("Full table scan", current_size_gb, 1.0),
        ("Date range query (1 tháng)", current_size_gb * 0.08, 0.08),
        ("Location specific", current_size_gb * 0.03, 0.03),
        ("Aggregated dashboard", current_size_gb * 0.1, 0.1)
    ]
    
    for query_type, data_processed_gb, percentage in query_types:
        data_processed_tb = data_processed_gb / 1024
        cost = data_processed_tb * query_cost_per_tb
        print(f"   📊 {query_type}: {data_processed_gb:.3f} GB → ${cost:.5f}/query")
    
    print(f"\n📈 Với 1000 queries/tháng (mix queries):")
    avg_cost_per_query = 0.0001  # Estimated average
    monthly_query_cost = avg_cost_per_query * 1000
    print(f"   💵 Chi phí query: ~${monthly_query_cost:.2f}/tháng")

def monitoring_recommendations():
    """Đưa ra khuyến nghị monitoring"""
    print(f"\n🚨 KHUYẾN NGHỊ MONITORING")
    print("=" * 60)
    
    recommendations = [
        "🔔 Setup BigQuery quota alerts tại 80% limit",
        "📊 Monitor daily storage growth qua Cloud Monitoring", 
        "💰 Thiết lập budget alerts cho BigQuery costs",
        "🕐 Schedule weekly cost reports",
        "📈 Track query performance và optimize slow queries",
        "🗂️  Implement table partitioning by date",
        "❄️  Consider data archival policy sau 2-3 năm",
        "🔍 Use approximate aggregation cho large datasets"
    ]
    
    for rec in recommendations:
        print(f"   {rec}")
    
    print(f"\n⚙️  SETUP COMMANDS:")
    print(f"   # Tạo budget alert")
    print(f"   gcloud billing budgets create --billing-account=BILLING_ID --amount=10 --display-name='BigQuery Budget'")
    print(f"   ")
    print(f"   # Setup monitoring")
    print(f"   gcloud logging sinks create bigquery-costs 'bigquery.googleapis.com/dml_statistics'")

def main():
    """Main function"""
    print("🔍 BIGQUERY COST MONITOR & DATA GROWTH TRACKER")
    print("=" * 70)
    print(f"📅 Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    try:
        analyze_data_growth()
        calculate_storage_costs() 
        query_cost_analysis()
        monitoring_recommendations()
        
        print(f"\n✅ Hoàn thành phân tích cost monitor!")
        
    except Exception as e:
        print(f"❌ Lỗi tổng quát: {e}")

if __name__ == "__main__":
    main()
