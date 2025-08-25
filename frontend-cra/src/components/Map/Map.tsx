import React, { useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { AQIData } from '../../types/aqi';
import { getAQIColor, getAQILabel } from '../../utils/aqi';

interface MapProps {
  data: AQIData[];
  onLocationSelect: (location: AQIData) => void;
  selectedLocation: AQIData | null;
}

const Map = ({ data, onLocationSelect, selectedLocation }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Ensure Leaflet is loaded from CDN
    if (typeof window === 'undefined' || !(window as any).L) {
      console.error('Leaflet not loaded from CDN');
      return;
    }

    const L = (window as any).L;

    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('🗺️ VANILLA Map: Initializing...');

    // FIX LEAFLET ICONS - CRITICAL for React
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // EXACT SAME AS VANILLA VERSION
    const map = L.map(mapRef.current).setView([21.0285, 105.8542], 10);

    // SIMPLE tile layer - exactly like vanilla
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    console.log('🗺️ VANILLA Map: Tiles added');

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !data.length) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    console.log(`🗺️ VANILLA Map: Adding ${data.length} markers`);

    // Add new markers - with CUSTOM ICON
    data.forEach((location) => {
      const { latitude, longitude, location_name, AQI_TOTAL } = location;
      const aqi = AQI_TOTAL || 0;
      const color = getAQIColor(aqi);
      const label = getAQILabel(aqi);

      // Create custom divIcon with AQI value
      const customIcon = L.divIcon({
        html: `
          <div style="
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${aqi}
          </div>
        `,
        className: 'custom-aqi-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon })
        .bindPopup(`
          <div style="text-align: center; font-family: Inter;">
            <h3 style="margin: 0; color: #1f2937;">${location_name}</h3>
            <div style="font-size: 24px; font-weight: bold; color: ${color}; margin: 5px 0;">
              ${aqi}
            </div>
            <div style="color: #6b7280;">${label}</div>
          </div>
        `)
        .addTo(map);

      marker.on('click', () => {
        onLocationSelect(location);
      });

      markersRef.current.push(marker);
    });

    console.log('🗺️ VANILLA Map: Markers added successfully');
  }, [data, onLocationSelect]);

  return (
    <div className="map-container">
      <div id="map" ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '600px' }}></div>

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