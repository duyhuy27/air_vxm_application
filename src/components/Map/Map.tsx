import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { RefreshCw } from 'lucide-react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import type { AQIData } from '../../types/aqi';
import { getAQIColor, getAQILabel, getAQILevelInfo, getDistrictName } from '../../utils/aqi';
import { getHanoiDistrictsData } from './hanoiDistrictsData';

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
    const districtLayerRef = useRef<any>(null);

    // State cho layer menu
    const [layerMenuOpen, setLayerMenuOpen] = useState(false);
    const [showMarkers, setShowMarkers] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showDistricts, setShowDistricts] = useState(true);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Khởi tạo bản đồ
        const map = (L as any).map(mapRef.current).setView([21.0285, 105.8542], 10);
        mapInstanceRef.current = map;

        // Thêm tile layer (OpenStreetMap)
        (L as any).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Tạo pane riêng cho tooltip để tối ưu z-index và hiệu năng
        map.createPane('tooltipPane');
        map.getPane('tooltipPane')!.style.zIndex = '1100';
        map.getPane('tooltipPane')!.style.pointerEvents = 'auto';

        // Khởi tạo MarkerClusterGroup với cấu hình tùy chỉnh và tối ưu tooltip
        const markerClusterGroup = (L as any).markerClusterGroup({
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,  // Tránh xung đột với tooltip của marker
            zoomToBoundsOnClick: true,
            maxClusterRadius: 50,
            animate: true,              // Smooth animation khi cluster/uncluster
            animateAddingMarkers: false, // Tắt animation khi thêm marker để tooltip ổn định hơn
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
            if (districtLayerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(districtLayerRef.current);
                districtLayerRef.current = null;
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

    // Tính AQI trung bình cho một district dựa trên các marker trong vùng
    const calculateDistrictAQI = (districtCoords: number[][][][], data: AQIData[]) => {
        try {
            // Use the same unwrapping logic as in createDistrictLayer
            let coords = districtCoords;

            // Unwrap nested coordinates until we reach the actual coordinate array
            while (Array.isArray(coords) && coords.length === 1 && Array.isArray(coords[0])) {
                coords = coords[0];
            }

            // Now coords should be [[[lon, lat]]] or [[lon, lat]]
            let polygonCoords: number[][][];
            if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
                // Structure: [[[lon, lat]]] (MultiPolygon format)
                polygonCoords = coords as unknown as number[][][];
            } else if (Array.isArray(coords[0])) {
                // Structure: [[lon, lat]] (Polygon format) - wrap in array
                polygonCoords = [coords as unknown as number[][]];
            } else {
                console.warn('Invalid coordinates structure in calculateDistrictAQI');
                return 50; // Fallback AQI
            }

            const districtPolygon = polygon(polygonCoords);

            // Tìm tất cả marker nằm trong polygon này
            const markersInDistrict = data.filter(location => {
                const locationPoint = point([location.longitude, location.latitude]);
                return booleanPointInPolygon(locationPoint, districtPolygon);
            });

            if (markersInDistrict.length === 0) {
                return 50; // Default AQI nếu không có marker nào
            }

            // Tính AQI trung bình
            const totalAQI = markersInDistrict.reduce((sum, location) => {
                return sum + (location.AQI_TOTAL || location.aqi || 50);
            }, 0);

            return Math.round(totalAQI / markersInDistrict.length);
        } catch (error) {
            console.warn('Error calculating district AQI:', error);
            return 50; // Fallback AQI
        }
    };

    // Tạo màu cho district dựa trên AQI với dải màu chuyên nghiệp
    const getDistrictColor = (aqi: number) => {
        // Định nghĩa dải màu nhạt theo từng mức AQI
        if (aqi <= 50) {
            return 'rgba(34, 139, 34, 0.6)';      // Xanh lá nhạt - Good
        } else if (aqi <= 100) {
            return 'rgba(255, 215, 0, 0.6)';      // Vàng nhạt - Moderate  
        } else if (aqi <= 150) {
            return 'rgba(255, 140, 0, 0.6)';      // Cam nhạt - Unhealthy for Sensitive
        } else if (aqi <= 200) {
            return 'rgba(255, 69, 0, 0.6)';       // Đỏ cam - Unhealthy
        } else if (aqi <= 300) {
            return 'rgba(128, 0, 128, 0.6)';      // Tím nhạt - Very Unhealthy
        } else {
            return 'rgba(128, 0, 0, 0.6)';        // Đỏ đậm - Hazardous
        }
    };

    // Tạo màu border cho district (màu đậm hơn để nổi bật)
    const getDistrictBorderColor = (aqi: number) => {
        if (aqi <= 50) {
            return '#228B22';      // Xanh lá đậm
        } else if (aqi <= 100) {
            return '#FFD700';      // Vàng đậm
        } else if (aqi <= 150) {
            return '#FF8C00';      // Cam đậm
        } else if (aqi <= 200) {
            return '#FF4500';      // Đỏ cam đậm
        } else if (aqi <= 300) {
            return '#800080';      // Tím đậm
        } else {
            return '#800000';      // Đỏ đậm
        }
    };

    // Tạo district layer từ GeoJSON data
    const createDistrictLayer = async (data: AQIData[]) => {
        try {
            // Load Hanoi districts data with fallback
            const hanoiGeoData = await getHanoiDistrictsData();

            console.log('🗺️ Creating district layer with data:', hanoiGeoData);

            // Validate data structure
            if (!hanoiGeoData || !hanoiGeoData.level2s || !Array.isArray(hanoiGeoData.level2s)) {
                console.error('🗺️ Invalid districts data structure:', hanoiGeoData);
                return null;
            }

            if (hanoiGeoData.level2s.length === 0) {
                console.warn('🗺️ No districts data available');
                return null;
            }

            console.log('🗺️ Sample district coordinates structure:', hanoiGeoData.level2s[0]?.coordinates);

            // Convert dữ liệu về định dạng GeoJSON features với validation mạnh mẽ
            const geoJsonFeatures = {
                type: "FeatureCollection",
                features: hanoiGeoData.level2s
                    .filter((district: any) => {
                        // Validate district has valid coordinates
                        if (!district.coordinates || !Array.isArray(district.coordinates)) {
                            console.warn('District missing coordinates:', district.name);
                            return false;
                        }

                        // Handle deeply nested coordinate structures: [[[[[lon, lat]]]]] -> [[[lon, lat]]]
                        let coords = district.coordinates;

                        // Unwrap nested coordinates until we reach the actual coordinate array
                        while (Array.isArray(coords) && coords.length === 1 && Array.isArray(coords[0])) {
                            coords = coords[0];
                        }

                        // Now coords should be [[[lon, lat]]] or [[lon, lat]]
                        let firstRing;
                        if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
                            // Structure: [[[lon, lat]]] (MultiPolygon format)
                            firstRing = coords[0];
                        } else if (Array.isArray(coords[0])) {
                            // Structure: [[lon, lat]] (Polygon format)
                            firstRing = coords[0];
                        } else {
                            console.warn('District has invalid coordinate structure after unwrapping:', district.name);
                            return false;
                        }

                        // Check if first ring has at least 4 points (minimum for polygon)
                        if (!Array.isArray(firstRing) || firstRing.length < 4) {
                            console.warn('District coordinates ring too short:', district.name, firstRing?.length);
                            return false;
                        }

                        // Validate each coordinate is a valid [lon, lat] pair
                        const validCoords = firstRing.every((coord: any) =>
                            Array.isArray(coord) &&
                            coord.length === 2 &&
                            typeof coord[0] === 'number' &&
                            typeof coord[1] === 'number' &&
                            !isNaN(coord[0]) &&
                            !isNaN(coord[1])
                        );

                        if (!validCoords) {
                            console.warn('District has invalid coordinate format:', district.name);
                            return false;
                        }

                        return true;
                    })
                    .map((district: any) => {
                        const districtAQI = calculateDistrictAQI(district.coordinates, data);

                        // Ensure coordinates are properly structured for GeoJSON
                        let fixedCoordinates;
                        try {
                            // Use the same unwrapping logic as in the filter above
                            let coords = district.coordinates;

                            // Unwrap nested coordinates until we reach the actual coordinate array
                            while (Array.isArray(coords) && coords.length === 1 && Array.isArray(coords[0])) {
                                coords = coords[0];
                            }

                            // Now coords should be [[[lon, lat]]] or [[lon, lat]]
                            let firstRing;
                            if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
                                // Structure: [[[lon, lat]]] (MultiPolygon format)
                                firstRing = coords[0];
                            } else if (Array.isArray(coords[0])) {
                                // Structure: [[lon, lat]] (Polygon format)
                                firstRing = coords[0];
                            } else {
                                console.warn('Invalid coordinates structure for district:', district.name);
                                return null;
                            }

                            if (firstRing.length >= 4) {
                                // Ensure the polygon is closed (first and last points are the same)
                                const firstPoint = firstRing[0];
                                const lastPoint = firstRing[firstRing.length - 1];

                                if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
                                    // Close the polygon by adding the first point at the end
                                    fixedCoordinates = [
                                        [...firstRing, firstPoint]
                                    ];
                                } else {
                                    fixedCoordinates = [firstRing];
                                }
                            } else {
                                console.warn('District coordinates ring too short, skipping:', district.name);
                                return null;
                            }
                        } catch (error) {
                            console.warn('Error fixing coordinates for district:', district.name, error);
                            return null;
                        }

                        return {
                            type: "Feature",
                            properties: {
                                name: district.name,
                                level2_id: district.level2_id,
                                aqi: districtAQI
                            },
                            geometry: {
                                type: "Polygon",
                                coordinates: fixedCoordinates
                            }
                        };
                    })
                    .filter(Boolean) // Remove null features
            };

            console.log('🗺️ GeoJSON features created:', geoJsonFeatures);

            // Validate that we have valid features
            if (!geoJsonFeatures.features || geoJsonFeatures.features.length === 0) {
                console.warn('🗺️ No valid GeoJSON features created');
                return null;
            }

            // Tạo GeoJSON layer với error handling
            const districtLayer = (L as any).geoJSON(geoJsonFeatures, {
                style: (feature: any) => {
                    const aqi = feature.properties.aqi;
                    return {
                        fillColor: getDistrictColor(aqi),
                        weight: 1.5,                           // Đường viền mỏng hơn mặc định
                        opacity: 0.9,                          // Border rõ nét hơn
                        color: '#ffffff',                      // Border màu trắng trung tính
                        fillOpacity: 0.5,                      // Giảm opacity để thấy bản đồ nền
                        dashArray: null                        // Đường liền, không nét đứt
                    };
                },
                onEachFeature: (feature: any, layer: any) => {
                    const districtName = feature.properties.name;
                    const aqi = feature.properties.aqi;
                    const aqiLabel = getAQILabel(aqi);

                    // Tooltip chuyên nghiệp cho district
                    layer.bindTooltip(`
                    <div class="district-tooltip-content">
                        <div class="district-name">${districtName}</div>
                        <div class="district-aqi">
                            <span class="aqi-number" style="color: ${getDistrictBorderColor(aqi)};">${aqi}</span>
                            <span class="aqi-status">${aqiLabel}</span>
                        </div>
                        <div class="district-info">AQI Trung bình</div>
                    </div>
                `, {
                        permanent: false,
                        direction: 'top',
                        offset: [0, -5],
                        className: 'district-tooltip-modern',
                        opacity: 0.95
                    });

                    // Hover effects mượt mà và chuyên nghiệp
                    layer.on({
                        mouseover: (e: any) => {
                            const layer = e.target;
                            const aqi = layer.feature.properties.aqi;
                            layer.setStyle({
                                weight: 3,                          // Tăng độ dày border khi hover
                                opacity: 1,                         // Border rõ nét hoàn toàn
                                color: getDistrictBorderColor(aqi), // Đổi border thành màu AQI
                                fillOpacity: 0.7,                   // Tăng opacity để nổi bật
                                dashArray: null
                            });
                            layer.bringToFront();

                            // Đảm bảo markers vẫn ở trên
                            if (markerClusterGroupRef.current) {
                                markerClusterGroupRef.current.bringToFront();
                            }
                        },
                        mouseout: (e: any) => {
                            const layer = e.target;
                            layer.setStyle({
                                weight: 1.5,                        // Trở về độ dày mặc định
                                opacity: 0.9,                       // Trở về opacity mặc định
                                color: '#ffffff',                   // Trở về border trắng
                                fillOpacity: 0.5,                   // Trở về độ trong suốt mặc định
                                dashArray: null
                            });
                        },
                        click: (e: any) => {
                            const bounds = e.target.getBounds();
                            mapInstanceRef.current?.fitBounds(bounds, {
                                padding: [30, 30],
                                maxZoom: 13  // Giới hạn zoom để không quá gần
                            });
                        }
                    });
                }
            });

            return districtLayer;
        } catch (error) {
            console.error('🗺️ Error creating district layer:', error);
            return null;
        }
    };

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

        // Xóa district layer cũ
        if (districtLayerRef.current && mapInstanceRef.current) {
            if (mapInstanceRef.current.hasLayer(districtLayerRef.current)) {
                mapInstanceRef.current.removeLayer(districtLayerRef.current);
            }
            districtLayerRef.current = null;
        }

        // Tạo markers mới
        data.forEach((location) => {
            const aqi = location.AQI_TOTAL || location.aqi || 0;
            const color = getAQIColor(aqi);
            const label = getAQILabel(aqi);
            const levelInfo = getAQILevelInfo(aqi);

            // Tạo custom icon cờ cắm theo màu AQI với click area được mở rộng
            const icon = (L as any).divIcon({
                className: 'aqi-flag-marker',
                html: `
                    <div class="flag-container" style="--flag-color: ${color};">
                        <div class="flag-clickable-area"></div>
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
                iconSize: [80, 80],
                iconAnchor: [40, 75],
                popupAnchor: [0, -75]
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
                        <div class="advice-text">${levelInfo.healthAdvice}</div>
                    </div>
                </div>
            `;

            // Tooltip với cấu hình tối ưu chống nhấp nháy và hiệu năng cao
            marker.bindTooltip(tooltipContent, {
                permanent: false,       // Chỉ hiện khi hover
                direction: 'top',       // Ưu tiên hiển thị ở phía trên
                sticky: true,           // QUAN TRỌNG: Tooltip đi theo chuột, chống nhấp nháy
                offset: [0, -15],       // Đẩy tooltip lên cao hơn để không che marker
                className: 'custom-tooltip',
                opacity: 1,
                interactive: true,      // Cho phép tương tác với nội dung tooltip
                pane: 'tooltipPane'     // Sử dụng pane riêng để tối ưu z-index
            });

            // Sử dụng Leaflet built-in hover - đơn giản và ổn định
            // Không cần custom event listeners vì bindTooltip với sticky: true
            // đã xử lý hoàn toàn vấn đề nhấp nháy và UX mượt mà

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

        // Tạo district layer mới
        if (data.length > 0) {
            createDistrictLayer(data).then(districtLayer => {
                if (districtLayer) {
                    districtLayerRef.current = districtLayer;
                    console.log('✅ District layer created successfully');
                    // District layer sẽ được quản lý bởi custom layer menu
                } else {
                    console.log('ℹ️ District layer not available, continuing without it');
                }
            }).catch(error => {
                console.error('❌ Error creating district layer:', error);
                console.log('ℹ️ Map will continue without district boundaries');
                // Ensure district layer ref is null on error
                districtLayerRef.current = null;
            });
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

        // Toggle district layer
        if (districtLayerRef.current) {
            if (showDistricts) {
                if (!mapInstanceRef.current.hasLayer(districtLayerRef.current)) {
                    mapInstanceRef.current.addLayer(districtLayerRef.current);
                    // Đưa district layer xuống dưới markers
                    districtLayerRef.current.bringToBack();
                }
            } else {
                if (mapInstanceRef.current.hasLayer(districtLayerRef.current)) {
                    mapInstanceRef.current.removeLayer(districtLayerRef.current);
                }
            }
        }
    }, [showMarkers, showHeatmap, showDistricts]);

    // Global function cleanup - không còn cần thiết vì đã bỏ button

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

                                <label className="layer-option">
                                    <input
                                        type="checkbox"
                                        checked={showDistricts}
                                        onChange={(e) => setShowDistricts(e.target.checked)}
                                    />
                                    <span className="layer-icon">🗺️</span>
                                    <span className="layer-label">Vùng Hành Chính</span>
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
