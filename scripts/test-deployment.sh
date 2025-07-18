#!/bin/bash

echo "🧪 Testing AirVXM Platform Deployment"
echo "====================================="

# Kiểm tra input URLs
read -p "🔗 Nhập Backend URL (Railway): " BACKEND_URL
read -p "🌐 Nhập Frontend URL (Vercel): " FRONTEND_URL

echo ""
echo "🚀 Testing Backend APIs..."
echo "=========================="

# Test health check
echo "1️⃣ Testing health check..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/health")
if [ "$response" = "200" ]; then
    echo "✅ Health check: OK"
else
    echo "❌ Health check: FAILED (HTTP $response)"
fi

# Test latest AQI
echo "2️⃣ Testing latest AQI endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/aqi/latest")
if [ "$response" = "200" ]; then
    echo "✅ Latest AQI: OK"
else
    echo "❌ Latest AQI: FAILED (HTTP $response)"
fi

# Test detail endpoint with sample coordinates
echo "3️⃣ Testing detail endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/aqi/detail?lat=21.0285&lng=105.8542")
if [ "$response" = "200" ]; then
    echo "✅ Detail endpoint: OK"
else
    echo "❌ Detail endpoint: FAILED (HTTP $response)"
fi

echo ""
echo "🌐 Testing Frontend..."
echo "====================="

# Test frontend accessibility
echo "4️⃣ Testing frontend accessibility..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$response" = "200" ]; then
    echo "✅ Frontend: ACCESSIBLE"
else
    echo "❌ Frontend: NOT ACCESSIBLE (HTTP $response)"
fi

echo ""
echo "📊 Testing CORS..."
echo "=================="

# Test CORS
echo "5️⃣ Testing CORS configuration..."
cors_response=$(curl -s -H "Origin: $FRONTEND_URL" -H "Access-Control-Request-Method: GET" -X OPTIONS "$BACKEND_URL/api/v1/health")
if [ $? -eq 0 ]; then
    echo "✅ CORS: CONFIGURED"
else
    echo "❌ CORS: CONFIGURATION ISSUE"
fi

echo ""
echo "🎉 DEPLOYMENT TEST COMPLETED!"
echo "============================="
echo "📋 Manual checks cần làm:"
echo "   1. Mở $FRONTEND_URL trong browser"
echo "   2. Kiểm tra bản đồ hiển thị markers"
echo "   3. Click vào các markers xem popup"
echo "   4. Kiểm tra ranking sidebar"
echo "   5. Test responsive trên mobile"
echo ""
echo "🔗 Useful URLs:"
echo "   Backend API docs: $BACKEND_URL/docs"
echo "   Frontend: $FRONTEND_URL" 