#!/bin/bash

echo "🌐 Deploying Frontend to Vercel..."

# 1. Kiểm tra Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI chưa được cài. Cài đặt bằng:"
    echo "npm install -g vercel"
    exit 1
fi

# 2. Nhập Backend URL
read -p "🔗 Nhập Railway Backend URL (vd: https://your-app.railway.app): " BACKEND_URL
BACKEND_URL="${BACKEND_URL%/}"  # Remove trailing slash

# 3. Tạo file config với backend URL
echo "⚙️  Updating API URL..."
cd frontend

# Backup original script.js
cp script.js script.js.backup

# Update API_BASE_URL in script.js với pattern chính xác
sed -i.bak "s|const API_BASE = 'http://localhost:8000/api/v1';|const API_BASE = '$BACKEND_URL/api/v1';|g" script.js

echo "✅ Updated API URL to: $BACKEND_URL/api/v1"

# 4. Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# 5. Restore original for local development
echo "🔄 Restoring local development config..."
mv script.js.backup script.js

cd ..

echo "✅ Frontend deployment hoàn tất!"
echo "🌐 Frontend URL sẽ hiển thị sau khi deploy xong" 