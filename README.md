# AQI Hanoi Visualization Platform

Nền tảng trực quan hóa chỉ số chất lượng không khí (AQI) tại Hà Nội với dữ liệu thời gian thực từ BigQuery.

## 🌟 Tech Stack & Features

**Backend**: FastAPI + BigQuery + Pandas (US EPA AQI calculation, null-safe processing)  
**Frontend**: Vanilla JS + Leaflet + CSS3 (AQI flags, detail modals, responsive)  
**Data**: 30 Hanoi monitoring stations with fallback weather values  
**Deploy**: Docker ready + Railway/Render/GCR options

## 📋 API Endpoints

### Core Endpoints
- `GET /` - Root health check
- `GET /docs` - Interactive API documentation (Swagger)
- `GET /api/v1/health` - Detailed health check
- `GET /api/v1/ready` - Readiness probe

### AQI (Air Quality) APIs **[MAIN FEATURE]**
- `GET /api/v1/aqi/latest` - Latest data từ tất cả điểm monitoring (cho bản đồ) 🌤️
- `GET /api/v1/aqi/detail?lat={lat}&lng={lng}` - Chi tiết đầy đủ của một điểm cụ thể 📍
- `GET /api/v1/aqi/date-range` - Dữ liệu theo khoảng thời gian
- `GET /api/v1/aqi/locations` - Danh sách locations có dữ liệu

### Users APIs (Demo)
- `GET /api/v1/users` - Lấy danh sách users
- `POST /api/v1/users` - Tạo user mới
- `GET /api/v1/users/{user_id}` - Lấy user theo ID

### Items APIs (Demo) 
- `GET /api/v1/items` - Lấy danh sách items (có filter theo category)
- `POST /api/v1/items` - Tạo item mới
- `GET /api/v1/items/categories` - Lấy danh sách categories

### Analytics APIs (Demo)
- `GET /api/v1/analytics/dashboard` - Dashboard stats tổng quan
- `GET /api/v1/analytics/items-by-category` - Phân tích theo category
- `GET /api/v1/analytics/trends` - Xu hướng theo thời gian

## 🚀 Cài đặt và Chạy

### 1. Requirements

- Python 3.11+
- Google Cloud Project với BigQuery enabled
- Service Account JSON file

### 2. Setup Local Development

```bash
# Clone project
git clone <repository-url>
cd air_vxm_application

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy và cấu hình environment
cp env.example .env
# Điền thông tin vào file .env

# Đặt service account JSON file vào thư mục credentials/
mkdir credentials
# Copy file service-account.json vào credentials/

# Chạy application
python main.py
# hoặc
uvicorn main:app --reload
```

### 3. Setup với Docker

```bash
# Build và run với docker-compose
docker-compose up --build

# Hoặc build và run manual
docker build -t fastapi-bigquery-app .
docker run -p 8000:8000 --env-file .env fastapi-bigquery-app
```

## 🗄️ BigQuery Setup

### 1. Tạo Dataset và Tables

```python
# Chạy script setup (chỉ cần 1 lần)
python -c "
from app.db.bigquery import create_sample_tables, insert_sample_data
create_sample_tables()
insert_sample_data()
"
```

### 2. Sample Schema

**Users Table:**
```sql
CREATE TABLE `project.dataset.users` (
    id INTEGER NOT NULL,
    name STRING NOT NULL,
    email STRING NOT NULL, 
    age INTEGER,
    created_at TIMESTAMP NOT NULL
);
```

**Items Table:**
```sql
CREATE TABLE `project.dataset.items` (
    id INTEGER NOT NULL,
    name STRING NOT NULL,
    description STRING,
    price FLOAT NOT NULL,
    category STRING NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

## 🌐 Deployment Options

### Option 1: Railway (Khuyến nghị - Dễ nhất)

1. Connect GitHub repo tới Railway
2. Set environment variables:
   ```
   GOOGLE_CLOUD_PROJECT=your-project-id
   BIGQUERY_DATASET=your-dataset  
   GOOGLE_APPLICATION_CREDENTIALS=base64-encoded-json
   ```
3. Deploy tự động qua Git push

### Option 2: Render

1. Connect GitHub repo tới Render
2. Sử dụng `render.yaml` configuration
3. Set environment variables qua dashboard
4. Deploy tự động

### Option 3: Google Cloud Run

```bash
# Setup gcloud CLI và login
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Deploy với Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Hoặc deploy trực tiếp
gcloud run deploy fastapi-bigquery-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## 📁 Project Structure

```
air_vxm_application/
├── app/
│   ├── __init__.py
│   ├── api/                    # API layer
│   │   ├── __init__.py
│   │   ├── router.py          # Main router
│   │   └── endpoints/         # API endpoints
│   │       ├── users.py       # Users CRUD
│   │       ├── items.py       # Items CRUD  
│   │       ├── analytics.py   # Analytics APIs
│   │       └── health.py      # Health checks
│   ├── core/                  # Core configuration
│   │   ├── __init__.py
│   │   └── config.py          # Settings & config
│   └── db/                    # Database layer
│       ├── __init__.py
│       └── bigquery.py        # BigQuery integration
├── credentials/               # Service account files
├── main.py                   # Application entry point
├── requirements.txt          # Python dependencies
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Local development
├── railway.toml            # Railway deployment
├── render.yaml             # Render deployment
├── cloudbuild.yaml         # Google Cloud Build
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default Value |
|----------|-------------|----------|---------------|
| `GOOGLE_CLOUD_PROJECT` | GCP Project ID | ✅ | `invertible-now-462103-m3` |
| `BIGQUERY_DATASET` | BigQuery Dataset name | ✅ | `weather_and_air_dataset` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | ✅ | `credentials/invertible-now-462103-m3-23f2fe58ae65.json` |
| `ENVIRONMENT` | deployment environment | ❌ | `development` |
| `DEBUG` | Enable debug mode | ❌ | `true` |

### Credentials Setup

1. Tạo Service Account trong GCP Console cho project `invertible-now-462103-m3`
2. Gán quyền BigQuery Data Viewer và BigQuery Job User
3. Download JSON key file 
4. Đặt file vào `credentials/invertible-now-462103-m3-23f2fe58ae65.json`

**Hoặc copy từ project cũ:**
```bash
cp /path/to/your/service-account.json credentials/invertible-now-462103-m3-23f2fe58ae65.json
```

## 🧪 Testing

```bash
# Chạy tests
pytest

# Test health check
curl http://localhost:8000/api/v1/health

# Test AQI endpoints (MAIN FEATURE)
curl http://localhost:8000/api/v1/aqi/latest        # Latest AQI data
curl http://localhost:8000/api/v1/aqi/locations     # Available locations  
curl http://localhost:8000/api/v1/aqi/stats         # AQI statistics

# Test demo APIs
curl -X POST "http://localhost:8000/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "age": 25}'
```

## 📚 Development Notes

### Thêm API mới:
1. Tạo file trong `app/api/endpoints/`
2. Define router và endpoints
3. Include router trong `app/api/router.py`

### BigQuery Operations:
- Sử dụng `get_bigquery_client()` cho mọi operations
- SQL injection protection: validate inputs
- Sử dụng parameterized queries cho production

### Error Handling:
- Tất cả endpoints có try-catch với HTTPException
- Log errors để debugging
- Return meaningful error messages

## 🤝 Contributing

1. Fork project
2. Create feature branch
3. Commit changes  
4. Push và create Pull Request

## 📞 Support

Nếu gặp vấn đề:
1. Check health endpoints trước: `/api/v1/health`
2. Verify BigQuery credentials và permissions
3. Check application logs
4. Test với sample data

---

**Happy Coding! 🚀** 