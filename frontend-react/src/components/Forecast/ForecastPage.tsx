import * as React from 'react';
import { useState, useEffect } from 'react';
import './ForecastPage.css';
import { AQIData } from '../../types/aqi';
import { getAQILabel } from '../../utils/aqi';

interface ForecastPageProps {
    selectedLocation: AQIData | null;
    onBack: () => void;
}

const ForecastPage = ({ selectedLocation, onBack }: ForecastPageProps): React.JSX.Element => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const getAQILabelFromValue = (aqi: number) => {
        return getAQILabel(aqi);
    };

    const getAQIColor = (aqi: number) => {
        if (aqi <= 50) return '#00e400'; // Good - Green
        if (aqi <= 100) return '#ffff00'; // Moderate - Yellow
        if (aqi <= 150) return '#ff7e00'; // Unhealthy for Sensitive - Orange
        if (aqi <= 200) return '#ff0000'; // Unhealthy - Red
        if (aqi <= 300) return '#8f3f97'; // Very Unhealthy - Purple
        return '#7e0023'; // Hazardous - Brown
    };

    const getAQIBorderColor = (aqi: number) => {
        return getAQIColor(aqi);
    };

    // Generate 7-day forecast data
    const generateForecastData = () => {
        const baseAQI = selectedLocation?.aqi || 75;
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
                tempLow: Math.round(forecastTemp - 2),
                weatherIcon: getWeatherIcon(forecastAQI)
            };
        });
    };

    const getWeatherIcon = (aqi: number) => {
        if (aqi <= 50) return '☀️'; // Good - Sunny
        if (aqi <= 100) return '🌤️'; // Moderate - Partly cloudy
        if (aqi <= 150) return '⛅'; // Unhealthy for Sensitive - Cloudy
        if (aqi <= 200) return '🌫️'; // Unhealthy - Hazy
        if (aqi <= 300) return '🌧️'; // Very Unhealthy - Rainy
        return '⛈️'; // Hazardous - Stormy
    };

    const forecastData = generateForecastData();

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
                                        color: getAQIColor(selectedLocation.aqi || 0),
                                        borderLeftColor: getAQIBorderColor(selectedLocation.aqi || 0)
                                    }}
                                >
                                    {selectedLocation.aqi || '--'}
                                </div>
                                <p className="aqi-level">{getAQILabelFromValue(selectedLocation.aqi || 0)}</p>

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

                        {/* Dự báo 7 ngày - Horizontal scroll */}
                        <div className="forecast-section">
                            <h3>Dự báo 7 ngày tới</h3>
                            <div className="forecast-horizontal-scroll">
                                {forecastData.map((day, index) => (
                                    <div key={index} className="forecast-day-card">
                                        <div className="day-header">
                                            <div className="day-name">{day.dayName}</div>
                                            <div className="day-date">{day.dayDate}</div>
                                        </div>
                                        <div className="weather-icon">{day.weatherIcon}</div>
                                        <div className="forecast-aqi">
                                            <span
                                                className="aqi-number"
                                                style={{ color: getAQIColor(day.aqi) }}
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
                        </div>

                        {/* Thông tin bổ sung về chất lượng không khí */}
                        <div className="air-quality-info">
                            <h3>Thông tin chất lượng không khí</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Chỉ số AQI trung bình 7 ngày:</span>
                                    <span className="info-value">
                                        {Math.round(forecastData.reduce((sum, day) => sum + day.aqi, 0) / 7)}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Nhiệt độ trung bình:</span>
                                    <span className="info-value">
                                        {Math.round(forecastData.reduce((sum, day) => sum + (day.tempHigh + day.tempLow) / 2, 0) / 7)}°C
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
