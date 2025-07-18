#!/bin/bash

echo "🚂 RAILWAY DEPLOYMENT WITH ENVIRONMENT VARIABLES"
echo "=================================================="

# Bước 1: Generate credentials base64
echo "📋 Bước 1: Generate credentials base64..."
python3 scripts/setup_credentials.py

if [ ! -f "railway_credentials.txt" ]; then
    echo "❌ Không thể generate credentials. Vui lòng kiểm tra file credentials."
    exit 1
fi

echo ""
echo "🔧 Bước 2: Setup Railway Environment Variables"
echo "================================================"
echo "1. Truy cập Railway dashboard: https://railway.app/dashboard"
echo "2. Chọn project của bạn"
echo "3. Vào Settings > Environment Variables"
echo "4. Thêm các environment variables sau:"
echo ""
echo "   📝 GOOGLE_APPLICATION_CREDENTIALS_BASE64"
echo "   📄 Value: (copy từ file railway_credentials.txt)"
echo ""
echo "   📝 GOOGLE_CLOUD_PROJECT"
echo "   📄 Value: invertible-now-462103-m3"
echo ""
echo "   📝 BIGQUERY_DATASET" 
echo "   📄 Value: weather_and_air_dataset"
echo ""
echo "   📝 ENVIRONMENT"
echo "   📄 Value: production"
echo ""
echo "   📝 DEBUG"
echo "   📄 Value: false"
echo ""

# Hiển thị nội dung file credentials để copy
echo "🔑 CREDENTIALS BASE64 (copy value này):"
echo "========================================"
cat railway_credentials.txt
echo ""
echo "========================================"

echo ""
echo "⏳ Bước 3: Deploy to Railway"
echo "============================"
echo "Sau khi setup environment variables xong:"
echo "1. Commit và push code lên GitHub"
echo "2. Railway sẽ tự động deploy"
echo "3. Hoặc trigger manual deploy trong Railway dashboard"
echo ""

read -p "Đã setup environment variables xong chưa? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Bắt đầu deploy..."
    
    # Commit changes
    echo "📦 Committing changes..."
    git add .
    git commit -m "feat: Support environment variables for Railway deployment

- Add script to convert credentials to base64
- Update BigQuery client to support env variables
- Add Railway deployment with env vars support"
    
    # Push to GitHub
    echo "⬆️  Pushing to GitHub..."
    git push origin main
    
    echo ""
    echo "✅ Code đã được push lên GitHub!"
    echo "🚂 Railway sẽ tự động deploy trong vài phút."
    echo ""
    echo "📊 Kiểm tra deployment:"
    echo "1. Railway dashboard: https://railway.app/dashboard"
    echo "2. Logs: Xem logs để đảm bảo BigQuery connection thành công"
    echo "3. Health check: /api/v1/health để test kết nối"
    
else
    echo "⚠️  Vui lòng setup environment variables trước khi deploy:"
    echo "1. Copy value từ railway_credentials.txt"
    echo "2. Paste vào Railway Environment Variables"
    echo "3. Chạy lại script này"
fi

echo ""
echo "🧹 Cleaning up..."
echo "Bạn có muốn xóa file railway_credentials.txt? (y/n)"
read -p "(File này chứa sensitive data): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f railway_credentials.txt
    echo "✅ Đã xóa railway_credentials.txt"
else
    echo "⚠️  Nhớ xóa railway_credentials.txt sau khi setup xong!"
fi 