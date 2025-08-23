# CODING RULES - AirVXM Platform

## 🎯 Tổng quan dự án
**AirVXM Platform** là hệ thống giám sát chất lượng không khí Hà Nội với:
- **Backend**: FastAPI + Google BigQuery
- **Frontend**: HTML/CSS/JS (sẽ rebuild bằng ReactJS)
- **Database**: Google BigQuery với dữ liệu thời tiết và chất lượng không khí

## 🏗️ Kiến trúc hệ thống

### Backend (FastAPI)
```
app/
├── api/
│   ├── endpoints/
│   │   ├── aqi.py          # API chất lượng không khí
│   │   ├── forecast.py     # API dự báo LSTM
│   │   ├── chatbot.py      # API AI Chatbot
│   │   └── health.py       # Health check
│   └── router.py           # API routing
├── core/
│   ├── config.py           # Cấu hình chung
│   └── ml_config.py        # Cấu hình ML/LSTM
└── db/
    └── bigquery.py         # BigQuery client
```

### Frontend (Hiện tại: HTML/CSS/JS)
```
frontend/
├── index.html              # Trang chính với bản đồ
├── script.js               # Logic chính
└── style.css               # Styling
```

## 📋 Quy tắc code

### 1. Backend (Python/FastAPI)

#### Cấu trúc API
- **Base URL**: `/api/v1`
- **Endpoints chính**:
  - `GET /aqi/latest` - Dữ liệu mới nhất cho bản đồ
  - `GET /aqi/detail?lat={lat}&lng={lng}` - Chi tiết một điểm
  - `GET /aqi/date-range` - Dữ liệu theo khoảng thời gian
  - `GET /aqi/locations` - Danh sách vị trí
  - `GET /aqi/stats` - Thống kê tổng quan
  - **Forecast Endpoints**:
    - `GET /forecast/hourly?lat={lat}&lng={lng}&hours={hours}` - Dự báo theo giờ (LSTM)
    - `GET /forecast/daily?lat={lat}&lng={lng}&days={days}` - Dự báo theo ngày (LSTM)
    - `GET /forecast/trends?lat={lat}&lng={lng}&days={days}` - Phân tích xu hướng
  - **AI Chatbot Endpoints**:
    - `POST /chatbot/query` - Xử lý câu hỏi tự nhiên
    - `GET /chatbot/suggestions` - Gợi ý câu hỏi

#### Quy tắc code Python
```python
# ✅ Đúng
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import pandas as pd

# ❌ Sai
from fastapi import *
import pandas as pd
```

#### Error Handling
```python
# ✅ Đúng
try:
    client = get_bigquery_client()
    # ... logic
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ❌ Sai
try:
    # ... logic
except:
    pass
```

#### Type Hints
```python
# ✅ Đúng
async def get_latest_aqi() -> List[Dict[str, Any]]:
    pass

# ❌ Sai
async def get_latest_aqi():
    pass
```

### 2. Frontend (ReactJS - Mới)

#### Cấu trúc thư mục
```
frontend-react/
├── src/
│   ├── components/
│   │   ├── Map/
│   │   ├── Sidebar/
│   │   ├── Header/
│   │   └── common/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── App.tsx
├── public/
└── package.json
```

#### Quy tắc React
```typescript
// ✅ Đúng
import React, { useState, useEffect } from 'react';
import { AQIData } from '../types/aqi';

interface MapProps {
  data: AQIData[];
  onMarkerClick: (lat: number, lng: number) => void;
}

// ❌ Sai
import React from 'react';
const Map = (props) => {
```

#### State Management
```typescript
// ✅ Đúng - Sử dụng TypeScript
const [aqiData, setAqiData] = useState<AQIData[]>([]);
const [loading, setLoading] = useState<boolean>(false);

// ❌ Sai
const [aqiData, setAqiData] = useState([]);
const [loading, setLoading] = useState();
```

#### API Calls
```typescript
// ✅ Đúng
const fetchAQIData = async (): Promise<AQIData[]> => {
  try {
    const response = await fetch(`${API_BASE}/aqi/latest`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    throw error;
  }
};

// ❌ Sai
const fetchAQIData = async () => {
  const response = await fetch('/api/aqi/latest');
  return response.json();
};
```

### 3. Database (BigQuery)

#### Schema hiện tại
- **Staging_RawData**: Dữ liệu thô từ sensors
- **Daily_Aggregated_Data**: Dữ liệu tổng hợp theo ngày

#### Quy tắc query
```sql
-- ✅ Đúng - Sử dụng parameterized queries
query = f"""
SELECT * FROM `{client.project}.{settings.BIGQUERY_DATASET}.Staging_RawData`
WHERE DATE(time) <= CURRENT_DATE()
"""

-- ❌ Sai - Hardcode values
query = """
SELECT * FROM `invertible-now-462103-m3.weather_and_air_dataset.Staging_RawData`
"""
```

### 4. Styling & UI/UX

#### CSS Classes
```css
/* ✅ Đúng - Sử dụng BEM methodology */
.aqi-marker { }
.aqi-marker--active { }
.aqi-marker__icon { }
.aqi-marker__text { }

/* ❌ Sai */
.marker { }
.active-marker { }
```

#### Responsive Design
```css
/* ✅ Đúng */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: 50vh;
  }
}

/* ❌ Sai */
.sidebar {
  width: 300px;
}
```

## 🔧 Development Workflow

### 1. Local Development
```bash
# Backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (React)
cd frontend-react
npm install
npm start
```

### 2. Testing
```bash
# Backend tests
python -m pytest

# Frontend tests
npm test
```

### 3. Deployment
```bash
# Railway (Backend)
./scripts/deploy-railway-with-env.sh

# Vercel (Frontend)
./scripts/deploy-vercel.sh
```

## 📱 Responsive Design Rules

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile First
```css
/* ✅ Đúng - Mobile first approach */
.sidebar {
  width: 100%;
  height: 50vh;
}

@media (min-width: 768px) {
  .sidebar {
    width: 350px;
    height: 100vh;
  }
}
```

## 🎨 UI/UX Guidelines

### Color Scheme
- **Primary**: #667eea (Blue)
- **Success**: #228B22 (Green)
- **Warning**: #FFD700 (Yellow)
- **Danger**: #FF0000 (Red)
- **Background**: #f8fafc (Light Gray)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Base Size**: 16px

### Icons
- **Icon Library**: Font Awesome 6.4.0
- **Icon Style**: Solid (fas)

## 🔒 Security Rules

### Environment Variables
```bash
# ✅ Đúng - Sử dụng .env file
GOOGLE_APPLICATION_CREDENTIALS_BASE64=base64_encoded_credentials
GOOGLE_CLOUD_PROJECT=your-project-id
BIGQUERY_DATASET=your-dataset

# ❌ Sai - Hardcode trong code
GOOGLE_CLOUD_PROJECT = "invertible-now-462103-m3"
```

### API Security
- CORS được cấu hình đúng
- Không expose sensitive data qua API
- Validate input parameters

## 📝 Documentation Rules

### Code Comments
```python
# ✅ Đúng - Vietnamese comments cho business logic
def calculate_pm25_aqi(concentration):
    """
    Tính toán AQI từ nồng độ PM2.5 theo chuẩn US EPA
    Format: (aqi_low, aqi_high, c_low, c_high)
    """

# ❌ Sai - Không có comment
def calculate_pm25_aqi(concentration):
    pass
```

### README Updates
- Cập nhật README khi thay đổi API
- Document deployment steps
- Troubleshooting guides

## 🚀 Performance Rules

### Backend
- Sử dụng connection pooling cho BigQuery
- Implement caching cho data thường xuyên query
- Pagination cho large datasets

### Frontend
- Lazy loading cho components
- Debounce API calls
- Optimize bundle size

## 🧪 Testing Rules

### Backend Tests
```python
# ✅ Đúng
def test_calculate_pm25_aqi():
    assert calculate_pm25_aqi(12.0) == 50
    assert calculate_pm25_aqi(35.4) == 100

# ❌ Sai
def test_aqi():
    # No assertions
    pass
```

### Frontend Tests
```typescript
// ✅ Đúng
test('renders map component', () => {
  render(<Map data={mockData} />);
  expect(screen.getByTestId('map')).toBeInTheDocument();
});

// ❌ Sai
test('map works', () => {
  // No assertions
});
```

---

## 📋 Checklist trước khi commit

- [ ] Code follows coding rules
- [ ] All tests pass
- [ ] No console.log statements in production code
- [ ] Environment variables properly set
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] API endpoints documented
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Accessibility features added
- [ ] Performance optimized

## 🆘 Khi cần hỗ trợ

1. **Backend Issues**: Kiểm tra logs, BigQuery connection, credentials
2. **Frontend Issues**: Browser console, network tab, responsive design
3. **Deployment Issues**: Railway logs, environment variables, build process
4. **Data Issues**: BigQuery console, schema validation, data quality

---

**Lưu ý**: Luôn tuân thủ các quy tắc này để đảm bảo code quality và maintainability của dự án.
