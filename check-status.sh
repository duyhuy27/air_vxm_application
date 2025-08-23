#!/bin/bash

# AirVXM Platform - Status Check Script
# Script kiểm tra trạng thái của tất cả services

echo "🔍 AirVXM Platform - Status Check"
echo "=================================="

# Kiểm tra backend
echo ""
echo "🐍 Backend Status:"
if lsof -i :8001 >/dev/null 2>&1; then
    echo "   ✅ Port 8001: Active"
    echo "   📍 URL: http://localhost:8001"
    
    # Kiểm tra health endpoint
    if curl -s "http://localhost:8001/api/v1/health" >/dev/null 2>&1; then
        echo "   🟢 Health Check: OK"
    else
        echo "   🔴 Health Check: Failed"
    fi
    
    # Kiểm tra AQI endpoint
    if curl -s "http://localhost:8001/api/v1/aqi/test-simple" >/dev/null 2>&1; then
        echo "   🟢 AQI API: OK"
    else
        echo "   🔴 AQI API: Failed"
    fi
else
    echo "   ❌ Port 8001: Not Active"
fi

# Kiểm tra frontend
echo ""
echo "⚛️  Frontend Status:"
if lsof -i :3000 >/dev/null 2>&1; then
    echo "   ✅ Port 3000: Active"
    echo "   📍 URL: http://localhost:3000"
    
    # Kiểm tra frontend có thể truy cập được không
    if curl -s "http://localhost:3000" >/dev/null 2>&1; then
        echo "   🟢 Frontend Access: OK"
    else
        echo "   🔴 Frontend Access: Failed"
    fi
else
    echo "   ❌ Port 3000: Not Active"
fi

# Kiểm tra proxy
echo ""
echo "🔗 Proxy Status:"
if lsof -i :3000 >/dev/null 2>&1 && lsof -i :8001 >/dev/null 2>&1; then
    if curl -s "http://localhost:3000/api/v1/aqi/test-simple" >/dev/null 2>&1; then
        echo "   ✅ Proxy Working: Frontend -> Backend"
        echo "   🟢 API through proxy: OK"
    else
        echo "   🔴 Proxy Failed: Frontend cannot reach Backend"
    fi
else
    echo "   ❌ Proxy Check: Cannot verify (services not running)"
fi

# Kiểm tra processes
echo ""
echo "📊 Process Status:"
BACKEND_COUNT=$(pgrep -f "python3 main.py" | wc -l | tr -d ' ')
FRONTEND_COUNT=$(pgrep -f "react-scripts" | wc -l | tr -d ' ')

echo "   Backend processes: $BACKEND_COUNT"
echo "   Frontend processes: $FRONTEND_COUNT"

# Kiểm tra ports
echo ""
echo "🌐 Port Status:"
echo "   Port 8000: $(lsof -i :8000 2>/dev/null | wc -l | tr -d ' ') connections"
echo "   Port 8001: $(lsof -i :8001 2>/dev/null | wc -l | tr -d ' ') connections"
echo "   Port 3000: $(lsof -i :3000 2>/dev/null | wc -l | tr -d ' ') connections"

# Tóm tắt
echo ""
echo "📋 Summary:"
if lsof -i :8001 >/dev/null 2>&1 && lsof -i :3000 >/dev/null 2>&1; then
    if curl -s "http://localhost:3000/api/v1/aqi/test-simple" >/dev/null 2>&1; then
        echo "   🎉 All services are running and connected!"
        echo "   🌐 Frontend: http://localhost:3000"
        echo "   🐍 Backend: http://localhost:8001"
    else
        echo "   ⚠️  Services running but proxy not working"
    fi
else
    echo "   ❌ Some services are not running"
fi

echo ""
echo "🔧 Commands:"
echo "   Start all: ./start-services.sh"
echo "   Stop all:  ./stop-services.sh"
echo "   Check:     ./check-status.sh"
