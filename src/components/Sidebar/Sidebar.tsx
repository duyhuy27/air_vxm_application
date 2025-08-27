import React from 'react';
import { X, MapPin, TrendingUp } from 'lucide-react';
import type { AQIData } from '../../types/aqi';
import { getAQIColor, getAQILabel, getDistrictName } from '../../utils/aqi';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    data: AQIData[];
    selectedLocation: AQIData | null;
    onLocationSelect: (location: AQIData) => void;
    onOpenForecast: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    data,
    selectedLocation,
    onLocationSelect,
    onOpenForecast
}) => {
    // Tính toán thống kê
    const totalLocations = data.length;
    const avgAQI = data.length > 0
        ? Math.round(data.reduce((sum, item) => sum + (item.AQI_TOTAL || item.aqi || 0), 0) / data.length)
        : 0;
    const maxAQI = data.length > 0
        ? Math.max(...data.map(item => item.AQI_TOTAL || item.aqi || 0))
        : 0;

    // Sắp xếp dữ liệu theo AQI
    const sortedData = [...data].sort((a, b) => {
        const aqiA = a.AQI_TOTAL || a.aqi || 0;
        const aqiB = b.AQI_TOTAL || b.aqi || 0;
        return aqiB - aqiA;
    });

    const topLocations = sortedData.slice(0, 10);

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2>
                    <MapPin size={20} />
                    Điều khiển AQI
                </h2>
                <button className="sidebar-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            <div className="sidebar-content">
                {/* Stats Summary */}
                <div className="stats-summary">
                    <div className="stat-item">
                        <div className="stat-value">{totalLocations}</div>
                        <div className="stat-label">Điểm quan trắc</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value" style={{ color: getAQIColor(avgAQI) }}>{avgAQI}</div>
                        <div className="stat-label">AQI trung bình</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value" style={{ color: getAQIColor(maxAQI) }}>{maxAQI}</div>
                        <div className="stat-label">AQI cao nhất</div>
                    </div>
                </div>

                {/* Selected Location Details */}
                {selectedLocation && (
                    <div className="selected-location">
                        <h3>📍 Vị trí được chọn</h3>
                        <div className="location-card">
                            <div className="location-header">
                                <h4>{getDistrictName(selectedLocation.latitude, selectedLocation.longitude)}</h4>
                                <div
                                    className="aqi-badge"
                                    style={{
                                        backgroundColor: getAQIColor(selectedLocation.AQI_TOTAL || selectedLocation.aqi || 0),
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {Math.round(selectedLocation.AQI_TOTAL || selectedLocation.aqi || 0)} - {getAQILabel(selectedLocation.AQI_TOTAL || selectedLocation.aqi || 0)}
                                </div>
                            </div>

                            <div className="location-metrics">
                                <div className="metric">
                                    <span>PM2.5:</span>
                                    <span>{selectedLocation.pm2_5?.toFixed(1) || 'N/A'} µg/m³</span>
                                </div>
                                <div className="metric">
                                    <span>PM10:</span>
                                    <span>{selectedLocation.pm10?.toFixed(1) || 'N/A'} µg/m³</span>
                                </div>
                                <div className="metric">
                                    <span>Nhiệt độ:</span>
                                    <span>{selectedLocation.temperature_2m?.toFixed(1) || 'N/A'}°C</span>
                                </div>
                                <div className="metric">
                                    <span>Độ ẩm:</span>
                                    <span>{selectedLocation.relative_humidity_2m?.toFixed(1) || 'N/A'}%</span>
                                </div>
                            </div>

                            <button
                                className="forecast-button"
                                onClick={onOpenForecast}
                                style={{
                                    width: '100%',
                                    padding: '8px 16px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    marginTop: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <TrendingUp size={16} />
                                Xem dự báo chi tiết
                            </button>
                        </div>
                    </div>
                )}

                {/* Top Locations */}
                <div className="ranking-list">
                    <h3>🏆 Top 10 AQI cao nhất</h3>
                    <div className="ranking-items">
                        {topLocations.map((location, index) => {
                            const aqi = location.AQI_TOTAL || location.aqi || 0;
                            return (
                                <div
                                    key={`${location.latitude}_${location.longitude}`}
                                    className="ranking-item"
                                    onClick={() => onLocationSelect(location)}
                                    style={{
                                        background: selectedLocation === location ? '#f0f8ff' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div className="ranking-rank">
                                        <div className="rank-number">{index + 1}</div>
                                        <div className="district-info">
                                            <h4>{getDistrictName(location.latitude, location.longitude)}</h4>
                                            {/* <p>Lat: {location.latitude.toFixed(3)}, Lng: {location.longitude.toFixed(3)}</p> */}
                                        </div>
                                    </div>
                                    <div className="aqi-value">
                                        <div
                                            className="aqi-number"
                                            style={{ backgroundColor: getAQIColor(aqi) }}
                                        >
                                            {Math.round(aqi)}
                                        </div>
                                        <div className="aqi-label">{getAQILabel(aqi)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Air Quality Tips */}
                <div className="air-quality-tips">
                    <h3>💡 Lời khuyên về chất lượng không khí</h3>
                    <div className="tips-content">
                        <p>
                            {avgAQI <= 50 && "Chất lượng không khí tốt! Thích hợp cho mọi hoạt động ngoài trời."}
                            {avgAQI > 50 && avgAQI <= 100 && "Chất lượng không khí ở mức trung bình. Người nhạy cảm nên chú ý."}
                            {avgAQI > 100 && avgAQI <= 150 && "Chất lượng không khí kém. Người nhạy cảm nên hạn chế ra ngoài."}
                            {avgAQI > 150 && "Chất lượng không khí xấu. Nên hạn chế hoạt động ngoài trời."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
