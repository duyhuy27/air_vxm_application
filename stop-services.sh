#!/bin/bash

# AirVXM Platform - Stop Services Script
# Script dừng tất cả services một cách an toàn

echo "🛑 Stopping AirVXM Platform Services..."

# Dừng backend processes
echo "🐍 Stopping Backend (FastAPI)..."
pkill -f "python3 main.py" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

# Dừng frontend processes
echo "⚛️  Stopping Frontend (React)..."
pkill -f "react-scripts" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Đợi một chút để đảm bảo processes đã được dừng
sleep 2

# Kiểm tra xem còn process nào không
echo "🔍 Checking remaining processes..."

if pgrep -f "python3 main.py" >/dev/null; then
    echo "❌ Backend processes still running. Force killing..."
    pkill -9 -f "python3 main.py"
fi

if pgrep -f "react-scripts" >/dev/null; then
    echo "❌ Frontend processes still running. Force killing..."
    pkill -9 -f "react-scripts"
fi

# Kiểm tra ports
if lsof -i :8000 >/dev/null 2>&1; then
    echo "❌ Port 8000 still in use. Force killing..."
    lsof -ti:8000 | xargs kill -9
fi

if lsof -i :8001 >/dev/null 2>&1; then
    echo "❌ Port 8001 still in use. Force killing..."
    lsof -ti:8001 | xargs kill -9
fi

if lsof -i :3000 >/dev/null 2>&1; then
    echo "❌ Port 3000 still in use. Force killing..."
    lsof -ti:3000 | xargs kill -9
fi

echo "✅ All services stopped successfully!"
echo ""
echo "📊 Final status:"
echo "   Backend processes: $(pgrep -f 'python3 main.py' | wc -l | tr -d ' ')"
echo "   Frontend processes: $(pgrep -f 'react-scripts' | wc -l | tr -d ' ')"
echo "   Port 8000: $(lsof -i :8000 2>/dev/null | wc -l | tr -d ' ')"
echo "   Port 8001: $(lsof -i :8001 2>/dev/null | wc -l | tr -d ' ')"
echo "   Port 3000: $(lsof -i :3000 2>/dev/null | wc -l | tr -d ' ')"
