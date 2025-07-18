#!/bin/bash

echo "🚀 Deploying Backend to Railway..."

# 1. Kiểm tra Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI chưa được cài. Cài đặt bằng:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# 2. Login Railway (nếu chưa)
echo "🔐 Đăng nhập Railway..."
railway login

# 3. Kiểm tra nếu đã có project
if [ ! -f ".railway/config.json" ]; then
    echo "📦 Khởi tạo Railway project..."
    railway init
fi

echo ""
echo "⚙️  Environment Variables Setup"
echo "================================"
echo "Bạn cần set environment variables thủ công qua Railway dashboard:"
echo "1. Mở Railway dashboard: https://railway.com"
echo "2. Chọn project vừa tạo"
echo "3. Vào Settings > Variables"
echo "4. Thêm các variables sau:"
echo ""
echo "   ENVIRONMENT = production"
echo "   DEBUG = false"
echo "   GOOGLE_CLOUD_PROJECT = invertible-now-462103-m3"
echo "   BIGQUERY_DATASET = weather_and_air_dataset"
echo ""
echo "5. Upload BigQuery credentials:"
echo "   - Vào Files tab"
echo "   - Upload file credentials/bigquery-key.json"
echo "   - Thêm variable: GOOGLE_APPLICATION_CREDENTIALS = /app/credentials/bigquery-key.json"
echo ""

read -p "Đã setup variables xong? (y/n): " setup_done

if [[ $setup_done != "y" ]]; then
    echo "❌ Hãy setup variables trước khi deploy"
    exit 1
fi

# 4. Deploy
echo "🚀 Deploying..."
railway up

echo "✅ Backend deployment hoàn tất!"
echo "🌐 URL sẽ hiển thị trong Railway dashboard" 