#!/bin/bash

# AirVXM Platform - Startup Script
# Script khởi động cả backend và frontend một cách ổn định

echo "🚀 Starting AirVXM Platform Services..."

# Kiểm tra và kill các process cũ
echo "🔍 Checking for existing processes..."

# Kill backend processes trên port 8000 và 8001
echo "🔄 Stopping existing backend processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

# Kill frontend processes
echo "🔄 Stopping existing frontend processes..."
pkill -f "react-scripts" 2>/dev/null || true

# Đợi một chút để đảm bảo processes đã được kill
sleep 2

# Kiểm tra xem ports có còn được sử dụng không
if lsof -i :8001 >/dev/null 2>&1; then
    echo "❌ Port 8001 still in use. Force killing..."
    lsof -ti:8001 | xargs kill -9
    sleep 1
fi

if lsof -i :3000 >/dev/null 2>&1; then
    echo "❌ Port 3000 still in use. Force killing..."
    lsof -ti:3000 | xargs kill -9
    sleep 1
fi

# Khởi động backend
echo "🐍 Starting Backend (FastAPI) on port 8001..."
cd /Users/vydt/air_vxm_application
PORT=8001 python3 main.py &
BACKEND_PID=$!

# Đợi backend khởi động
echo "⏳ Waiting for backend to start..."
sleep 5

# Kiểm tra backend có hoạt động không
if curl -s "http://localhost:8001/api/v1/health" >/dev/null 2>&1; then
    echo "✅ Backend started successfully on port 8001"
else
    echo "❌ Backend failed to start. Check logs above."
    exit 1
fi

# Khởi động frontend
echo "⚛️  Starting Frontend (React) on port 3000..."
cd frontend-react
npm start &
FRONTEND_PID=$!

# Đợi frontend khởi động
echo "⏳ Waiting for frontend to start..."
sleep 10

# Kiểm tra frontend có hoạt động không
if curl -s "http://localhost:3000" >/dev/null 2>&1; then
    echo "✅ Frontend started successfully on port 3000"
else
    echo "❌ Frontend failed to start. Check logs above."
    exit 1
fi

# Kiểm tra kết nối API
echo "🔗 Testing API connection..."
if curl -s "http://localhost:3000/api/v1/aqi/test-simple" >/dev/null 2>&1; then
    echo "✅ API connection working through proxy"
else
    echo "❌ API connection failed. Check proxy configuration."
fi

echo ""
echo "🎉 AirVXM Platform Services Started Successfully!"
echo "📍 Backend: http://localhost:8001"
echo "📍 Frontend: http://localhost:3000"
echo "📍 API Health: http://localhost:8001/api/v1/health"
echo ""
echo "📝 Process IDs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 To stop services, run: pkill -f 'python3 main.py' && pkill -f 'react-scripts'"
echo ""

# Giữ script chạy để monitor processes
echo "👀 Monitoring services... (Press Ctrl+C to stop)"
wait
