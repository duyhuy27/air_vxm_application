import axios from 'axios';
import type {
    AQIData,
    AQIDetail,
    AQIStats,
    ForecastResponse,
    TrendsResponse,
    ChatbotQuery,
    ChatbotQueryResponse,
    ChatbotSuggestionsResponse
} from '../types/aqi';

// API Configuration - Using production server with new history APIs
const API_BASE_URL = 'https://fastapi-bigquery-app-production.up.railway.app/api/v1';

// Production-optimized timeout configuration
const TIMEOUT_CONFIG = {
    FAST: 15000,      // 15s for simple queries
    NORMAL: 45000,    // 45s for standard queries  
    SLOW: 60000,      // 60s for BigQuery operations
    VERY_SLOW: 90000  // 90s for complex analytics
};

// Create axios instance with production optimizations
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMEOUT_CONFIG.NORMAL, // Default 45s timeout
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    },
    // Production optimizations
    maxRedirects: 3,
    validateStatus: (status) => status < 500, // Accept all responses < 500
});

// Request interceptor with retry logic
apiClient.interceptors.request.use(
    (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);

        // Set appropriate timeout based on endpoint
        if (config.url?.includes('/forecast') || config.url?.includes('/history')) {
            config.timeout = TIMEOUT_CONFIG.SLOW; // 60s for forecast/history
        } else if (config.url?.includes('/aqi/realdata-only')) {
            config.timeout = TIMEOUT_CONFIG.FAST; // 15s for real-time data
        } else {
            config.timeout = TIMEOUT_CONFIG.NORMAL; // 45s default
        }

        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const { config, response, code, message } = error;

        // Enhanced error logging
        if (response) {
            console.error(`❌ API Response Error: ${response.status} ${config?.url}`, {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
                url: config?.url
            });

            // Special handling for 500 errors
            if (response.status === 500) {
                console.warn('🔥 Server error 500 detected - this may indicate backend issues');
                if (config?.url?.includes('/history')) {
                    console.log('📊 History API temporarily unavailable, will use fallback data');
                }
            }
        } else if (code === 'ECONNABORTED') {
            console.error(`⏰ API Timeout Error: ${config?.url}`, {
                timeout: config?.timeout,
                url: config?.url,
                message
            });
        } else if (code === 'ERR_NETWORK') {
            console.error(`🌐 API Network Error: ${config?.url}`, {
                code,
                message,
                url: config?.url
            });
        } else {
            console.error('❌ API Unknown Error:', {
                code,
                message,
                url: config?.url,
                error
            });
        }

        return Promise.reject(error);
    }
);

// Retry function for failed requests
const retryRequest = async (fn: () => Promise<any>, retries = 2, delay = 1000): Promise<any> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')) {
            console.log(`🔄 Retrying request... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryRequest(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

// AQI API Services
export const aqiAPI = {
    // Lấy dữ liệu mới nhất cho bản đồ (CHỈ dữ liệu thật từ BigQuery)
    getLatest: async (): Promise<AQIData[]> => {
        const timestamp = Date.now();
        const response = await retryRequest(() =>
            apiClient.get(`/aqi/realdata-only?t=${timestamp}`)
        );
        console.log('🔄 Fresh API data received:', response.data.length, 'locations');
        return response.data;
    },

    // Lấy chi tiết một điểm cụ thể
    getDetail: async (lat: number, lng: number): Promise<AQIDetail> => {
        const response = await retryRequest(() =>
            apiClient.get('/aqi/detail', {
                params: { lat, lng }
            })
        );
        return response.data;
    },

    // Lấy dữ liệu theo khoảng thời gian
    getByDateRange: async (
        startDate: string,
        endDate: string,
        limit: number = 100
    ): Promise<any[]> => {
        const response = await retryRequest(() =>
            apiClient.get('/aqi/date-range', {
                params: { start_date: startDate, end_date: endDate, limit }
            })
        );
        return response.data;
    },

    // Lấy danh sách locations
    getLocations: async (): Promise<any[]> => {
        const response = await retryRequest(() =>
            apiClient.get('/aqi/locations')
        );
        return response.data;
    },

    // Lấy thống kê tổng quan
    getStats: async (): Promise<AQIStats> => {
        const response = await retryRequest(() =>
            apiClient.get('/aqi/stats')
        );
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
        const response = await retryRequest(() =>
            apiClient.get('/forecast/hourly', {
                params: { lat, lng, hours }
            })
        );
        return response.data;
    },

    // Dự báo theo ngày
    getDaily: async (
        lat: number,
        lng: number,
        days: number = 7
    ): Promise<ForecastResponse> => {
        const response = await retryRequest(() =>
            apiClient.get('/forecast/daily', {
                params: { lat, lng, days }
            })
        );
        return response.data;
    },

    // Phân tích xu hướng
    getTrends: async (
        lat: number,
        lng: number,
        days: number = 30
    ): Promise<TrendsResponse> => {
        const response = await retryRequest(() =>
            apiClient.get('/forecast/trends', {
                params: { lat, lng, days }
            })
        );
        return response.data;
    }
};

// Chatbot API Services
export const chatbotAPI = {
    // Xử lý câu hỏi
    query: async (data: ChatbotQuery): Promise<ChatbotQueryResponse> => {
        const response = await retryRequest(() =>
            apiClient.post('/chatbot/query', data)
        );
        return response.data;
    },

    // Lấy gợi ý câu hỏi
    getSuggestions: async (): Promise<ChatbotSuggestionsResponse> => {
        const response = await retryRequest(() =>
            apiClient.get('/chatbot/suggestions')
        );
        return response.data;
    }
};

// Historical AQI data API Services
export const historyAPI = {
    // Lấy dữ liệu AQI trung bình theo ngày
    getDaily: async (locationName: string, days: number = 7): Promise<any[]> => {
        const response = await retryRequest(() =>
            apiClient.get('/history/daily', {
                params: { location_name: locationName, days }
            })
        );
        return response.data;
    },

    // Lấy dữ liệu AQI theo giờ
    getHourly: async (locationName: string, hours: number = 24): Promise<any[]> => {
        const response = await retryRequest(() =>
            apiClient.get('/history/hourly', {
                params: { location_name: locationName, hours }
            })
        );
        return response.data;
    },

    // Lấy thống kê tổng hợp lịch sử
    getSummary: async (locationName: string): Promise<any> => {
        const response = await retryRequest(() =>
            apiClient.get('/history/summary', {
                params: { location_name: locationName }
            })
        );
        return response.data;
    },

    // Lấy phân tích chuyên sâu 7 ngày
    getInsights: async (locationName: string): Promise<any> => {
        const response = await retryRequest(() =>
            apiClient.get('/history/insights', {
                params: { location_name: locationName }
            })
        );
        return response.data;
    }
};

// Health Check API
export const healthAPI = {
    check: async (): Promise<any> => {
        const response = await retryRequest(() =>
            apiClient.get('/health')
        );
        return response.data;
    }
};

// Utility functions
export const apiUtils = {
    // Format error message
    formatError: (error: any): string => {
        if (error.code === 'ECONNABORTED') {
            return 'Yêu cầu bị timeout. Vui lòng thử lại sau.';
        }
        if (error.code === 'ERR_NETWORK') {
            return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
        }
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
    },

    // Check if error is timeout
    isTimeout: (error: any): boolean => {
        return error.code === 'ECONNABORTED';
    }
};

// Export default apiClient for direct use
export default apiClient;
