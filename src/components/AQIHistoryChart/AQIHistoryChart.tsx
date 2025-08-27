import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { historyAPI } from '../../services/api';
import { getAQIColor, getAQILabel } from '../../utils/aqi';
import './AQIHistoryChart.css';

interface AQIHistoryChartProps {
    locationName: string;
}

type TimeFilter = '7days' | '24hours';

interface ChartDataPoint {
    time: string;
    aqi: number;
    formattedTime: string;
    aqiLevel: string;
}

const AQIHistoryChart: React.FC<AQIHistoryChartProps> = ({ locationName }) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('7days');
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<any>(null);

    // Fetch data when component mounts or filters change
    useEffect(() => {
        if (locationName) {
            fetchHistoryData();
            fetchSummaryData();
        }
    }, [locationName, timeFilter]);

    const fetchHistoryData = async () => {
        setLoading(true);
        setError(null);

        try {
            let data: any[] = [];

            if (timeFilter === '7days') {
                data = await historyAPI.getDaily(locationName, 7);
            } else {
                data = await historyAPI.getHourly(locationName, 24);
            }

            console.log('📊 History data received:', data);

            // Validate data structure
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.log('⚠️ No history data available, showing empty chart');
                setChartData([]);
                setError('Không có dữ liệu lịch sử cho khu vực này.');
                return;
            }

            // Transform data for chart
            const transformedData: ChartDataPoint[] = data.map((item) => {
                let formattedTime: string;
                let aqi: number;

                if (timeFilter === '7days') {
                    // Daily data format
                    const date = new Date(item.report_date);
                    formattedTime = date.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit'
                    });
                    // Validate aqi value to prevent NaN
                    const rawAqi = item.avg_aqi;
                    aqi = (typeof rawAqi === 'number' && !isNaN(rawAqi)) ? rawAqi : 0;
                } else {
                    // Hourly data format
                    const date = new Date(item.time);
                    formattedTime = date.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    // Validate aqi value to prevent NaN
                    const rawAqi = item.AQI_TOTAL;
                    aqi = (typeof rawAqi === 'number' && !isNaN(rawAqi)) ? rawAqi : 0;
                }

                // Ensure aqi is a valid number
                if (typeof aqi !== 'number' || isNaN(aqi)) {
                    console.warn('Invalid AQI value detected:', aqi, 'for item:', item);
                    aqi = 0;
                }

                return {
                    time: timeFilter === '7days' ? item.report_date : item.time,
                    aqi: Math.round(aqi),
                    formattedTime,
                    aqiLevel: getAQILabel(aqi)
                };
            }).filter(item => {
                // Filter out invalid data points
                return item.aqi >= 0 && !isNaN(item.aqi) && item.formattedTime;
            });

            if (transformedData.length === 0) {
                console.log('⚠️ No valid data points after transformation, showing empty chart');
                setChartData([]);
                setError('Dữ liệu lịch sử không hợp lệ. Vui lòng thử lại sau.');
                return;
            }

            console.log('✅ Transformed chart data:', transformedData.length, 'valid points');
            setChartData(transformedData);
            setError(null); // Clear any previous errors
        } catch (err: any) {
            console.error('❌ Error fetching history data:', err);

            // Enhanced error handling
            let errorMessage = 'Không thể tải dữ liệu lịch sử. Vui lòng thử lại.';

            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Yêu cầu bị timeout. Vui lòng thử lại sau.';
            } else if (err.code === 'ERR_NETWORK') {
                errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
            } else if (err.response?.status === 500) {
                errorMessage = 'Lỗi máy chủ. Dữ liệu lịch sử tạm thời không khả dụng. Vui lòng thử lại sau.';
            } else if (err.response?.status === 404) {
                errorMessage = 'API lịch sử chưa có sẵn. Vui lòng thử lại sau.';
            } else if (err.response?.status >= 500) {
                errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
            } else if (err.response?.status >= 400) {
                errorMessage = 'Lỗi yêu cầu. Vui lòng kiểm tra thông tin.';
            }

            setError(errorMessage);
            setChartData([]);

            // Log additional error details for debugging
            console.log('📊 Chart error details:', {
                status: err.response?.status,
                message: err.message,
                data: err.response?.data
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSummaryData = async () => {
        try {
            const summaryData = await historyAPI.getSummary(locationName);
            setSummary(summaryData);
        } catch (err: any) {
            console.error('❌ Error fetching summary:', err);

            // More specific error messages
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                console.log('⏰ Server timeout, will retry later');
            } else if (err.response?.status >= 500) {
                console.log('🔥 Server error, will retry later');
                // Don't set error for summary - it's not critical for chart display
            } else if (err.response?.status === 404) {
                console.log('📡 API not available yet');
            }

            // Don't set error for summary - it's not critical
        }
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const aqi = data.aqi;
            const level = getAQILabel(aqi);
            const color = getAQIColor(aqi);

            return (
                <div className="chart-tooltip">
                    <div className="tooltip-header">
                        <span className="tooltip-time">{data.formattedTime}</span>
                    </div>
                    <div className="tooltip-content">
                        <div className="aqi-value" style={{ color }}>
                            <span className="aqi-number">{aqi}</span>
                            <span className="aqi-label">AQI</span>
                        </div>
                        <div className="aqi-level" style={{ color }}>
                            {level}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Get gradient color for area chart
    const getGradientStops = () => {
        if (!chartData.length) return [];

        const maxAqi = Math.max(...chartData.map(d => d.aqi));

        // Create gradient based on AQI levels
        if (maxAqi <= 50) {
            return [
                { offset: '0%', stopColor: '#4ade80', stopOpacity: 0.8 },
                { offset: '100%', stopColor: '#4ade80', stopOpacity: 0.1 }
            ];
        } else if (maxAqi <= 100) {
            return [
                { offset: '0%', stopColor: '#fbbf24', stopOpacity: 0.8 },
                { offset: '100%', stopColor: '#fbbf24', stopOpacity: 0.1 }
            ];
        } else if (maxAqi <= 150) {
            return [
                { offset: '0%', stopColor: '#f97316', stopOpacity: 0.8 },
                { offset: '100%', stopColor: '#f97316', stopOpacity: 0.1 }
            ];
        } else {
            return [
                { offset: '0%', stopColor: '#ef4444', stopOpacity: 0.8 },
                { offset: '100%', stopColor: '#ef4444', stopOpacity: 0.1 }
            ];
        }
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="chart-skeleton">
            <div className="skeleton-header">
                <div className="skeleton-title"></div>
                <div className="skeleton-filters"></div>
            </div>
            <div className="skeleton-chart">
                <div className="skeleton-bars">
                    {Array.from({ length: timeFilter === '7days' ? 7 : 12 }).map((_, i) => (
                        <div key={i} className="skeleton-bar" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="aqi-history-chart">
            <div className="chart-header">
                <div className="chart-title">
                    <h3>📊 Lịch sử dữ liệu AQI</h3>
                    {summary ? (
                        <div className="chart-subtitle">
                            Trung bình 30 ngày: <span className="summary-aqi">{summary.avg_aqi_30d || 'N/A'}</span>
                        </div>
                    ) : (
                        <div className="chart-subtitle">
                            <span className="summary-placeholder">Đang tải thống kê...</span>
                        </div>
                    )}
                </div>

                <div className="time-filter">
                    <button
                        className={`filter-btn ${timeFilter === '7days' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('7days')}
                        disabled={loading}
                    >
                        7 ngày qua
                    </button>
                    <button
                        className={`filter-btn ${timeFilter === '24hours' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('24hours')}
                        disabled={loading}
                    >
                        24 giờ qua
                    </button>
                </div>
            </div>

            <div className="chart-container">
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="chart-error">
                        <div className="error-icon">⚠️</div>
                        <div className="error-message">{error}</div>
                        <div className="error-details">
                            {error.includes('500') && (
                                <p className="error-note">
                                    💡 <strong>Lưu ý:</strong> Dữ liệu lịch sử tạm thời không khả dụng do lỗi máy chủ.
                                    Bạn vẫn có thể xem dữ liệu hiện tại và dự báo.
                                </p>
                            )}
                            {error.includes('timeout') && (
                                <p className="error-note">
                                    💡 <strong>Lưu ý:</strong> Yêu cầu bị timeout. Vui lòng kiểm tra kết nối mạng.
                                </p>
                            )}
                        </div>
                        <button className="retry-btn" onClick={fetchHistoryData}>
                            Thử lại
                        </button>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="chart-no-data">
                        <div className="no-data-icon">📈</div>
                        <div className="no-data-message">
                            Không có dữ liệu lịch sử cho {locationName}
                        </div>
                        <div className="no-data-subtitle">
                            Dữ liệu sẽ được cập nhật khi có thông tin mới
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                                    {getGradientStops().map((stop, index) => (
                                        <stop
                                            key={index}
                                            offset={stop.offset}
                                            stopColor={stop.stopColor}
                                            stopOpacity={stop.stopOpacity}
                                        />
                                    ))}
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                                opacity={0.5}
                            />

                            <XAxis
                                dataKey="formattedTime"
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickLine={{ stroke: '#cbd5e1' }}
                                axisLine={{ stroke: '#cbd5e1' }}
                            />

                            <YAxis
                                domain={['dataMin - 10', 'dataMax + 10']}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickLine={{ stroke: '#cbd5e1' }}
                                axisLine={{ stroke: '#cbd5e1' }}
                                label={{
                                    value: 'AQI',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { textAnchor: 'middle', fill: '#64748b', fontSize: '12px' }
                                }}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Area
                                type="monotone"
                                dataKey="aqi"
                                stroke="#667eea"
                                strokeWidth={3}
                                fill="url(#aqiGradient)"
                                dot={{ r: 4, fill: '#667eea', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2, fill: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {chartData.length > 0 && (
                <div className="chart-legend">
                    <div className="legend-item">
                        <div className="legend-color"></div>
                        <span>Chỉ số AQI {timeFilter === '7days' ? '(trung bình ngày)' : '(theo giờ)'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AQIHistoryChart;