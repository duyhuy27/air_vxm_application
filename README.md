# FastAPI BigQuery Application

Ứng dụng FastAPI tích hợp với Google BigQuery, hỗ trợ frontend và deployment tự động.

## 🏗️ Kiến trúc

- **Backend**: FastAPI với BigQuery integration
- **Frontend**: HTML/CSS/JavaScript đơn giản
- **Database**: Google BigQuery
- **Deployment**: Railway (production), Vercel (frontend)

## 📋 Yêu cầu

- Python 3.11+
- Google Cloud Project với BigQuery API enabled
- Railway account (cho backend)
- Vercel account (cho frontend)

## 🚀 Cài đặt và Chạy Local

### 1. Clone và cài đặt dependencies

```bash
git clone <repository-url>
cd air_vxm_application
pip install -r requirements.txt
```

### 2. Cấu hình Google Cloud

- Đặt file service account JSON vào `credentials/`
- File mẫu: `credentials/your-project-credentials.json`

### 3. Cấu hình Environment

```bash
cp env.example .env
# Chỉnh sửa .env với thông tin project của bạn
```

### 4. Chạy application

```bash
# Chạy backend
uvicorn main:app --reload

# Hoặc sử dụng script
python main.py
```

## 🌐 Deployment

### Railway (Backend)

#### Option 1: Environment Variables (Recommended - Secure)

```bash
# 1. Generate credentials base64
python3 scripts/setup_credentials.py

# 2. Deploy với environment variables
./scripts/deploy-railway-with-env.sh
```

**Railway Environment Variables cần thiết:**
- `GOOGLE_APPLICATION_CREDENTIALS_BASE64`: Base64 encoded credentials JSON
- `GOOGLE_CLOUD_PROJECT`: Your GCP project ID
- `BIGQUERY_DATASET`: Your BigQuery dataset name
- `ENVIRONMENT`: production
- `DEBUG`: false

#### Option 2: Traditional deployment

```bash
./scripts/deploy-railway.sh
```

### Vercel (Frontend)

```bash
./scripts/deploy-vercel.sh
```

## 🔧 API Endpoints

### Health Check
```
GET /api/v1/health
```

### AQI Data
```
GET /api/v1/aqi/current
GET /api/v1/aqi/history?days=7
```

## 📁 Cấu trúc Project

```
air_vxm_application/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── aqi.py          # AQI data endpoints
│   │   │   └── health.py       # Health check
│   │   └── router.py           # API router
│   ├── core/
│   │   └── config.py          # Configuration
│   └── db/
│       └── bigquery.py        # BigQuery client
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── scripts/
│   ├── setup_credentials.py    # Convert credentials to base64
│   ├── deploy-railway-with-env.sh  # Deploy với env vars
│   ├── deploy-railway.sh       # Traditional deploy
│   └── deploy-vercel.sh        # Deploy frontend
├── credentials/                # Service account JSON files
├── main.py                     # Application entry point
├── requirements.txt
└── README.md
```

## 🔐 Security Best Practices

### Local Development
- File credentials trong `credentials/` folder
- Không commit credentials vào Git

### Production (Railway)
- Sử dụng Environment Variables
- Credentials được encode base64
- Không expose sensitive files

## 🧪 Testing

```bash
# Test local
python scripts/test_aqi.py

# Test deployment
python scripts/test-deployment.sh
```

## 🔍 Troubleshooting

### BigQuery Connection Issues

1. **Kiểm tra credentials**: 
   - Local: File có tồn tại trong `credentials/`?
   - Railway: Environment variable `GOOGLE_APPLICATION_CREDENTIALS_BASE64` đã set?

2. **Kiểm tra permissions**: Service account có quyền truy cập BigQuery?

3. **Kiểm tra project/dataset**: Tên project và dataset có đúng không?

### Health Check

```bash
curl https://your-app.railway.app/api/v1/health
```

Response mẫu:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00Z",
  "bigquery": {
    "bigquery": "healthy",
    "project": "your-project-id",
    "dataset": "your-dataset",
    "credentials_source": "environment"
  }
}
```

## 📈 Monitoring

- Railway Dashboard: Xem logs và metrics
- Health endpoint: Monitor application status
- BigQuery Console: Monitor query usage

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết chi tiết.

---

### 🔄 Recent Updates

- ✅ Support Environment Variables cho Railway deployment
- ✅ Security improvements với base64 credentials
- ✅ Automatic fallback: env vars → file credentials
- ✅ Enhanced health check với credentials source info
- ✅ Improved deployment scripts với better UX 