# 🚀 Hướng dẫn Deployment AirVXM Platform

## ⚠️ **VẤN ĐỀ HIỆN TẠI**
Bạn đang gặp lỗi vì **deploy sai platform**:
- **Backend (FastAPI)** → Deploy lên **Railway** ✅
- **Frontend (React)** → Deploy lên **Vercel** ✅
- **KHÔNG** deploy backend lên Vercel ❌

## 🏗️ **Kiến trúc Deployment đúng**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│  (BigQuery)     │
│   Vercel        │    │   Railway       │    │  Google Cloud   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Bước 1: Deploy Backend lên Railway**

### 1.1 Cài đặt Railway CLI
```bash
npm install -g @railway/cli
```

### 1.2 Login Railway
```bash
railway login
```

### 1.3 Deploy Backend
```bash
# Sử dụng script có sẵn
./scripts/deploy-railway-with-env.sh

# Hoặc deploy thủ công
cd /workspace
railway init
railway up
```

### 1.4 Cấu hình Environment Variables trên Railway
```
GOOGLE_APPLICATION_CREDENTIALS_BASE64=<base64_encoded_credentials>
GOOGLE_CLOUD_PROJECT=<your_project_id>
BIGQUERY_DATASET=<your_dataset>
ENVIRONMENT=production
DEBUG=false
```

## 🌐 **Bước 2: Deploy Frontend lên Vercel**

### 2.1 Cài đặt Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Deploy Frontend
```bash
cd frontend-react
vercel --prod
```

### 2.3 Cấu hình Environment Variables trên Vercel
```
REACT_APP_API_URL=https://your-railway-app.railway.app
REACT_APP_ENVIRONMENT=production
```

## 🔧 **Bước 3: Cập nhật Frontend API URL**

Sau khi deploy backend thành công, cập nhật API URL trong frontend:

```typescript
// frontend-react/src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-railway-app.railway.app';
```

## 📋 **Kiểm tra Deployment**

### Backend Health Check
```bash
curl https://your-railway-app.railway.app/api/v1/health
```

### Frontend Test
```bash
# Mở browser và truy cập
https://your-vercel-app.vercel.app
```

## 🚨 **Lỗi thường gặp và cách khắc phục**

### 1. **Lỗi "Can't resolve './App'"**
- ✅ Đã sửa: Tạo `tsconfig.json` và `vercel.json`
- ✅ Đã sửa: Làm sạch file `App.tsx`

### 2. **Lỗi BigQuery Connection**
- ✅ Kiểm tra credentials trên Railway
- ✅ Kiểm tra environment variables

### 3. **Lỗi CORS**
- ✅ Backend đã cấu hình CORS cho Vercel domain

## 📁 **Cấu trúc files deployment**

```
air_vxm_application/
├── main.py                    # Backend entry point → Railway
├── requirements.txt           # Python dependencies → Railway
├── frontend-react/           # React app → Vercel
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json         # ✅ Đã tạo
│   ├── vercel.json           # ✅ Đã tạo
│   └── vercel-build.sh       # ✅ Đã tạo
└── scripts/
    ├── deploy-railway-with-env.sh
    └── deploy-vercel.sh
```

## 🎯 **Quy trình deployment đúng**

1. **Deploy Backend lên Railway** ✅
2. **Lấy Railway URL** ✅
3. **Cập nhật API URL trong frontend** ✅
4. **Deploy Frontend lên Vercel** ✅
5. **Test integration** ✅

## 🔗 **Links hữu ích**

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **BigQuery Console**: https://console.cloud.google.com/bigquery

---

**Lưu ý**: Không bao giờ deploy backend FastAPI lên Vercel. Vercel chỉ hỗ trợ frontend và serverless functions.