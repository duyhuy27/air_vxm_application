import * as React from 'react';
import { useState, useEffect } from 'react';
import './ForecastPage.css';
import type { AQIData } from '../../types/aqi';
import { getAQILabel, getAQIColor } from '../../utils/aqi';
import { forecastAPI } from '../../services/api';
import AQIHistoryChart from '../AQIHistoryChart/AQIHistoryChart';

interface ForecastPageProps {
    selectedLocation: AQIData | null;
    onBack: () => void;
}

const ForecastPage = ({ selectedLocation, onBack }: ForecastPageProps): React.JSX.Element => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [forecastData, setForecastData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize with default forecast data immediately
    const initializeForecastData = () => {
        const baseAQI = selectedLocation?.AQI_TOTAL || selectedLocation?.aqi || 75;
        const baseTemp = selectedLocation?.temperature_2m || 28;

        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(Date.now() + index * 24 * 60 * 60 * 1000);
            const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
            const dayDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

            const aqiVariation = Math.random() * 40 - 20;
            const forecastAQI = Math.max(0, Math.min(500, baseAQI + aqiVariation));

            const tempVariation = Math.random() * 6 - 3;
            const forecastTemp = baseTemp + tempVariation;

            return {
                dayName,
                dayDate,
                aqi: Math.round(forecastAQI),
                tempHigh: Math.round(forecastTemp + 2),
                tempLow: Math.round(forecastTemp - 2)
            };
        });
    };

    // Update time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Initialize forecast data immediately on mount
    useEffect(() => {
        console.log('Initializing forecast data with location:', selectedLocation);
        const initialData = initializeForecastData();
        console.log('Initial forecast data:', initialData);
        setForecastData(initialData);
    }, []);

    // Fetch forecast data when location changes
    useEffect(() => {
        if (selectedLocation) {
            console.log('Location changed, fetching forecast for:', selectedLocation);
            fetchForecastData();
        }
    }, [selectedLocation]);

    const fetchForecastData = async () => {
        if (!selectedLocation) return;

        setLoading(true);
        setError(null);

        try {
            // Try to fetch real forecast data from API with better error handling
            const response = await forecastAPI.getDaily(
                selectedLocation.latitude,
                selectedLocation.longitude,
                7
            );

            console.log('🌐 Forecast API response:', response);

            // Enhanced response validation
            if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                // Handle the actual API response structure
                console.log('✅ Valid forecast data received from data field:', response.data.length, 'days');
                setForecastData(response.data);
            } else if (response && response.data && Array.isArray(response.data)) {
                console.log('⚠️ Forecast data is empty array, using generated data');
                setForecastData(generateForecastData());
            } else if (response && response.data) {
                console.log('⚠️ API response missing forecast structure:', response.data);
                setForecastData(generateForecastData());
            } else {
                // Fallback to generated forecast if API doesn't return forecast data
                console.log('⚠️ API response missing forecast data, using generated data');
                setForecastData(generateForecastData());
            }
        } catch (err: any) {
            console.error('❌ Failed to fetch forecast data:', err);

            // Enhanced error handling for different error types
            if (err.code === 'ECONNABORTED') {
                setError('Yêu cầu bị timeout. Vui lòng thử lại sau.');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
            } else if (err.response?.status >= 500) {
                setError('Lỗi máy chủ. Vui lòng thử lại sau.');
            } else if (err.response?.status >= 400) {
                setError('Lỗi yêu cầu. Vui lòng kiểm tra thông tin.');
            } else {
                setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
            }

            // Always use fallback data on error
            const fallbackData = generateForecastData();
            console.log('🔄 Using fallback forecast data due to error:', fallbackData);
            setForecastData(fallbackData);
        } finally {
            setLoading(false);
        }
    };

    const getAQILabelFromValue = (aqi: number) => {
        return getAQILabel(aqi);
    };

    const getAQIColorFromValue = (aqi: number) => {
        return getAQIColor(aqi);
    };

    const getAQIBorderColor = (aqi: number) => {
        return getAQIColor(aqi);
    };

    // Generate 7-day forecast data as fallback
    const generateForecastData = () => {
        const baseAQI = selectedLocation?.AQI_TOTAL || selectedLocation?.aqi || 75;
        const baseTemp = selectedLocation?.temperature_2m || 28;

        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(Date.now() + index * 24 * 60 * 60 * 1000);
            const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
            const dayDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

            // Generate realistic forecast data
            const aqiVariation = Math.random() * 40 - 20; // ±20 AQI variation
            const forecastAQI = Math.max(0, Math.min(500, baseAQI + aqiVariation));

            const tempVariation = Math.random() * 6 - 3; // ±3°C variation
            const forecastTemp = baseTemp + tempVariation;

            return {
                dayName,
                dayDate,
                aqi: Math.round(forecastAQI),
                tempHigh: Math.round(forecastTemp + 2),
                tempLow: Math.round(forecastTemp - 2)
            };
        });
    };

    // Weather icon function removed - no longer needed

    const currentAQI = selectedLocation?.AQI_TOTAL || selectedLocation?.aqi || 0;

    return (
        <div className="forecast-page">
            {/* Header với nút Back */}
            <div className="forecast-header">
                <button className="back-button" onClick={onBack}>
                    ← Quay lại bản đồ
                </button>
                <h1>Dự báo thời tiết</h1>
                <div className="current-time">
                    {currentTime.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}
                </div>
            </div>

            <div className="forecast-content">
                {selectedLocation ? (
                    <div className="location-forecast">
                        {/* Tiêu đề chính - căn lề trái */}
                        <h2 className="location-title">
                            Dự báo cho: {selectedLocation.location_name || selectedLocation.district || 'Khu vực được chọn'}
                        </h2>

                        {/* Khu vực AQI hiện tại - Card style */}
                        <div className="current-aqi-section">
                            <div className="aqi-card">
                                <h3>Chỉ số AQI hiện tại</h3>
                                <div
                                    className="aqi-value"
                                    style={{
                                        color: getAQIColorFromValue(currentAQI),
                                        borderLeftColor: getAQIBorderColor(currentAQI)
                                    }}
                                >
                                    {currentAQI || '--'}
                                </div>
                                <p className="aqi-level">{getAQILabelFromValue(currentAQI)}</p>

                                {/* Thông tin bổ sung */}
                                <div className="aqi-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Nhiệt độ:</span>
                                        <span className="detail-value">{selectedLocation.temperature_2m || '--'}°C</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Độ ẩm:</span>
                                        <span className="detail-value">{selectedLocation.relative_humidity_2m || '--'}%</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Gió:</span>
                                        <span className="detail-value">{selectedLocation.wind_speed_10m || '--'} km/h</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">PM2.5:</span>
                                        <span className="detail-value">{selectedLocation.pm2_5 || '--'} µg/m³</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">PM10:</span>
                                        <span className="detail-value">{selectedLocation.pm10 || '--'} µg/m³</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p className="loading-text">Đang tải dữ liệu dự báo...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="error-container">
                                <h3>Không thể tải dữ liệu dự báo</h3>
                                <p>{error}</p>
                                <button className="retry-button" onClick={fetchForecastData}>
                                    Thử lại
                                </button>
                            </div>
                        )}

                        {/* Dự báo 7 ngày - Horizontal scroll - ALWAYS SHOW */}
                        <div className="forecast-section">
                            <h3>Dự báo 7 ngày tới</h3>
                            {loading ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p className="loading-text">Đang tải dự báo...</p>
                                </div>
                            ) : error ? (
                                <div className="error-container">
                                    <p>Không thể tải dự báo. Hiển thị dữ liệu mẫu.</p>
                                </div>
                            ) : null}

                            {forecastData.length > 0 && (
                                <div className="forecast-horizontal-scroll">
                                    {forecastData.map((day, index) => (
                                        <div key={index} className="forecast-day-card">
                                            <div className="day-header">
                                                <div className="day-name">{day.dayName}</div>
                                                <div className="day-date">{day.dayDate}</div>
                                            </div>
                                            <div className="forecast-aqi">
                                                <span
                                                    className="aqi-number"
                                                    style={{ color: getAQIColorFromValue(day.aqi) }}
                                                >
                                                    {day.aqi}
                                                </span>
                                                <span className="aqi-label">AQI</span>
                                            </div>
                                            <div className="temperature-range">
                                                <span className="temp-high">{day.tempHigh}°</span>
                                                <span className="temp-separator">/</span>
                                                <span className="temp-low">{day.tempLow}°</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Historical AQI Data Chart - NEW FEATURE */}
                        {selectedLocation && (
                            <AQIHistoryChart
                                locationName={selectedLocation.location_name || selectedLocation.district || 'Khu vực được chọn'}
                            />
                        )}

                        {/* Thông tin bổ sung về chất lượng không khí - ALWAYS SHOW */}
                        <div className="air-quality-info">
                            <h3>Thông tin chất lượng không khí</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Chỉ số AQI trung bình 7 ngày:</span>
                                    <span className="info-value">
                                        {forecastData.length > 0
                                            ? Math.round(forecastData.reduce((sum, day) => sum + day.aqi, 0) / 7)
                                            : '--'
                                        }
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Nhiệt độ trung bình:</span>
                                    <span className="info-value">
                                        {forecastData.length > 0
                                            ? Math.round(forecastData.reduce((sum, day) => sum + (day.tempHigh + day.tempLow) / 2, 0) / 7) + '°C'
                                            : '--'
                                        }
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Cập nhật lần cuối:</span>
                                    <span className="info-value">
                                        {currentTime.toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="no-location">
                        <h2>Chưa chọn địa điểm</h2>
                        <p>Vui lòng chọn một địa điểm trên bản đồ để xem dự báo thời tiết.</p>
                        <button className="select-location-btn" onClick={onBack}>
                            Chọn địa điểm
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForecastPage;
