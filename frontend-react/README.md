# AirVXM Frontend

Frontend ReactJS cho hệ thống giám sát chất lượng không khí Hà Nội.

## Tính năng

- 🗺️ Bản đồ tương tác với dữ liệu AQI thời gian thực
- 📊 Biểu đồ và thống kê chất lượng không khí
- 🤖 AI Chatbot hỗ trợ thông tin môi trường
- 🔮 Dự báo chất lượng không khí với LSTM
- 📱 Responsive design cho mọi thiết bị

## Công nghệ

- **Frontend**: ReactJS, TypeScript, TailwindCSS
- **Maps**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **State Management**: React Query
- **Deployment**: Vercel

## Cài đặt

```bash
npm install
npm start
```

## Build

```bash
npm run build
npm run build:vercel  # Cho Vercel deployment
```

## Cấu hình

- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment settings
- `package.json` - Dependencies và scripts

## API Integration

Kết nối với backend FastAPI trên Railway:
- AQI data từ Google BigQuery
- Forecast models với LSTM
- AI Chatbot với NLP

## Deployment

Frontend được deploy trên Vercel với TypeScript support đầy đủ.