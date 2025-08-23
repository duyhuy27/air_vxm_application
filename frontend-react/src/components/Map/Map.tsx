

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.heat';
import { RefreshCw } from 'lucide-react';
import { AQIData } from '../../types/aqi';
import { getAQIColor, getAQILabel, getAQILevelInfo } from '../../utils/aqi';
import '../../types/leaflet-heat.d.ts';

// Mapping tọa độ sang tên khu vực Hà Nội
const hanoiDistricts: { [key: string]: string } = {
  '21.0333_105.8214': 'Ba Đình',
  '21.0311_105.7924': 'Ba Đình',
  '21.0285_105.8542': 'Hoàn Kiếm',
  '21.0278_105.8525': 'Hoàn Kiếm',
  '21.0075_105.8525': 'Hai Bà Trưng',
  '21.0144_105.8678': 'Hai Bà Trưng',
  '21.0167_105.8083': 'Đống Đa',
  '21.0194_105.8089': 'Đống Đa',
  '21.0758_105.8217': 'Tây Hồ',
  '21.0833_105.8167': 'Tây Hồ',
  '21.0333_105.7833': 'Cầu Giấy',
  '21.0378_105.7944': 'Cầu Giấy',
  '21.0167_105.7833': 'Thanh Xuân',
  '20.9989_105.8092': 'Thanh Xuân',
  '20.9742_105.8733': 'Hoàng Mai',
  '20.9833_105.8667': 'Hoàng Mai',
  '21.0458_105.8925': 'Long Biên',
  '21.0511_105.8864': 'Long Biên',
  '21.0139_105.7656': 'Nam Từ Liêm',
  '21.0167_105.7500': 'Nam Từ Liêm',
  '21.0667_105.7333': 'Bắc Từ Liêm',
  '21.0833_105.7500': 'Bắc Từ Liêm',
  '20.9717_105.7692': 'Hà Đông',
  '20.9667_105.7667': 'Hà Đông',
  '21.1333_105.5000': 'Sơn Tây',
  '21.2500_105.4000': 'Ba Vì',
  '21.1167_105.4167': 'Phúc Thọ',
  '21.0833_105.6167': 'Đan Phượng',
  '21.0000_105.6833': 'Hoài Đức',
  '21.0333_105.6000': 'Quốc Oai',
  '21.0167_105.5667': 'Thạch Thất',
  '20.8667_105.7667': 'Chương Mỹ',
  '20.8500_105.8000': 'Thanh Oai',
  '20.8333_105.8833': 'Thường Tín',
  '20.7167_105.9000': 'Phú Xuyên',
  '20.7167_105.7667': 'Ứng Hòa',
  '20.6833_105.8000': 'Mỹ Đức'
};

// Hàm lấy tên khu vực từ tọa độ
const getDistrictName = (lat: number, lng: number): string => {
  const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  return hanoiDistricts[key] || `Khu vực ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
};

interface MapProps {
  data: AQIData[];
  onLocationSelect: (location: AQIData) => void;
  selectedLocation: AQIData | null;
}

const Map = ({ data, onLocationSelect, selectedLocation }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const heatmapLayerRef = useRef<L.HeatLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const layerControlRef = useRef<L.Control.Layers | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Khởi tạo bản đồ
    const map = L.map(mapRef.current).setView([21.0285, 105.8542], 10);
    mapInstanceRef.current = map;

    // Thêm tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

        return new L.DivIcon({
          html: '<div><span>' + childCount + '</span></div>',
          className: 'marker-cluster ' + className,
          iconSize: new L.Point(40, 40)
        });
      }
    });

    markerClusterGroupRef.current = markerClusterGroup;

    // Tạo layer group cho markers
    const markersLayer = L.layerGroup();
    markersLayerRef.current = markersLayer;
    markersLayer.addLayer(markerClusterGroup);
    map.addLayer(markersLayer);

    // Tạo layer control
    const baseMaps = {};
    const overlayMaps = {
      "📍 Điểm Quan Trắc": markersLayer
    };

    const layerControl = L.control.layers(baseMaps, overlayMaps, {
      position: 'topright',
      collapsed: true
    });
    layerControlRef.current = layerControl;
    layerControl.addTo(map);

    // Thêm click event để back về map ban đầu
    map.on('click', () => {
      console.log('🗺️ Map clicked - Back to main map view');
      // Có thể thêm logic để reset view hoặc focus vào map
    });

    // Thêm AQI Legend hoàn chỉnh từ frontend cũ
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
    console.log('🗺️ Map: Data length:', data.length);
    console.log('🗺️ Map: First item:', data[0]);

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
    data.forEach((location, index) => {
      console.log(`🗺️ Map: Processing location ${index}:`, location);
      console.log(`🗺️ Map: AQI_TOTAL: ${location.AQI_TOTAL}, aqi: ${location.aqi}`);

      const aqi = location.AQI_TOTAL || location.aqi || 0;
      const color = getAQIColor(aqi);
      const label = getAQILabel(aqi);
      const levelInfo = getAQILevelInfo(aqi);

      console.log(`🗺️ Map: Location ${index} - AQI: ${aqi}, Color: ${color}, Label: ${label}`);

      // Tạo custom icon cờ cắm theo màu AQI với anchor points chính xác
      const icon = L.divIcon({
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
        iconAnchor: [30, 65], // Đặt anchor point ở giữa bottom của flag
        popupAnchor: [0, -65]  // Tooltip sẽ xuất hiện ngay phía trên flag
      });

      // Tạo marker với tooltip và thêm vào cluster group
      const marker = L.marker([location.latitude, location.longitude], { icon });

      console.log(`🗺️ Map: Created marker for location ${index} at [${location.latitude}, ${location.longitude}]`);

      // Tạo tooltip content với design hiện đại
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
                  <span class="metric-label">Nhiệt độ</span>
                </div>
                <span class="metric-value">${location.temperature_2m?.toFixed(1) || 'N/A'}°C</span>
              </div>
              <div class="metric-item">
                <div class="metric-left">
                  <span class="metric-icon">💧</span>
                  <span class="metric-label">Độ ẩm</span>
                </div>
                <span class="metric-value">${location.relative_humidity_2m?.toFixed(1) || 'N/A'}%</span>
              </div>
              <div class="metric-item">
                <div class="metric-left">
                  <span class="metric-icon">🌪️</span>
                  <span class="metric-label">Gió</span>
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

      // Bind tooltip với cấu hình positioning chính xác
      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top', // Luôn hiển thị phía trên marker
        offset: [0, 0], // Không offset thêm, dùng popupAnchor từ icon
        className: 'custom-tooltip',
        opacity: 1,
        sticky: false, // Không sticky để tránh jumping
        interactive: true
      });

      // Xử lý click marker
      marker.on('click', () => {
        console.log('🗺️ Map: Marker clicked for location:', location);
        onLocationSelect(location);
      });

      // Thêm marker vào cluster group thay vì trực tiếp vào map
      if (markerClusterGroupRef.current) {
        markerClusterGroupRef.current.addLayer(marker);
      }

      markersRef.current.push(marker);
    });

    console.log(`🗺️ Map: Created ${markersRef.current.length} markers`);

    // Tạo heatmap layer mới
    if (data.length > 0) {
      const heatmap = createHeatmapLayer(data);
      heatmapLayerRef.current = heatmap;

      // Thêm heatmap vào layer control
      if (layerControlRef.current) {
        layerControlRef.current.addOverlay(heatmap, "🌡️ Bản Đồ Nhiệt");
        console.log('🗺️ Map: Added heatmap layer to control');
      }
    }

    // Fit bounds nếu có data
    if (data.length > 0 && markerClusterGroupRef.current) {
      // Sử dụng cluster group để fit bounds
      const group = markerClusterGroupRef.current;
      if (group.getLayers().length > 0) {
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
        console.log('🗺️ Map: Fitted bounds to cluster data');
      }
    }
  }, [data, onLocationSelect]);

  // Highlight selected location
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;

    // Xóa highlight cũ
    markersRef.current.forEach(marker => {
      const icon = marker.getIcon() as L.DivIcon;
      const html = icon.options.html;
      if (typeof html === 'string' && html.includes('class="flag-container active"')) {
        const newIcon = L.divIcon({
          ...icon.options,
          html: html.replace('class="flag-container active"', 'class="flag-container"')
        });
        marker.setIcon(newIcon);
      }
    });

    // Highlight location được chọn
    const selectedMarker = markersRef.current.find(marker => {
      const pos = marker.getLatLng();
      return Math.abs(pos.lat - selectedLocation.latitude) < 0.001 &&
        Math.abs(pos.lng - selectedLocation.longitude) < 0.001;
    });

    if (selectedMarker) {
      const icon = selectedMarker.getIcon() as L.DivIcon;
      const html = icon.options.html;
      if (typeof html === 'string') {
        const newIcon = L.divIcon({
          ...icon.options,
          html: html.replace('class="flag-container"', 'class="flag-container active"')
        });
        selectedMarker.setIcon(newIcon);
      }

      // Pan to selected location
      mapInstanceRef.current.panTo([selectedLocation.latitude, selectedLocation.longitude]);
    }
  }, [selectedLocation]);

  // Thêm global functions để xử lý click từ tooltip
  useEffect(() => {
    (window as any).selectLocation = (locationId: string) => {
      console.log('🗺️ Map: Global selectLocation called with:', locationId);
      const [lat, lng] = locationId.split('_');
      const location = data.find(loc =>
        loc.latitude.toFixed(3) === lat &&
        loc.longitude.toFixed(3) === lng
      );
      if (location) {
        console.log('🗺️ Map: Found location for popup click:', location);
        onLocationSelect(location);
      } else {
        console.log('🗺️ Map: Location not found for popup click');
      }
    };

    (window as any).openForecastDetail = (locationId: string) => {
      console.log('🗺️ Map: Opening forecast detail for:', locationId);
      const [lat, lng] = locationId.split('_');
      const location = data.find(loc =>
        Math.abs(loc.latitude - parseFloat(lat)) < 0.001 &&
        Math.abs(loc.longitude - parseFloat(lng)) < 0.001
      );

      if (location) {
        console.log('🗺️ Map: Found location for forecast:', location);
        // Trigger the location selection first
        onLocationSelect(location);

        // Then trigger the forecast page navigation
        // This will be handled by the parent App component
        const event = new CustomEvent('openForecast', {
          detail: { location }
        });
        window.dispatchEvent(event);
      } else {
        console.log('🗺️ Map: Location not found for forecast');
      }
    };

    return () => {
      delete (window as any).selectLocation;
      delete (window as any).openForecastDetail;
    };
  }, [data, onLocationSelect]);

  return (
    <div className="map-container">
      <div id="map" ref={mapRef}></div>

      <div className="map-controls">
        <button
          className="btn-refresh"
          onClick={() => window.location.reload()}
          title="Làm mới bản đồ"
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>
    </div>
  );
};

export default Map;
