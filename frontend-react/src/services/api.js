import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://fastapi-bigquery-app-production.up.railway.app/api/v1';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// AQI API Services
export const aqiAPI = {
    // Lấy dữ liệu mới nhất cho bản đồ (CHỈ dữ liệu thật từ BigQuery)
    getLatest: async () => {
        const timestamp = Date.now();
        const response = await apiClient.get(`/aqi/realdata-only?t=${timestamp}`);
        console.log('🔄 Fresh API data received:', response.data.length, 'locations');
        return response.data;
    },

    // Lấy chi tiết một điểm cụ thể
    getDetail: async (lat, lng) => {
        const response = await apiClient.get('/aqi/detail', {
            params: { lat, lng }
        });
        return response.data;
    },

    // Lấy dữ liệu theo khoảng thời gian
    getByDateRange: async (startDate, endDate, limit = 100) => {
        const response = await apiClient.get('/aqi/date-range', {
            params: { start_date: startDate, end_date: endDate, limit }
        });
        return response.data;
    },

    // Lấy danh sách locations
    getLocations: async () => {
        const response = await apiClient.get('/aqi/locations');
        return response.data;
    },

    // Lấy thống kê tổng quan
    getStats: async () => {
        const response = await apiClient.get('/aqi/stats');
        return response.data;
    }
};

// Forecast API Services
export const forecastAPI = {
    // Dự báo theo giờ
    getHourly: async (lat, lng, hours = 24) => {
        const response = await apiClient.get('/forecast/hourly', {
            params: { lat, lng, hours }
        });
        return response.data;
    },

    // Dự báo theo ngày
    getDaily: async (lat, lng, days = 7) => {
        const response = await apiClient.get('/forecast/daily', {
            params: { lat, lng, days }
        });
        return response.data;
    },

    // Phân tích xu hướng
    getTrends: async (lat, lng, days = 30) => {
        const response = await apiClient.get('/forecast/trends', {
            params: { lat, lng, days }
        });
        return response.data;
    }
};

// Chatbot API Services
export const chatbotAPI = {
    // Xử lý câu hỏi
    query: async (question) => {
        const response = await apiClient.post('/chatbot/query', {
            question: question
        });
        return response.data;
    },

    // Lấy gợi ý câu hỏi
    getSuggestions: async () => {
        const response = await apiClient.get('/chatbot/suggestions');
        return response.data;
    }
};