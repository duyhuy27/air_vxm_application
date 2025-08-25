import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { RefreshCw } from 'lucide-react';
import type { AQIData } from '../../types/aqi';
import { getAQIColor, getAQILabel, getAQILevelInfo, getDistrictName } from '../../utils/aqi';

// Fix for default marker icons in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon issue in Vite
// Use any to bypass TypeScript issues with Leaflet in Vite
(L as any).Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Delete the _getIconUrl method to force using our custom paths
delete (L as any).Icon.Default.prototype._getIconUrl;

interface MapProps {
    data: AQIData[];
    onLocationSelect: (location: AQIData) => void;
    selectedLocation: AQIData | null;
}

const Map: React.FC<MapProps> = ({ data, onLocationSelect, selectedLocation }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const markerClusterGroupRef = useRef<any>(null);
    const heatmapLayerRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);
    const layerControlRef = useRef<any>(null);

    // State cho layer menu
    const [layerMenuOpen, setLayerMenuOpen] = useState(false);
    const [showMarkers, setShowMarkers] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(false);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Khởi tạo bản đồ
        const map = (L as any).map(mapRef.current).setView([21.0285, 105.8542], 10);
        mapInstanceRef.current = map;

        // Thêm tile layer (OpenStreetMap)
        (L as any).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Khởi tạo MarkerClusterGroup với cấu hình tùy chỉnh
        const markerClusterGroup = (L as any).markerClusterGroup({
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 50,
            iconCreateFunction: function (cluster: any) {
                const childCount = cluster.getChildCount();
                let className = 'marker-cluster-small';

                if (childCount < 10) {
                    className = 'marker-cluster-small';
                } else if (childCount < 20) {
                    className = 'marker-cluster-medium';
                } else {
                    className = 'marker-cluster-large';
                }

                return new (L as any).DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'marker-cluster ' + className,
                    iconSize: new (L as any).Point(40, 40)
                });
            }
        });

        markerClusterGroupRef.current = markerClusterGroup;

        // Tạo layer group cho markers
        const markersLayer = (L as any).layerGroup();
        markersLayerRef.current = markersLayer;
        markersLayer.addLayer(markerClusterGroup);
        map.addLayer(markersLayer);

        // Layer control được thay thế bằng custom menu
        // Không cần default Leaflet layer control nữa

        // Thêm AQI Legend
        const legend = (L as any).control({ position: 'bottomleft' });
        legend.onAdd = () => {
            const div = (L as any).DomUtil.create('div', 'aqi-legend');
            div.innerHTML = `
                <h3><i class="fas fa-palette"></i> Chỉ số AQI</h3>
                <div class="legend-items">
                    <div class="legend-item" data-level="good">
                        <span class="legend-emoji">😊</span>
                        <div class="legend-color good"></div>
                        <span>Tốt (0-50 AQI)</span>
                    </div>
                    <div class="legend-item" data-level="moderate">
                        <span class="legend-emoji">🙂</span>
                        <div class="legend-color moderate"></div>
                        <span>Trung bình (51-100 AQI)</span>
                    </div>
                    <div class="legend-item" data-level="unhealthy-sensitive">
                        <span class="legend-emoji">😐</span>
                        <div class="legend-color unhealthy-sensitive"></div>
                        <span>Kém (101-150 AQI)</span>
                    </div>
                    <div class="legend-item" data-level="unhealthy">
                        <span class="legend-emoji">😟</span>
                        <div class="legend-color unhealthy"></div>
                        <span>Xấu (151-200 AQI)</span>
                    </div>
                    <div class="legend-item" data-level="very-unhealthy">
                        <span class="legend-emoji">😩</span>
                        <div class="legend-color very-unhealthy"></div>
                        <span>Rất xấu (201-300 AQI)</span>
                    </div>
                    <div class="legend-item" data-level="hazardous">
                        <span class="legend-emoji">😷</span>
                        <div class="legend-color hazardous"></div>
                        <span>Nguy hại (>300 AQI)</span>
                    </div>
                </div>
            `;
            return div;
        };
        legend.addTo(map);

        // Cleanup function
        return () => {
            if (layerControlRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeControl(layerControlRef.current);
                layerControlRef.current = null;
            }
            if (heatmapLayerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
                heatmapLayerRef.current = null;
            }
            if (markersLayerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(markersLayerRef.current);
                markersLayerRef.current = null;
            }
            if (markerClusterGroupRef.current) {
                markerClusterGroupRef.current.clearLayers();
                markerClusterGroupRef.current = null;
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Tạo heatmap layer từ dữ liệu AQI
    const createHeatmapLayer = (data: AQIData[]) => {
        const heatmapData: [number, number, number][] = data.map(location => {
            const aqi = location.AQI_TOTAL || location.aqi || 0;
            // Normalize AQI value cho heatmap (0-1)
            const intensity = Math.min(aqi / 300, 1); // Max AQI ~300
            return [location.latitude, location.longitude, intensity];
        });

        // Tạo custom gradient theo màu AQI
        const gradient = {
            0.0: '#00FF00', // Tốt (Xanh lá)
            0.17: '#FFFF00', // Trung bình (Vàng) 
            0.33: '#FF8C00', // Kém (Cam)
            0.5: '#FF0000',  // Xấu (Đỏ)
            0.67: '#8B008B', // Rất xấu (Tím)
            1.0: '#800000'   // Nguy hại (Đỏ đậm)
        };

        const heatLayer = (L as any).heatLayer(heatmapData, {
            radius: 25,
            blur: 20,
            maxZoom: 17,
            max: 1.0,
            minOpacity: 0.3,
            gradient: gradient
        });

        return heatLayer;
    };

    // Cập nhật markers và heatmap khi data thay đổi
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        console.log('🗺️ Map: Updating markers with data:', data);

        // Xóa markers cũ khỏi cluster group
        if (markerClusterGroupRef.current) {
            markerClusterGroupRef.current.clearLayers();
        }
        markersRef.current = [];

        // Xóa heatmap cũ
        if (heatmapLayerRef.current && layerControlRef.current) {
            layerControlRef.current.removeLayer(heatmapLayerRef.current);
            if (mapInstanceRef.current.hasLayer(heatmapLayerRef.current)) {
                mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
            }
            heatmapLayerRef.current = null;
        }

        // Tạo markers mới
        data.forEach((location) => {
            const aqi = location.AQI_TOTAL || location.aqi || 0;
            const color = getAQIColor(aqi);
            const label = getAQILabel(aqi);
            const levelInfo = getAQILevelInfo(aqi);

            // Tạo custom icon cờ cắm theo màu AQI
            const icon = (L as any).divIcon({
                className: 'aqi-flag-marker',
                html: `
                    <div class="flag-container" style="--flag-color: ${color};">
                        <div class="flag-pole"></div>
                        <div class="flag-body">
                            <div class="flag-content">
                                <div class="flag-aqi">${Math.round(aqi)}</div>
                                <div class="flag-label">${label}</div>
                            </div>
                            <div class="flag-triangle"></div>
                        </div>
                        <div class="flag-shadow"></div>
                    </div>
                `,
                iconSize: [60, 70],
                iconAnchor: [30, 65],
                popupAnchor: [0, -65]
            });

            // Tạo marker với tooltip
            const marker = (L as any).marker([location.latitude, location.longitude], { icon });

            // Tooltip content đầy đủ với giao diện cũ
            const tooltipContent = `
                <div class="aqi-tooltip">
                    <div class="tooltip-header">
                        <h3 class="tooltip-title">${getDistrictName(location.latitude, location.longitude)}</h3>
                        <div class="tooltip-aqi">
                            <span class="aqi-value" style="color: ${color};">${Math.round(aqi)}</span>
                            <span class="aqi-status" style="color: ${color};">${label}</span>
                        </div>
                    </div>
                    
                    <div class="tooltip-metrics">
                        <div class="metric-grid">
                            <div class="metric-item">
                                <div class="metric-left">
                                    <span class="metric-icon">🌫️</span>
                                    <span class="metric-label">PM2.5</span>
                                </div>
                                <span class="metric-value">${location.pm2_5?.toFixed(1) || 'N/A'} µg/m³</span>
                            </div>
                            <div class="metric-item">
                                <div class="metric-left">
                                    <span class="metric-icon">💨</span>
                                    <span class="metric-label">PM10</span>
                                </div>
                                <span class="metric-value">${location.pm10?.toFixed(1) || 'N/A'} µg/m³</span>
                            </div>
                            <div class="metric-item">
                                <div class="metric-left">
                                    <span class="metric-icon">🌡️</span>
                                    <span class="metric-label">NHIỆT ĐỘ</span>
                                </div>
                                <span class="metric-value">${location.temperature_2m?.toFixed(1) || 'N/A'}°C</span>
                            </div>
                            <div class="metric-item">
                                <div class="metric-left">
                                    <span class="metric-icon">💧</span>
                                    <span class="metric-label">ĐỘ ẨM</span>
                                </div>
                                <span class="metric-value">${location.relative_humidity_2m?.toFixed(1) || 'N/A'}%</span>
                            </div>
                            <div class="metric-item">
                                <div class="metric-left">
                                    <span class="metric-icon">🌪️</span>
                                    <span class="metric-label">GIÓ</span>
                                </div>
                                <span class="metric-value">${location.wind_speed_10m?.toFixed(1) || 'N/A'} m/s</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tooltip-advice">
                        <span class="advice-icon">💡</span>
                        <span class="advice-text">${levelInfo.healthAdvice}</span>
                    </div>
                    
                    <button 
                        class="tooltip-button"
                        onclick="window.openForecastDetail('${location.latitude}_${location.longitude}')"
                    >
                        📊 Xem dự báo chi tiết
                    </button>
                </div>
            `;

            // Thử tooltip đơn giản với hover tự nhiên
            marker.bindTooltip(tooltipContent, {
                permanent: false,
                direction: 'top',
                offset: [0, -10],
                className: 'custom-tooltip',
                opacity: 1
            });

            // Sử dụng Leaflet built-in hover - đơn giản và ổn định
            // Không cần custom event listeners

            // Xử lý click marker - mở sidebar ngay lập tức
            marker.on('click', () => {
                console.log('🗺️ Map: Marker clicked for location:', location);
                // Trigger sidebar mở ngay lập tức
                onLocationSelect(location);
            });

            // Thêm marker vào cluster group
            if (markerClusterGroupRef.current) {
                markerClusterGroupRef.current.addLayer(marker);
            }

            markersRef.current.push(marker);
        });

        // Tạo heatmap layer mới
        if (data.length > 0) {
            const heatmap = createHeatmapLayer(data);
            heatmapLayerRef.current = heatmap;
            // Heatmap sẽ được quản lý bởi custom layer menu
        }

        // Fit bounds nếu có data
        if (data.length > 0 && markerClusterGroupRef.current) {
            const group = markerClusterGroupRef.current;
            if (group.getLayers().length > 0) {
                mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
            }
        }
    }, [data, onLocationSelect]);

    // Highlight selected location
    useEffect(() => {
        if (!mapInstanceRef.current || !selectedLocation) return;

        // Xóa highlight cũ
        markersRef.current.forEach((marker: any) => {
            const icon = marker.getIcon();
            const html = icon.options.html;
            if (typeof html === 'string' && html.includes('class="flag-container active"')) {
                const newIcon = (L as any).divIcon({
                    ...icon.options,
                    html: html.replace('class="flag-container active"', 'class="flag-container"')
                });
                marker.setIcon(newIcon);
            }
        });

        // Highlight location được chọn
        const selectedMarker = markersRef.current.find((marker: any) => {
            const pos = marker.getLatLng();
            return Math.abs(pos.lat - selectedLocation.latitude) < 0.001 &&
                Math.abs(pos.lng - selectedLocation.longitude) < 0.001;
        });

        if (selectedMarker) {
            const icon = selectedMarker.getIcon();
            const html = icon.options.html;
            if (typeof html === 'string') {
                const newIcon = (L as any).divIcon({
                    ...icon.options,
                    html: html.replace('class="flag-container"', 'class="flag-container active"')
                });
                selectedMarker.setIcon(newIcon);
            }

            // Pan to selected location
            mapInstanceRef.current.panTo([selectedLocation.latitude, selectedLocation.longitude]);
        }
    }, [selectedLocation]);

    // Quản lý hiển thị layers
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Toggle markers
        if (markerClusterGroupRef.current) {
            if (showMarkers) {
                if (!mapInstanceRef.current.hasLayer(markerClusterGroupRef.current)) {
                    mapInstanceRef.current.addLayer(markerClusterGroupRef.current);
                }
            } else {
                if (mapInstanceRef.current.hasLayer(markerClusterGroupRef.current)) {
                    mapInstanceRef.current.removeLayer(markerClusterGroupRef.current);
                }
            }
        }

        // Toggle heatmap
        if (heatmapLayerRef.current) {
            if (showHeatmap) {
                if (!mapInstanceRef.current.hasLayer(heatmapLayerRef.current)) {
                    mapInstanceRef.current.addLayer(heatmapLayerRef.current);
                }
            } else {
                if (mapInstanceRef.current.hasLayer(heatmapLayerRef.current)) {
                    mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
                }
            }
        }
    }, [showMarkers, showHeatmap]);

    // Thêm global functions để xử lý click từ tooltip
    useEffect(() => {
        (window as any).openForecastDetail = (locationId: string) => {
            console.log('🗺️ Map: Opening forecast detail for:', locationId);
            const [lat, lng] = locationId.split('_');
            const location = data.find(loc =>
                Math.abs(loc.latitude - parseFloat(lat)) < 0.001 &&
                Math.abs(loc.longitude - parseFloat(lng)) < 0.001
            );

            if (location) {
                console.log('🗺️ Map: Found location for forecast:', location);
                onLocationSelect(location);

                // Trigger the forecast page navigation
                const event = new CustomEvent('openForecast', {
                    detail: { location }
                });
                window.dispatchEvent(event);
            } else {
                console.log('🗺️ Map: Location not found for forecast');
            }
        };

        return () => {
            delete (window as any).openForecastDetail;
        };
    }, [data, onLocationSelect]);

    return (
        <div className="map-container">
            <div id="map" ref={mapRef}></div>

            <div className="map-controls">
                {/* Custom Layer Menu Button */}
                <button
                    className="btn-layer-menu"
                    onClick={() => setLayerMenuOpen(!layerMenuOpen)}
                    title="Lớp bản đồ"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z" />
                    </svg>
                </button>

                <button
                    className="btn-refresh"
                    onClick={() => window.location.reload()}
                    title="Làm mới bản đồ"
                >
                    <RefreshCw size={16} />
                    Làm mới
                </button>
            </div>

            {/* Custom Layer Menu Popup */}
            {layerMenuOpen && (
                <div className="layer-menu-popup">
                    <div className="layer-menu-header">
                        <h4>Lớp bản đồ</h4>
                        <button
                            className="layer-menu-close"
                            onClick={() => setLayerMenuOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="layer-menu-content">
                        <div className="layer-section">
                            <h5>Lớp hiển thị</h5>
                            <div className="layer-options">
                                <label className="layer-option">
                                    <input
                                        type="checkbox"
                                        checked={showMarkers}
                                        onChange={(e) => setShowMarkers(e.target.checked)}
                                    />
                                    <span className="layer-icon">📍</span>
                                    <span className="layer-label">Điểm Quan Trắc</span>
                                </label>

                                <label className="layer-option">
                                    <input
                                        type="checkbox"
                                        checked={showHeatmap}
                                        onChange={(e) => setShowHeatmap(e.target.checked)}
                                    />
                                    <span className="layer-icon">🌡️</span>
                                    <span className="layer-label">Bản Đồ Nhiệt</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay để đóng menu khi click ngoài */}
            {layerMenuOpen && (
                <div
                    className="layer-menu-overlay"
                    onClick={() => setLayerMenuOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Map;
