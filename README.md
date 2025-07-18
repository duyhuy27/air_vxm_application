# 🌍 AirVXM Platform

**Hệ thống giám sát chất lượng không khí Hà Nội theo thời gian thực**

Nền tảng web hiện đại hiển thị dữ liệu AQI (Air Quality Index) từ 30 trạm quan trắc môi trường tại Hà Nội, tích hợp BigQuery để xử lý dữ liệu real-time.

## ✨ Tính năng chính

- 📍 **Bản đồ tương tác**: Hiển thị 30 trạm quan trắc với marker animation
- 📊 **AQI Dashboard**: Xếp hạng các quận theo chất lượng không khí
- 🔄 **Real-time Data**: Cập nhật dữ liệu từ BigQuery theo thời gian thực  
- 📱 **Responsive UI**: Giao diện hiện đại, hoạt động trên mọi thiết bị
- ⚡ **High Performance**: FastAPI backend với Leaflet frontend

## 🏗️ Kiến trúc hệ thống

```
Frontend (Vercel) ←→ Backend API (Railway) ←→ BigQuery Database
     ↓                      ↓                        ↓
- Leaflet Maps        - FastAPI              - Real-time data
- Vanilla JS          - US EPA AQI           - 30 monitoring stations
- CSS3 Animation      - CORS enabled         - Historical data
```

## 🚀 Quick Start - Development

### 1. Setup Backend

```bash
# Clone repository
git clone <repository-url>
cd air_vxm_application

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# hoặc: venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Cấu hình environment variables
cp env.example .env
# Chỉnh sửa .env với thông tin BigQuery credentials

# Chạy backend
uvicorn main:app --reload
```

Backend sẽ chạy tại: http://localhost:8000

### 2. Setup Frontend

```bash
# Mở terminal mới
cd frontend

# Chạy simple HTTP server
python -m http.server 3000
```

Frontend sẽ chạy tại: http://localhost:3000

## 🌐 Production Deployment

### Yêu cầu trước khi deploy:

```bash
# Cài đặt CLI tools
npm install -g @railway/cli
npm install -g vercel
```

### Deployment tự động (Khuyến nghị):

```bash
# Deploy cả backend + frontend
./scripts/deploy-all.sh
```

### Deployment từng bước:

#### 1. Deploy Backend lên Railway

```bash
# Chạy script deployment
./scripts/deploy-railway.sh
```

**Các bước trong script:**
1. Login Railway CLI
2. Khởi tạo project Railway  
3. Set environment variables
4. Upload BigQuery credentials
5. Deploy backend

**Environment Variables cần set:**
- `ENVIRONMENT=production`
- `DEBUG=false`
- `GOOGLE_CLOUD_PROJECT=invertible-now-462103-m3`
- `BIGQUERY_DATASET=weather_and_air_dataset`
- `GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/bigquery-key.json`

#### 2. Deploy Frontend lên Vercel

```bash
# Chạy script deployment
./scripts/deploy-vercel.sh
```

**Script sẽ tự động:**
1. Backup script.js gốc
2. Thay thế API URL từ localhost sang Railway URL
3. Deploy lên Vercel
4. Restore lại config localhost cho development

## 📁 Cấu trúc Project

```
air_vxm_application/
├── 📂 app/                     # Backend FastAPI
│   ├── 📂 api/
│   │   ├── 📂 endpoints/
│   │   │   ├── aqi.py         # AQI endpoints
│   │   │   └── health.py      # Health check
│   │   └── router.py          # Main router
│   ├── 📂 core/               # Core configurations
│   └── 📂 db/                 # Database connections
├── 📂 frontend/               # Frontend Vanilla JS
│   ├── index.html             # Main page
│   ├── style.css              # CSS + Animations
│   ├── script.js              # JavaScript logic
│   └── vercel.json            # Vercel config
├── 📂 scripts/                # Deployment scripts
│   ├── deploy-all.sh          # Deploy cả 2
│   ├── deploy-railway.sh      # Deploy backend  
│   └── deploy-vercel.sh       # Deploy frontend
├── 📂 credentials/            # BigQuery credentials
├── main.py                    # FastAPI entry point
├── requirements.txt           # Python dependencies
└── README.md                  # Documentation
```

## 🔧 API Endpoints

### Health Check
- `GET /` - Root health check
- `GET /api/v1/health` - Detailed health check

### Air Quality Data
- `GET /api/v1/aqi/latest` - Latest AQI data từ 30 trạm
- `GET /api/v1/aqi/detail?lat={lat}&lng={lng}` - Chi tiết theo tọa độ

### Example Response:
```json
{
  "location_name": "Hang Dau",
  "coordinates": {"lat": 21.0285, "lng": 105.8542},
  "aqi": 181,
  "pm25": 113.2,
  "temperature": 28.5,
  "humidity": 65.0,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🎨 UI Features

- **🎯 Interactive Map**: Leaflet với custom markers
- **📊 Live Rankings**: Top 10 quận theo AQI
- **💫 Animations**: Logo pulse, marker hover, loading states
- **📱 Responsive**: Mobile-first design
- **🎨 Modern UI**: Gradient backgrounds, glassmorphism effects

## 🔄 Update Process - Quy trình cập nhật

### Khi có thay đổi code:

```bash
# 1. Commit changes
git add .
git commit -m "Your update message"
git push

# 2. Deploy lại
./scripts/deploy-all.sh
```

### Chỉ update backend:
```bash
./scripts/deploy-railway.sh
```

### Chỉ update frontend:
```bash
./scripts/deploy-vercel.sh
```

## 🔐 Environment Variables

### Development (.env):
```env
ENVIRONMENT=development
DEBUG=true
GOOGLE_CLOUD_PROJECT=invertible-now-462103-m3
BIGQUERY_DATASET=weather_and_air_dataset
GOOGLE_APPLICATION_CREDENTIALS=credentials/bigquery-key.json
```

### Production (Railway):
Được set tự động qua script `deploy-railway.sh`

## 📊 Data Source

- **Database**: Google BigQuery
- **Dataset**: `invertible-now-462103-m3.weather_and_air_dataset.Staging_RawData`
- **Coverage**: 30 monitoring stations in Hanoi
- **Update Frequency**: Real-time
- **AQI Calculation**: US EPA standard

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python web framework)
- Google BigQuery (Data warehouse)
- Pandas (Data processing)  
- US EPA AQI calculation algorithm

**Frontend:**
- Vanilla JavaScript (No frameworks)
- Leaflet.js (Interactive maps)
- CSS3 (Animations & responsive design)

**Deployment:**
- Railway (Backend hosting)
- Vercel (Frontend hosting)
- GitHub (Source control)

## 🚨 Troubleshooting

### Backend Issues:
```bash
# Kiểm tra logs
railway logs

# Restart service
railway redeploy
```

### Frontend Issues:
```bash
# Kiểm tra deployment
vercel logs

# Redeploy
vercel --prod
```

### Local Development:
```bash
# Reset API URL in frontend
cd frontend
git checkout script.js

# Restart backend
uvicorn main:app --reload
```

## 📞 Support

Để được hỗ trợ hoặc báo lỗi, vui lòng tạo issue trong repository này.

---

**🌟 AirVXM Platform - Monitoring Air Quality in Hanoi**

*Được phát triển với ❤️ bằng FastAPI + BigQuery + Vanilla JS* 