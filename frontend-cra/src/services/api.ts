import axios from 'axios';
import {
    AQIData,
    AQIDetail,
    AQIStats,
    ForecastResponse,
    TrendsResponse,
    ChatbotQuery,
    ChatbotQueryResponse,
    ChatbotSuggestionsResponse
} from '../types/aqi';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://fastapi-bigquery-app-production.up.railway.app/api/v1';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
    }
});

// Request interceptor
apiClient.interceptors.request.use(
    (config: any) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error: any) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: any) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error: any) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// AQI API Services
export const aqiAPI = {
    // Lấy dữ liệu mới nhất cho bản đồ (CHỈ dữ liệu thật từ BigQuery)
    getLatest: async (): Promise<AQIData[]> => {
        const timestamp = Date.now();
        const response = await apiClient.get(`/aqi/realdata-only?t=${timestamp}`);
        console.log('🔄 Fresh API data received:', response.data.length, 'locations');
        return response.data;
    },

    // Lấy chi tiết một điểm cụ thể
    getDetail: async (lat: number, lng: number): Promise<AQIDetail> => {
        const response = await apiClient.get('/aqi/detail', {
            params: { lat, lng }
        });
        return response.data;
    },

    // Lấy dữ liệu theo khoảng thời gian
    getByDateRange: async (
        startDate: string,
        endDate: string,
        limit: number = 100
    ): Promise<any[]> => {
        const response = await apiClient.get('/aqi/date-range', {
            params: { start_date: startDate, end_date: endDate, limit }
        });
        return response.data;
    },

    // Lấy danh sách locations
    getLocations: async (): Promise<any[]> => {
        const response = await apiClient.get('/aqi/locations');
        return response.data;
    },

    // Lấy thống kê tổng quan
    getStats: async (): Promise<AQIStats> => {
        const response = await apiClient.get('/aqi/stats');
        return response.data;
    }
};

// Forecast API Services
export const forecastAPI = {
    // Dự báo theo giờ
    getHourly: async (
        lat: number,
        lng: number,
        hours: number = 24
    ): Promise<ForecastResponse> => {
        const response = await apiClient.get('/forecast/hourly', {
            params: { lat, lng, hours }
        });
        return response.data;
    },

    // Dự báo theo ngày
    getDaily: async (
        lat: number,
        lng: number,
        days: number = 7
    ): Promise<ForecastResponse> => {
        const response = await apiClient.get('/forecast/daily', {
            params: { lat, lng, days }
        });
        return response.data;
    },

    // Phân tích xu hướng
    getTrends: async (
        lat: number,
        lng: number,
        days: number = 30
    ): Promise<TrendsResponse> => {
        const response = await apiClient.get('/forecast/trends', {
            params: { lat, lng, days }
        });
        return response.data;
    }
};

// Chatbot API Services
export const chatbotAPI = {
    // Xử lý câu hỏi
    query: async (data: ChatbotQuery): Promise<ChatbotQueryResponse> => {
        const response = await apiClient.post('/chatbot/query', data);
        return response.data;
    },

    // Lấy gợi ý câu hỏi
    getSuggestions: async (): Promise<ChatbotSuggestionsResponse> => {
        const response = await apiClient.get('/chatbot/suggestions');
        return response.data;
    }
};

// Health Check API
export const healthAPI = {
    check: async (): Promise<any> => {
        const response = await apiClient.get('/health');
        return response.data;
    }
};

// Utility functions
export const apiUtils = {
    // Format error message
    formatError: (error: any): string => {
        if (error.response?.data?.detail) {
            return error.response.data.detail;
        }
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.message) {
            return error.message;
        }
        return 'Đã xảy ra lỗi không xác định';
    },

    // Check if error is network error
    isNetworkError: (error: any): boolean => {
        return !error.response && error.request;
    },

    // Check if error is server error
    isServerError: (error: any): boolean => {
        return error.response?.status >= 500;
    },

    // Check if error is client error
    isClientError: (error: any): boolean => {
        return error.response?.status >= 400 && error.response?.status < 500;
    }
};

// Export default apiClient for direct use
export default apiClient;

