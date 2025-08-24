# 🚀 Hướng dẫn Deploy AirVXM Platform lên Vercel

## 📋 Tổng quan

Vercel là nền tảng deployment tối ưu cho React/Vite projects, thường ổn định hơn Netlify cho các ứng dụng JavaScript.

## 🛠️ Chuẩn bị

### 1. Cài đặt Vercel CLI
```bash
npm install -g vercel
```

### 2. Đăng nhập Vercel
```bash
vercel login
```

## 🚀 Deployment Methods

### Method 1: Tự động qua Script (Khuyến nghị)

```bash
# Chạy script tự động
./deploy-vercel.sh
```

### Method 2: Manual Deployment

```bash
# 1. Build project trước
cd frontend-react
npm ci
npm run build
cd ..

# 2. Deploy
vercel --prod
```

### Method 3: Git Integration (Continuous Deployment)

1. **Truy cập Vercel Dashboard**: https://vercel.com/dashboard
2. **Import Repository**: Chọn GitHub repository
3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (project root)
   - **Build Command**: `cd frontend-react && npm ci && npm run build`
   - **Output Directory**: `frontend-react/dist`

## ⚙️ Cấu hình quan trọng

### Environment Variables
Vercel sẽ tự động áp dụng từ `vercel.json`:
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://fastapi-bigquery-app-production.up.railway.app/api/v1",
    "NODE_ENV": "production"
  }
}
```

### Build Settings
```json
{
  "buildCommand": "cd frontend-react && npm ci && npm run build",
  "outputDirectory": "frontend-react/dist",
  "framework": "vite"
}
```

## 🔧 Troubleshooting

### Nếu Build Fail:

1. **Kiểm tra dependencies**:
```bash
cd frontend-react
npm ci
npm run build
```

2. **Xem logs chi tiết**:
```bash
vercel logs <deployment-url>
```

3. **Clear cache và rebuild**:
```bash
vercel --force
```

### Nếu Map không hiển thị:

1. **Kiểm tra Environment Variables** trên Vercel Dashboard
2. **Verify API endpoint** accessible từ production
3. **Check Console Logs** trong browser (F12)

## 📊 So sánh Vercel vs Netlify

| Feature | Vercel | Netlify |
|---------|---------|----------|
| **React Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Vite Build** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Edge Network** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Build Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Static Assets** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🎯 Expected Results

Sau khi deploy thành công trên Vercel, ứng dụng sẽ:

- ✅ **Map tiles hiển thị đầy đủ** (CARTO tiles)
- ✅ **Layer Control thu gọn** thành icon  
- ✅ **Markers và clusters** hoạt động
- ✅ **Heatmap render** chính xác
- ✅ **Performance tốt** hơn Netlify

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Build Logs**: https://vercel.com/docs/concepts/deployments/build-step#logs

---

## 🆘 Support

Nếu gặp vấn đề:
1. Check build logs trên Vercel Dashboard
2. Verify domain settings và DNS
3. Test trên localhost trước khi deploy
4. Compare với Netlify results nếu cần

**Vercel thường fix được các vấn đề mà Netlify gặp phải với Vite + Leaflet!**
