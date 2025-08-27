import React, { useState, useEffect } from 'react';
import { historyAPI } from '../../services/api';
import './AQIInsights.css';

interface AQIInsightsProps {
    locationName: string;
    visible: boolean; // Only show when in 7-day mode
}

interface InsightsData {
    location_name: string;
    max_aqi: number;
    max_aqi_date: string;
    min_aqi: number;
    min_aqi_date: string;
    good_or_moderate_days: number;
    total_days: number;
    trend: 'improving' | 'worsening' | 'stable' | 'no_data';
    first_3_avg: number;
    last_3_avg: number;
}

const AQIInsights: React.FC<AQIInsightsProps> = ({ locationName, visible }) => {
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible && locationName) {
            fetchInsights();
        }
    }, [locationName, visible]);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await historyAPI.getInsights(locationName);
            setInsights(data);

            // Trigger animations after data is loaded
            setTimeout(() => {
                const cards = document.querySelectorAll('.insight-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate');
                    }, index * 100);
                });
            }, 100);
        } catch (err: any) {
            console.error('Error fetching insights:', err);

            // More specific error messages
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                setError('Server đang xử lý, vui lòng đợi...');
            } else if (err.response?.status >= 500) {
                setError('Lỗi server, vui lòng thử lại sau');
            } else {
                setError('Không thể tải dữ liệu phân tích');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        };
        return date.toLocaleDateString('vi-VN', options);
    };

    const getTrendIcon = (trend: string): string => {
        switch (trend) {
            case 'improving': return '📈';
            case 'worsening': return '📉';
            case 'stable': return '➡️';
            default: return '❓';
        }
    };

    const getTrendText = (trend: string): string => {
        switch (trend) {
            case 'improving': return 'Đang cải thiện';
            case 'worsening': return 'Đang xấu đi';
            case 'stable': return 'Ổn định';
            default: return 'Chưa có dữ liệu';
        }
    };

    const getTrendClass = (trend: string): string => {
        switch (trend) {
            case 'improving': return 'trend-improving';
            case 'worsening': return 'trend-worsening';
            default: return 'trend-stable';
        }
    };

    if (!visible) {
        return null;
    }

    if (loading) {
        return (
            <div className="aqi-insights">
                <div className="insights-loading">
                    <div>⏳ Đang phân tích dữ liệu...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="aqi-insights">
                <div className="insights-error">
                    <div>❌ {error}</div>
                </div>
            </div>
        );
    }

    if (!insights) {
        return null;
    }

    const goodDaysPercentage = insights.total_days > 0
        ? (insights.good_or_moderate_days / insights.total_days) * 100
        : 0;

    return (
        <div className="aqi-insights">
            <div className="insights-header">
                <h3 className="insights-title">
                    🔍 Phân tích chuyên sâu
                </h3>
                <p className="insights-subtitle">
                    Dữ liệu từ {insights.total_days} ngày qua tại {insights.location_name}
                </p>
            </div>

            <div className="insights-grid">
                {/* Max AQI Card */}
                <div className="insight-card max-aqi">
                    <div className="insight-icon">🔴</div>
                    <h4 className="insight-title">AQI cao nhất</h4>
                    <div className="insight-value">{insights.max_aqi.toFixed(0)}</div>
                    <div className="insight-meta">
                        vào {formatDate(insights.max_aqi_date)}
                    </div>
                </div>

                {/* Min AQI Card */}
                <div className="insight-card min-aqi">
                    <div className="insight-icon">🟢</div>
                    <h4 className="insight-title">AQI thấp nhất</h4>
                    <div className="insight-value">{insights.min_aqi.toFixed(0)}</div>
                    <div className="insight-meta">
                        vào {formatDate(insights.min_aqi_date)}
                    </div>
                </div>

                {/* Good Days Card */}
                <div className="insight-card good-days">
                    <div className="insight-icon">😊</div>
                    <h4 className="insight-title">Ngày không khí tốt</h4>
                    <div className="insight-value">
                        {insights.good_or_moderate_days}/{insights.total_days}
                    </div>
                    <div className="insight-meta">
                        {goodDaysPercentage.toFixed(0)}% thời gian
                    </div>
                    <div className="insight-progress">
                        <div
                            className="insight-progress-bar"
                            style={{ width: `${goodDaysPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Trend Card */}
                <div className="insight-card trend">
                    <div className="insight-icon">{getTrendIcon(insights.trend)}</div>
                    <h4 className="insight-title">Xu hướng chung</h4>
                    <div className={`insight-value ${getTrendClass(insights.trend)}`}>
                        {getTrendText(insights.trend)}
                        <span className="trend-icon">
                            {insights.trend === 'improving' ? '↗️' :
                                insights.trend === 'worsening' ? '↘️' : '➡️'}
                        </span>
                    </div>
                    <div className="insight-meta">
                        {insights.first_3_avg.toFixed(1)} → {insights.last_3_avg.toFixed(1)} AQI
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AQIInsights;
