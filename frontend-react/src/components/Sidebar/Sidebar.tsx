import React from 'react';
import { X, TrendingUp, MapPin, Clock, Thermometer, Droplets, Wind } from 'lucide-react';
import { AQIData } from '../../types/aqi';
import { getAQIColor, getAQILabel, getAQILevelInfo, getDistrictName } from '../../utils/aqi';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    data: AQIData[];
    selectedLocation: AQIData | null;
    onLocationSelect: (location: AQIData) => void;
    onOpenForecast?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    data,
    selectedLocation,
    onLocationSelect,
    onOpenForecast
}): JSX.Element | null => {

    // Hàm nhảy đến map khi click vào 3 ô thống kê
    const handleJumpToMap = () => {
        // Trigger để App.tsx biết cần focus vào map
        if (onLocationSelect && data.length > 0) {
            // Chọn điểm đầu tiên để focus
            onLocationSelect(data[0]);
        }
    };
    // Tính toán thống kê tổng quan
    const stats = React.useMemo(() => {
        if (data.length === 0) return { total: 0, avgAQI: 0, maxAQI: 0, minAQI: 0 };

        const aqiValues = data.map(loc => loc.AQI_TOTAL || loc.aqi || 0).filter(aqi => aqi > 0);
        if (aqiValues.length === 0) return { total: 0, avgAQI: 0, maxAQI: 0, minAQI: 0 };

        return {
            total: data.length,
            avgAQI: Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length),
            maxAQI: Math.max(...aqiValues),
            minAQI: Math.min(...aqiValues)
        };
    }, [data]);



    const formatTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            return date.toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="sidebar open">
            <div className="sidebar-header">
                <h2>
                    <TrendingUp size={20} />
                    Bảng thông tin AQI
                </h2>
                <button className="sidebar-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            <div className="sidebar-content">
                {/* Thống kê tổng quan - 3 ô đơn giản */}
                <div className="stats-summary">
                    {/* Ô 1: Trạm quan trắc */}
                    <div className="stat-item" onClick={() => handleJumpToMap()}>
                        <div className="stat-value">
                            {stats.total}
                        </div>
                        <div className="stat-label">
                            Trạm quan trắc
                        </div>
                    </div>

                    {/* Ô 2: AQI trung bình */}
                    <div className="stat-item" onClick={() => handleJumpToMap()}>
                        <div className="stat-value">
                            {Math.round(stats.avgAQI) || '--'}
                        </div>
                        <div className="stat-label">
                            AQI trung bình
                        </div>
                    </div>

                    {/* Ô 3: AQI cao nhất */}
                    <div className="stat-item" onClick={() => handleJumpToMap()}>
                        <div className="stat-value">
                            {Math.round(stats.maxAQI) || '--'}
                        </div>
                        <div className="stat-label">
                            AQI cao nhất
                        </div>
                    </div>
                </div>

                {/* Thông tin chi tiết nếu có location được chọn */}
                {selectedLocation && (
                    <div className="selected-location-info" style={{ marginBottom: '2rem' }}>
                        <h3 style={{
                            fontSize: '1.1rem',
                            marginBottom: '1rem',
                            color: '#2d3748',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <MapPin size={18} />
                            {getDistrictName(selectedLocation.latitude, selectedLocation.longitude)}
                        </h3>

                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                {Math.round(selectedLocation.AQI_TOTAL || selectedLocation.aqi || 0)}
                            </div>
                            <div style={{
                                textAlign: 'center',
                                fontSize: '1rem',
                                opacity: 0.9
                            }}>
                                {(() => {
                                    const aqiValue = selectedLocation.AQI_TOTAL || selectedLocation.aqi || 0;
                                    const label = getAQILabel(aqiValue);
                                    console.log(`🔍 Sidebar: AQI ${aqiValue} -> Label: ${label}`);
                                    return label;
                                })()}
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <Thermometer size={20} color="#e53e3e" />
                                <div style={{ fontSize: '0.875rem', color: '#4a5568', marginTop: '0.25rem' }}>
                                    {selectedLocation.temperature_2m?.toFixed(1) || 'N/A'}°C
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <Droplets size={20} color="#3182ce" />
                                <div style={{ fontSize: '0.875rem', color: '#4a5568', marginTop: '0.25rem' }}>
                                    {selectedLocation.relative_humidity_2m?.toFixed(1) || 'N/A'}%
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <Wind size={20} color="#38a169" />
                                <div style={{ fontSize: '0.875rem', color: '#4a5568', marginTop: '0.25rem' }}>
                                    {selectedLocation.wind_speed_10m?.toFixed(1) || 'N/A'} m/s
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <Clock size={20} color="#d69e2e" />
                                <div style={{ fontSize: '0.875rem', color: '#4a5568', marginTop: '0.25rem' }}>
                                    {formatTime(selectedLocation.time)}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: '#f0fff4',
                            border: '1px solid #9ae6b4',
                            borderRadius: '8px',
                            padding: '1rem',
                            fontSize: '0.875rem',
                            color: '#22543d'
                        }}>
                            <strong>💡 Lời khuyên:</strong> {(() => {
                                const aqiValue = selectedLocation.AQI_TOTAL || selectedLocation.aqi || 0;
                                const levelInfo = getAQILevelInfo(aqiValue);
                                console.log(`🔍 Sidebar: AQI ${aqiValue} -> Level Info:`, levelInfo);
                                return levelInfo.healthAdvice;
                            })()}
                        </div>

                        {/* Chi tiết Button - Mở trang dự báo */}
                        <button
                            onClick={onOpenForecast}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                width: '100%',
                                marginTop: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            📊 Dự báo
                        </button>
                    </div>
                )}

                {/* Danh sách tất cả 30 điểm quan trắc */}
                <div className="ranking-list">
                    <h3>
                        <TrendingUp size={18} />
                        Tất cả 30 Điểm quan trắc
                    </h3>

                    <div className="ranking-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {data.map((location, index) => {
                            const aqi = location.AQI_TOTAL || location.aqi || 0;
                            const color = getAQIColor(aqi);
                            const label = getAQILabel(aqi);

                            // Debug log cho mỗi location
                            if (index < 5) { // Chỉ log 5 location đầu tiên để tránh spam
                                console.log(`🔍 Ranking ${index + 1}: AQI ${aqi} -> Label: ${label}, Color: ${color}`);
                            }

                            return (
                                <div
                                    key={`${location.latitude}-${location.longitude}`}
                                    className="ranking-item"
                                    onClick={() => onLocationSelect(location)}
                                    style={{
                                        cursor: 'pointer',
                                        border: selectedLocation?.latitude === location.latitude &&
                                            selectedLocation?.longitude === location.longitude
                                            ? '2px solid #667eea' : '1px solid #e2e8f0',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: selectedLocation?.latitude === location.latitude &&
                                            selectedLocation?.longitude === location.longitude
                                            ? 'scale(1.02)' : 'scale(1)',
                                        boxShadow: selectedLocation?.latitude === location.latitude &&
                                            selectedLocation?.longitude === location.longitude
                                            ? '0 8px 25px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (e.currentTarget.style.transform !== 'scale(1.02)') {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (e.currentTarget.style.transform !== 'scale(1.02)') {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                        }
                                    }}
                                >
                                    <div className="ranking-rank">
                                        <div className="rank-number" style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div className="district-info">
                                            <h4 style={{
                                                margin: '0',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                color: '#2d3748'
                                            }}>
                                                {getDistrictName(location.latitude, location.longitude)}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="aqi-value">
                                        <div
                                            className="aqi-number"
                                            style={{
                                                backgroundColor: color,
                                                transition: 'all 0.3s ease',
                                                transform: 'scale(1)',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                                            }}
                                        >
                                            {Math.round(aqi)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>



                {/* Lời khuyên sức khỏe */}
                <div className="air-quality-tips">
                    <h3>
                        <TrendingUp size={16} />
                        Lời khuyên sức khỏe
                    </h3>
                    <div className="tips-content">
                        <p>
                            Dựa trên chỉ số AQI hiện tại, bạn nên:
                        </p>
                        <ul style={{
                            margin: '0.5rem 0',
                            paddingLeft: '1.5rem',
                            fontSize: '0.875rem'
                        }}>
                            <li>Kiểm tra AQI trước khi ra ngoài</li>
                            <li>Đeo khẩu trang khi AQI cao</li>
                            <li>Hạn chế hoạt động ngoài trời khi ô nhiễm</li>
                            <li>Giữ nhà cửa thông thoáng</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
