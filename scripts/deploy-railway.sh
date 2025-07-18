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

# 3. Khởi tạo project (chỉ lần đầu)
echo "📦 Khởi tạo Railway project..."
railway init

# 4. Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set ENVIRONMENT=production
railway variables set DEBUG=false
railway variables set GOOGLE_CLOUD_PROJECT=invertible-now-462103-m3
railway variables set BIGQUERY_DATASET=weather_and_air_dataset

# 5. Upload credentials file
echo "🔑 Upload BigQuery credentials..."
echo "Hãy upload file credentials/bigquery-key.json qua Railway dashboard"
echo "Sau đó set: GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/bigquery-key.json"

# 6. Deploy
echo "🚀 Deploying..."
railway deploy

echo "✅ Backend deployment hoàn tất!"
echo "🌐 URL sẽ hiển thị trong Railway dashboard" 