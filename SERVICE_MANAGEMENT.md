# AirVXM Platform - Service Management

## 🚀 Quick Start

### Start All Services
```bash
./start-services.sh
```

### Stop All Services
```bash
./stop-services.sh
```

### Check Status
```bash
./check-status.sh
```

## 📋 Service Details

### Backend (FastAPI)
- **Port**: 8001
- **URL**: http://localhost:8001
- **Health Check**: http://localhost:8001/api/v1/health
- **API Base**: http://localhost:8001/api/v1

### Frontend (React)
- **Port**: 3000
- **URL**: http://localhost:3000
- **Proxy**: Routes API calls to backend on port 8001

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :8001
lsof -i :3000

# Kill processes using the port
lsof -ti:8001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

#### 2. Frontend Can't Connect to Backend
- Check if backend is running: `./check-status.sh`
- Verify proxy configuration in `frontend-react/package.json`
- Restart frontend after changing proxy settings

#### 3. Multiple Backend Instances
```bash
# Kill all Python processes
pkill -f "python3 main.py"

# Kill all React processes
pkill -f "react-scripts"
```

### Manual Startup

#### Backend Only
```bash
cd /Users/vydt/air_vxm_application
PORT=8001 python3 main.py
```

#### Frontend Only
```bash
cd frontend-react
npm start
```

## 📊 Monitoring

### Check Service Health
```bash
# Backend health
curl http://localhost:8001/api/v1/health

# AQI API test
curl http://localhost:8001/api/v1/aqi/test-simple

# Frontend through proxy
curl http://localhost:3000/api/v1/aqi/test-simple
```

### View Logs
```bash
# Backend logs (if running in foreground)
# Frontend logs appear in terminal where npm start was run
```

## 🛠️ Development

### Making Changes
1. **Backend**: Changes auto-reload with uvicorn
2. **Frontend**: Changes auto-reload with react-scripts
3. **Proxy**: Requires frontend restart after changes

### Environment Variables
- `PORT`: Backend port (default: 8000, we use 8001)
- `GOOGLE_CLOUD_PROJECT`: BigQuery project ID
- `BIGQUERY_DATASET`: BigQuery dataset name

## 📁 File Structure
```
air_vxm_application/
├── start-services.sh      # Start all services
├── stop-services.sh       # Stop all services
├── check-status.sh        # Check service status
├── main.py               # Backend entry point
├── frontend-react/       # React frontend
│   ├── package.json      # Frontend dependencies & proxy config
│   └── src/              # React source code
└── app/                  # Backend source code
    ├── api/              # API endpoints
    └── core/             # Configuration
```

## 🔒 Security Notes
- Backend runs on localhost only
- Frontend proxy routes to localhost
- No external access by default
- BigQuery credentials stored in `credentials/` directory

## 📞 Support
If you encounter issues:
1. Run `./check-status.sh` to diagnose
2. Check terminal logs for error messages
3. Verify ports are not in use by other applications
4. Restart services using the management scripts
