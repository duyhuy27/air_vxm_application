# AirVXM Platform - Frontend New

## Tổng quan

Đây là phiên bản mới hoàn toàn của AirVXM Platform Frontend, được xây dựng từ đầu với React + Vite + TypeScript để giải quyết vấn đề "màn hình trắng" khi sử dụng Leaflet maps và đảm bảo tính ổn định cao.

## Công nghệ sử dụng

- **React 19.1.1** - Framework UI
- **Vite 7.1.3** - Build tool
- **TypeScript** - Type safety
- **Leaflet** - Thư viện bản đồ
- **React Query** - State management
- **React Router Dom** - Routing
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **Recharts** - Charts

## Tính năng chính

### ✅ Hoàn thành
- 🗺️ **Bản đồ tương tác** với Leaflet
- 🎨 **Custom markers** hiển thị AQI
- 🌡️ **Heatmap layer** cho visualization
- 📊 **Sidebar** với thống kê và ranking
- 📈 **Trang dự báo** với bảng dữ liệu
- 🤖 **Chatbot AI** với giao diện hiện đại
- 📱 **Responsive design**
- 🎯 **TypeScript** đầy đủ

### 🔧 Khắc phục vấn đề
- ✅ **Màn hình trắng** khi hiển thị bản đồ
- ✅ **Vite compatibility** với Leaflet
- ✅ **Build tối ưu** cho production
- ✅ **Code splitting** thông minh

## Cài đặt và chạy

### Development

```bash
# Clone và vào thư mục
cd airvxm-frontend-new

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Cấu trúc thư mục

```
src/
├── components/
│   ├── Map/           # Component bản đồ
│   ├── Header/        # Header navigation
│   ├── Sidebar/       # Sidebar thống kê
│   ├── Forecast/      # Trang dự báo
│   ├── Chatbot/       # Trang chatbot
│   └── common/        # Components dùng chung
├── services/          # API services
├── types/             # TypeScript definitions
├── utils/             # Utility functions
└── App.tsx           # Main app component
```

## Triển khai

### Vercel (Khuyến nghị)

1. Connect repository với Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables:
   - `VITE_API_BASE_URL`: API endpoint

### Các nền tảng khác

- **Netlify**: Cấu hình tương tự Vercel
- **Firebase Hosting**: Support native
- **AWS S3 + CloudFront**: Cần cấu hình SPA routing

## Environment Variables

Tạo file `.env` trong root:

```bash
# API Configuration
VITE_API_BASE_URL=https://fastapi-bigquery-app-production.up.railway.app/api/v1

# App Configuration
VITE_APP_NAME=AirVXM Platform
VITE_APP_DESCRIPTION=Giám sát chất lượng không khí Hà Nội
```

## Vite Configuration

File `vite.config.ts` đã được tối ưu cho:
- ⚡ **Build performance**
- 📦 **Code splitting**
- 🗺️ **Leaflet compatibility**
- 🎯 **Production optimization**

## API Integration

Ứng dụng kết nối với BigQuery API để lấy:
- 🌡️ Dữ liệu AQI realtime
- 📊 Thống kê chất lượng không khí
- 📈 Dự báo xu hướng
- 🤖 Chatbot responses

## Performance

### Bundle Size Analysis
```
├── leaflet.js     ~149KB (thư viện bản đồ)
├── index.js       ~312KB (main app)
├── router.js      ~31KB  (routing)
├── vendor.js      ~11KB  (utilities)
```

### Optimizations
- ⚡ **Lazy loading** cho routes
- 📦 **Code splitting** theo tính năng
- 🗺️ **Map tiles caching**
- 🎨 **CSS optimization**

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 74+
- ✅ Safari 13+
- ✅ Edge 80+

## Troubleshooting

### Map không hiển thị
- Kiểm tra console errors
- Verify Leaflet CSS imports
- Check network connectivity

### Build errors
- Xóa `node_modules` và reinstall
- Clear Vite cache: `npx vite --force`
- Check TypeScript configuration

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Create Pull Request

## Support

Báo cáo bug hoặc yêu cầu tính năng mới qua GitHub Issues.

---

**Phiên bản:** 1.0.0  
**Cập nhật:** ${new Date().toLocaleDateString('vi-VN')}  
**Tác giả:** Senior ReactJS Developer