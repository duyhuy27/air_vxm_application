# 🌡️ Hướng dẫn tính năng Heatmap và Layer Control

## 📋 Tổng quan

Tính năng mới đã được tích hợp vào bản đồ AirVXM để cung cấp khả năng hiển thị dữ liệu chất lượng không khí một cách trực quan hơn thông qua:

1. **🌡️ Bản Đồ Nhiệt (Heatmap)** - Hiển thị mật độ ô nhiễm không khí
2. **🗂️ Bộ Điều Khiển Lớp (Layer Control)** - Cho phép bật/tắt các lớp hiển thị

## 🎯 Tính năng chính

### 📍 Lớp Điểm Quan Trắc
- **Mô tả**: Hiển thị các marker cờ cắm tại các điểm quan trắc
- **Thông tin**: Mỗi marker hiển thị chỉ số AQI và mức độ chất lượng không khí
- **Tương tác**: Click để xem thông tin chi tiết, hover để xem tooltip

### 🌡️ Lớp Bản Đồ Nhiệt
- **Mô tả**: Hiển thị dữ liệu AQI dưới dạng heatmap với gradient màu
- **Màu sắc**:
  - 🟢 **Xanh lá**: Chất lượng tốt (AQI 0-50)
  - 🟡 **Vàng**: Trung bình (AQI 51-100)
  - 🟠 **Cam**: Kém (AQI 101-150)
  - 🔴 **Đỏ**: Xấu (AQI 151-200)
  - 🟣 **Tím**: Rất xấu (AQI 201-300)
  - 🔴 **Đỏ đậm**: Nguy hại (AQI >300)

## 🔧 Cách sử dụng

### 1. Mở Layer Control
- Tìm biểu tượng 🗂️ ở góc trên bên phải của bản đồ
- Click để mở/đóng bảng điều khiển lớp

### 2. Bật/Tắt các lớp
- ✅ **Tích checkbox** để hiển thị lớp
- ❌ **Bỏ tích checkbox** để ẩn lớp
- Có thể hiển thị cả hai lớp cùng lúc hoặc chỉ một lớp

### 3. Tương tác với Heatmap
- **Zoom in/out**: Heatmap sẽ tự động điều chỉnh độ chi tiết
- **Pan**: Di chuyển bản đồ để xem các khu vực khác
- **Overlay**: Có thể hiển thị cùng với markers để so sánh

## 🎨 Tùy chỉnh kỹ thuật

### Cấu hình Heatmap
```typescript
const heatmapOptions = {
  radius: 25,        // Bán kính ảnh hưởng
  blur: 20,          // Độ mờ
  maxZoom: 17,       // Zoom tối đa hiển thị
  max: 1.0,          // Giá trị cường độ tối đa
  minOpacity: 0.3,   // Độ trong suốt tối thiểu
  gradient: {        // Gradient màu tùy chỉnh
    0.0: '#00FF00',  // Xanh lá
    0.17: '#FFFF00', // Vàng
    0.33: '#FF8C00', // Cam
    0.5: '#FF0000',  // Đỏ
    0.67: '#8B008B', // Tím
    1.0: '#800000'   // Đỏ đậm
  }
}
```

### Tính toán Intensity
```typescript
// Normalize AQI value cho heatmap (0-1)
const intensity = Math.min(aqi / 300, 1);
```

## 📊 Lợi ích

### 1. **Trực quan hóa dữ liệu tốt hơn**
- Nhìn thấy xu hướng ô nhiễm theo vùng
- Dễ dàng xác định các hotspot ô nhiễm
- Hiểu được mức độ lan truyền ô nhiễm

### 2. **Linh hoạt trong xem dữ liệu**
- Chuyển đổi giữa view chi tiết (markers) và tổng quan (heatmap)
- Kết hợp cả hai để có cái nhìn toàn diện
- Tùy chỉnh theo nhu cầu phân tích

### 3. **Cải thiện UX**
- Interface thân thiện với người dùng
- Tương tác mượt mà
- Thông tin rõ ràng, dễ hiểu

## 🔍 Troubleshooting

### Heatmap không hiển thị
1. Kiểm tra xem layer có được bật trong Layer Control không
2. Zoom vào level phù hợp (< 17)
3. Đảm bảo có dữ liệu AQI

### Layer Control không hoạt động
1. Refresh trang web
2. Kiểm tra console log để xem có lỗi không
3. Đảm bảo JavaScript đã load đầy đủ

### Performance issues
1. Giảm số lượng data points nếu quá nhiều
2. Tăng `maxZoom` để hạn chế hiển thị ở zoom cao
3. Điều chỉnh `radius` và `blur` cho phù hợp

## 🚀 Phát triển tiếp theo

### Tính năng có thể mở rộng:
- **Time-based heatmap**: Heatmap theo thời gian
- **Multi-parameter heatmap**: Heatmap cho PM2.5, PM10 riêng biệt
- **Animation**: Heatmap động theo thời gian thực
- **Clustering heatmap**: Tự động phân cụm dữ liệu
- **Export functionality**: Xuất heatmap dưới dạng ảnh

---

*Được phát triển cho AirVXM Platform - Air Quality Monitoring System*
