import { AQILevel, AQILevelInfo } from '../types/aqi';

// AQI Calculation Functions - theo chuẩn US EPA
export const calculatePM25AQI = (concentration: number): number => {
    if (concentration <= 0) return 0;

    // Breakpoints theo US EPA cho PM2.5
    const breakpoints = [
        { aqiLow: 0, aqiHigh: 50, cLow: 0.0, cHigh: 12.0 },
        { aqiLow: 51, aqiHigh: 100, cLow: 12.1, cHigh: 35.4 },
        { aqiLow: 101, aqiHigh: 150, cLow: 35.5, cHigh: 55.4 },
        { aqiLow: 151, aqiHigh: 200, cLow: 55.5, cHigh: 150.4 },
        { aqiLow: 201, aqiHigh: 300, cLow: 150.5, cHigh: 250.4 },
        { aqiLow: 301, aqiHigh: 500, cLow: 250.5, cHigh: 500.4 }
    ];

    for (const bp of breakpoints) {
        if (concentration >= bp.cLow && concentration <= bp.cHigh) {
            // Áp dụng công thức nội suy tuyến tính
            const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) *
                (concentration - bp.cLow) + bp.aqiLow;
            return Math.round(aqi);
        }
    }

    return 500; // Nếu vượt quá, trả về max AQI
};

export const getAQILevel = (aqi: number): AQILevel => {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy-sensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very-unhealthy';
    return 'hazardous';
};

// Cập nhật thang màu AQI theo chuẩn mới từ hình ảnh
export const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#00E400';      // Xanh lá cây - Tốt
    if (aqi <= 100) return '#FFFF00';     // Vàng - Trung bình  
    if (aqi <= 150) return '#FF7E00';     // Cam - Kém
    if (aqi <= 200) return '#FF0000';     // Đỏ - Xấu
    if (aqi <= 300) return '#8F3F97';     // Tím - Rất xấu
    return '#7E0023';                     // Nâu - Nguy hại
};

export const getAQILabel = (aqi: number): string => {
    if (aqi <= 50) return 'Tốt';
    if (aqi <= 100) return 'Trung bình';
    if (aqi <= 150) return 'Kém';
    if (aqi <= 200) return 'Xấu';
    if (aqi <= 300) return 'Rất xấu';
    return 'Nguy hại';
};

export const getAQITips = (aqi: number): string => {
    if (aqi <= 50) return 'Không ảnh hưởng đến sức khỏe. Thích hợp cho mọi hoạt động ngoài trời.';
    if (aqi <= 100) return 'Người nhạy cảm có thể bị ảnh hưởng nhẹ. Phù hợp cho hầu hết mọi người.';
    if (aqi <= 150) return 'Người nhạy cảm nên hạn chế ra ngoài. Mọi người nên theo dõi sức khỏe.';
    if (aqi <= 200) return 'Tất cả mọi người bắt đầu bị ảnh hưởng đến sức khỏe. Hạn chế hoạt động ngoài trời.';
    if (aqi <= 300) return 'Ảnh hưởng nghiêm trọng đến sức khỏe. Mọi người nên tránh hoạt động ngoài trời.';
    return 'Báo động khẩn cấp về sức khỏe. Khuyến nghị ở trong nhà và đóng cửa sổ.';
};

export const getAQILevelInfo = (aqi: number): AQILevelInfo => {
    const level = getAQILevel(aqi);
    const label = getAQILabel(aqi);
    const color = getAQIColor(aqi);
    const tips = getAQITips(aqi);

    const emojis = {
        'good': '😊',
        'moderate': '🙂',
        'unhealthy-sensitive': '😐',
        'unhealthy': '😟',
        'very-unhealthy': '😩',
        'hazardous': '😷'
    };

    const descriptions = {
        'good': 'Chất lượng không khí tốt',
        'moderate': 'Chất lượng không khí trung bình',
        'unhealthy-sensitive': 'Chất lượng không khí kém',
        'unhealthy': 'Chất lượng không khí xấu',
        'very-unhealthy': 'Chất lượng không khí rất xấu',
        'hazardous': 'Chất lượng không khí nguy hại'
    };

    return {
        level,
        label,
        color,
        emoji: emojis[level],
        description: descriptions[level],
        healthAdvice: tips
    };
};

// Thang màu AQI chi tiết theo chuẩn mới
export const AQI_COLOR_SCALE = [
    {
        range: '0 - 50',
        level: 'Tốt (Good)',
        color: '#00E400',
        rgb: 'RGB(0, 228, 0)',
        healthImpact: 'Không ảnh hưởng đến sức khỏe'
    },
    {
        range: '51 - 100',
        level: 'Trung bình (Moderate)',
        color: '#FFFF00',
        rgb: 'RGB(255, 255, 0)',
        healthImpact: 'Người nhạy cảm có thể bị ảnh hưởng nhẹ'
    },
    {
        range: '101 - 150',
        level: 'Kém (Unhealthy for Sensitive Groups)',
        color: '#FF7E00',
        rgb: 'RGB(255, 126, 0)',
        healthImpact: 'Người nhạy cảm nên hạn chế ra ngoài'
    },
    {
        range: '151 - 200',
        level: 'Xấu (Unhealthy)',
        color: '#FF0000',
        rgb: 'RGB(255, 0, 0)',
        healthImpact: 'Tất cả mọi người bắt đầu bị ảnh hưởng đến sức khỏe'
    },
    {
        range: '201 - 300',
        level: 'Rất xấu (Very Unhealthy)',
        color: '#8F3F97',
        rgb: 'RGB(143, 63, 151)',
        healthImpact: 'Ảnh hưởng nghiêm trọng đến sức khỏe'
    },
    {
        range: '301 - 500',
        level: 'Nguy hại (Hazardous)',
        color: '#7E0023',
        rgb: 'RGB(126, 0, 35)',
        healthImpact: 'Báo động khẩn cấp về sức khỏe, khuyến nghị ở trong nhà'
    }
];

// District Name Mapping - 30 quận/huyện Hà Nội (từ data thực tế)
export const hanoiDistricts: { [key: string]: string } = {
    // Quận nội thành
    '21.0333_105.8214': 'Ba Đình',
    '21.0311_105.7924': 'Cầu Giấy',
    '21.0167_105.825': 'Đống Đa',
    '21.0075_105.8525': 'Hai Bà Trưng',
    '21.0285_105.8542': 'Hoàn Kiếm',
    '20.9958_105.8158': 'Thanh Xuân',
    '20.9703_105.8552': 'Hoàng Mai',
    '21.0403_105.8953': 'Long Biên',
    '20.9675_105.7765': 'Hà Đông',
    '21.0719_105.8211': 'Tây Hồ',
    '21.0189_105.7619': 'Nam Từ Liêm',
    '21.0583_105.7667': 'Bắc Từ Liêm',

    // Huyện ngoại thành
    '20.7167_105.8167': 'Ứng Hòa',
    '20.7333_105.9': 'Phú Xuyên',
    '20.75_105.75': 'Mỹ Đức',
    '20.8333_105.6667': 'Chương Mỹ',
    '20.8333_105.8833': 'Thường Tín',
    '20.8667_105.7667': 'Thanh Oai',
    '20.9389_105.8453': 'Thanh Trì',
    '20.9833_105.6167': 'Quốc Oai',
    '21.0167_105.7833': 'Thanh Xuân',
    '21.0333_105.5667': 'Thạch Thất',
    '21.0333_105.7': 'Hoài Đức',
    '21.0333_105.95': 'Gia Lâm',
    '21.1167_105.6667': 'Đan Phượng',
    '21.1333_105.3667': 'Ba Vì',
    '21.1333_105.5': 'Sơn Tây',
    '21.1333_105.5833': 'Phúc Thọ',
    '21.1333_105.8167': 'Đông Anh',
    '21.1833_105.7167': 'Mê Linh',
    '21.2333_105.8333': 'Sóc Sơn'
};

export const getDistrictName = (lat: number, lng: number): string => {
    // Thử tìm với độ chính xác cao nhất trước
    const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
    if (hanoiDistricts[key]) {
        return hanoiDistricts[key];
    }

    // Thử tìm với độ chính xác thấp hơn (3 chữ số thập phân)
    const key3 = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    if (hanoiDistricts[key3]) {
        return hanoiDistricts[key3];
    }

    // Thử tìm gần đúng nhất
    let closestDistrict = '';
    let minDistance = Infinity;

    Object.keys(hanoiDistricts).forEach(districtKey => {
        const [districtLat, districtLng] = districtKey.split('_').map(Number);
        const distance = Math.sqrt(
            Math.pow(lat - districtLat, 2) + Math.pow(lng - districtLng, 2)
        );

        if (distance < minDistance && distance < 0.1) { // Trong phạm vi 0.1 độ (~11km)
            minDistance = distance;
            closestDistrict = hanoiDistricts[districtKey];
        }
    });

    if (closestDistrict) {
        return closestDistrict;
    }

    // Fallback cuối cùng - sử dụng tên địa điểm từ data nếu có
    return `Khu vực ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
};

// Time formatting utilities
export const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const formatRelativeTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
};

// Data processing utilities
export const processAQIData = (data: any[]): any[] => {
    return data.map(item => ({
        ...item,
        time: formatTime(item.time),
        aqi: calculatePM25AQI(item.pm2_5),
        district: getDistrictName(item.latitude, item.longitude)
    }));
};

export const groupByDistrict = (data: any[]): Record<string, any[]> => {
    return data.reduce((acc, item) => {
        const district = getDistrictName(item.latitude, item.longitude);
        if (!acc[district]) {
            acc[district] = [];
        }
        acc[district].push(item);
        return acc;
    }, {});
};

export const getDistrictStats = (data: any[]): Record<string, any> => {
    const grouped = groupByDistrict(data);
    const stats: Record<string, any> = {};

    Object.keys(grouped).forEach(district => {
        const districtData = grouped[district];
        const aqiValues = districtData.map(d => d.aqi).filter(aqi => aqi > 0);

        if (aqiValues.length > 0) {
            stats[district] = {
                count: districtData.length,
                avgAQI: Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length),
                maxAQI: Math.max(...aqiValues),
                minAQI: Math.min(...aqiValues),
                latestUpdate: districtData[0].time
            };
        }
    });

    return stats;
};
