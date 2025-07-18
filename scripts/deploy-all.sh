#!/bin/bash

echo "🚀 AirVXM Platform - Complete Deployment"
echo "========================================"

# Kiểm tra git status
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Bạn có thay đổi chưa commit. Commit trước khi deploy!"
    read -p "Có muốn tiếp tục? (y/n): " confirm
    if [[ $confirm != "y" ]]; then
        exit 1
    fi
fi

echo ""
echo "🏗️  BƯỚC 1: Deploy Backend lên Railway"
echo "======================================"
bash scripts/deploy-railway.sh

if [ $? -ne 0 ]; then
    echo "❌ Backend deployment thất bại!"
    exit 1
fi

echo ""
echo "🌐 BƯỚC 2: Deploy Frontend lên Vercel"
echo "====================================="
bash scripts/deploy-vercel.sh

if [ $? -ne 0 ]; then
    echo "❌ Frontend deployment thất bại!"
    exit 1
fi

echo ""
echo "🎉 DEPLOYMENT HOÀN TẤT!"
echo "======================"
echo "✅ Backend: Railway"
echo "✅ Frontend: Vercel"
echo ""
echo "🔍 Kiểm tra logs:"
echo "  - Railway: railway logs"
echo "  - Vercel: vercel logs" 