# 🚀 Deploy Frontend lên Vercel - AirVXM Platform

## 🎯 **Mục tiêu**
Deploy **chỉ frontend React** lên Vercel, backend đã thành công trên Railway.

## ⚠️ **Vấn đề đã sửa**
- ✅ Tạo `tsconfig.json` cho TypeScript
- ✅ Làm sạch file `App.tsx`
- ✅ Cấu hình `vercel.json` đúng
- ✅ Tạo `.vercelignore` để loại bỏ backend files

## 🚀 **Cách deploy**

### **Option 1: Sử dụng script (Khuyến nghị)**
```bash
./deploy-vercel.sh
```

### **Option 2: Deploy thủ công**
```bash
# 1. Cài đặt Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

## 🔧 **Cấu hình đã thiết lập**

### **vercel.json**
```json
{
  "buildCommand": "cd frontend-react && npm install && npm run build",
  "outputDirectory": "frontend-react/build",
  "framework": "create-react-app"
}
```

### **.vercelignore**
- Loại bỏ tất cả backend files
- Chỉ giữ lại frontend-react
- Loại bỏ credentials và test files

## 📋 **Kiểm tra trước khi deploy**

### **1. Build locally thành công**
```bash
cd frontend-react
npm run build
# Phải thấy "Compiled successfully"
```

### **2. Cấu trúc thư mục đúng**
```
air_vxm_application/
├── vercel.json              # ✅ Cấu hình Vercel
├── .vercelignore            # ✅ Loại bỏ backend
├── frontend-react/          # ✅ Thư mục frontend
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── main.py                  # ❌ Không deploy lên Vercel
```

## 🚨 **Lỗi thường gặp**

### **Lỗi "Can't resolve './App'"**
- ✅ Đã sửa: File `App.tsx` đã được làm sạch
- ✅ Đã sửa: `tsconfig.json` đã được tạo

### **Lỗi "Module not found"**
- ✅ Đã sửa: Tất cả components đều tồn tại
- ✅ Đã sửa: Import paths đúng

### **Lỗi "Build failed"**
- ✅ Đã sửa: Build command đúng
- ✅ Đã sửa: Output directory đúng

## 🌐 **Sau khi deploy thành công**

### **1. Cập nhật API URL**
```typescript
// frontend-react/src/services/api.ts
const API_BASE_URL = 'https://your-railway-app.railway.app';
```

### **2. Test integration**
- Mở frontend URL trên Vercel
- Kiểm tra kết nối với backend
- Test các tính năng chính

## 📱 **Kết quả mong đợi**
- ✅ Frontend React hoạt động trên Vercel
- ✅ Kết nối được với backend Railway
- ✅ Hiển thị bản đồ và dữ liệu AQI
- ✅ AI Chatbot hoạt động
- ✅ Dự báo LSTM hoạt động

---

**Lưu ý**: Đảm bảo backend Railway đang hoạt động trước khi test frontend!