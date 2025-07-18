// Global Variables
let map;
let aqiData = [];
let markerLayers = [];
let sidebarOpen = false;

// API Configuration - Auto detect environment
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:8000/api/v1'  // Local development
    : `${window.location.protocol}//${window.location.host}/api/v1`;  // Production (Railway)

// Hanoi Districts Mapping (Lat/Lng to District Names)
const hanoiDistricts = {
    // Ba Đình
    '21.0333_105.8214': 'Ba Đình',
    '21.0311_105.7924': 'Ba Đình',
    '21.0167_105.825': 'Ba Đình',

    // Hoàn Kiếm
    '21.0285_105.8542': 'Hoàn Kiếm',
    '21.0278_105.8525': 'Hoàn Kiếm',

    // Hai Bà Trưng
    '21.0075_105.8525': 'Hai Bà Trưng',
    '21.0144_105.8678': 'Hai Bà Trưng',

    // Đống Đa
    '21.0167_105.8083': 'Đống Đa',
    '21.0194_105.8089': 'Đống Đa',

    // Tây Hồ
    '21.0758_105.8217': 'Tây Hồ',
    '21.0833_105.8167': 'Tây Hồ',

    // Cầu Giấy
    '21.0333_105.7833': 'Cầu Giấy',
    '21.0378_105.7944': 'Cầu Giấy',

    // Thanh Xuân
    '21.0167_105.7833': 'Thanh Xuân',
    '20.9989_105.8092': 'Thanh Xuân',

    // Hoàng Mai
    '20.9742_105.8733': 'Hoàng Mai',
    '20.9833_105.8667': 'Hoàng Mai',

    // Long Biên
    '21.0458_105.8925': 'Long Biên',
    '21.0511_105.8864': 'Long Biên',

    // Nam Từ Liêm
    '21.0139_105.7656': 'Nam Từ Liêm',
    '21.0167_105.7500': 'Nam Từ Liêm',

    // Bắc Từ Liêm
    '21.0667_105.7333': 'Bắc Từ Liêm',
    '21.0833_105.7500': 'Bắc Từ Liêm',

    // Hà Đông
    '20.9717_105.7692': 'Hà Đông',
    '20.9667_105.7667': 'Hà Đông',

    // Sơn Tây
    '21.1333_105.5000': 'Sơn Tây',

    // Ba Vì
    '21.2500_105.4000': 'Ba Vì',

    // Phúc Thọ
    '21.1167_105.4167': 'Phúc Thọ',

    // Đan Phượng
    '21.0833_105.6167': 'Đan Phượng',

    // Hoài Đức
    '21.0000_105.6833': 'Hoài Đức',

    // Quốc Oai
    '21.0333_105.6000': 'Quốc Oai',

    // Thạch Thất
    '21.0167_105.5667': 'Thạch Thất',

    // Chương Mỹ
    '20.8667_105.7667': 'Chương Mỹ',

    // Thanh Oai
    '20.8500_105.8000': 'Thanh Oai',

    // Thường Tín
    '20.8333_105.8833': 'Thường Tín',

    // Phú Xuyên
    '20.7167_105.9000': 'Phú Xuyên',

    // Ứng Hòa
    '20.7167_105.7667': 'Ứng Hòa',

    // Mỹ Đức
    '20.6833_105.8000': 'Mỹ Đức'
};

// AQI Calculation Functions - theo chuẩn US EPA
function getAQILevel(aqi) {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy-sensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very-unhealthy';
    return 'hazardous';
}

function getAQIColor(aqi) {
    const level = getAQILevel(aqi);
    const colors = {
        'good': '#228B22',
        'moderate': '#9ACD32',
        'unhealthy-sensitive': '#FFD700',
        'unhealthy': '#FF8C00',
        'very-unhealthy': '#FF0000',
        'hazardous': '#8B0000'
    };
    return colors[level];
}

function getAQILabel(aqi) {
    const level = getAQILevel(aqi);
    const labels = {
        'good': 'Tốt',
        'moderate': 'Khá',
        'unhealthy-sensitive': 'Trung bình',
        'unhealthy': 'Kém',
        'very-unhealthy': 'Rất kém',
        'hazardous': 'Nguy hiểm'
    };
    return labels[level];
}

function getAQITips(aqi) {
    if (aqi <= 50) return 'Chất lượng không khí tốt. Thích hợp cho mọi hoạt động ngoài trời.';
    if (aqi <= 100) return 'Chất lượng không khí khá tốt. Phù hợp cho hầu hết mọi người.';
    if (aqi <= 150) return 'Người nhạy cảm nên hạn chế thời gian ở ngoài trời.';
    if (aqi <= 200) return 'Mọi người nên hạn chế hoạt động ngoài trời kéo dài.';
    if (aqi <= 300) return 'Mọi người nên tránh hoạt động ngoài trời. Đeo khẩu trang khi ra ngoài.';
    return 'Tình trạng khẩn cấp! Ở trong nhà và đóng cửa sổ.';
}

// District Name Mapping
function getDistrictName(lat, lng) {
    const key = `${lat}_${lng}`;
    return hanoiDistricts[key] || `Khu vực ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
}

// Map Initialization
function initMap() {
    map = L.map('map').setView([21.0285, 105.8542], 10);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
    }).addTo(map);

    // Custom map style
    map.getContainer().style.background = '#f8fafc';
}

// Create AQI Flag Marker
function createAQIMarker(station) {
    const lat = station.latitude;
    const lng = station.longitude;
    const aqi = station.aqi;
    const pm25 = station.pm2_5;
    const districtName = getDistrictName(lat, lng);

    // Create custom flag icon
    const flagIcon = L.divIcon({
        className: 'aqi-flag-marker',
        html: `
            <div class="flag-container">
                <div class="flag-pole"></div>
                <div class="flag" style="background-color: ${getAQIColor(aqi)}">
                    <span class="flag-text">${aqi}</span>
                </div>
                <div class="flag-shadow"></div>
            </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 45],
        popupAnchor: [0, -45]
    });

    const marker = L.marker([lat, lng], { icon: flagIcon }).addTo(map);

    // Add popup với thông tin cơ bản
    const popupContent = `
        <div class="popup-header">
            <i class="fas fa-flag"></i>
            ${districtName}
        </div>
        <div class="popup-aqi">
            <span>AQI:</span>
            <span class="popup-aqi-value" style="background: ${getAQIColor(aqi)}">${aqi}</span>
            <span>${getAQILabel(aqi)}</span>
        </div>
        <div class="popup-details">
            <div><strong>PM2.5:</strong> ${pm25.toFixed(1)} μg/m³</div>
            <div><strong>Nhiệt độ:</strong> ${station.temperature_2m.toFixed(1)}°C</div>
            <div><strong>Độ ẩm:</strong> ${station.relative_humidity_2m.toFixed(1)}%</div>
            <div><strong>Gió:</strong> ${station.wind_speed_10m.toFixed(1)} km/h</div>
            <div><strong>Cập nhật:</strong> ${new Date(station.time).toLocaleString('vi-VN')}</div>
        </div>
        <div class="popup-actions">
            <button onclick="showDetailModal(${lat}, ${lng})" class="btn-detail">
                <i class="fas fa-info-circle"></i> Chi tiết
            </button>
        </div>
    `;

    marker.bindPopup(popupContent);

    // Add click event to highlight in sidebar
    marker.on('click', function () {
        highlightDistrictInSidebar(districtName);
    });

    return marker;
}

// Show Detail Modal
async function showDetailModal(lat, lng) {
    try {
        const response = await fetch(`${API_BASE}/aqi/detail?lat=${lat}&lng=${lng}`);
        if (!response.ok) {
            throw new Error('Failed to fetch detail data');
        }

        const data = await response.json();

        const modalContent = `
            <div class="modal-overlay" onclick="closeDetailModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-flag"></i> ${getDistrictName(lat, lng)}</h3>
                        <button onclick="closeDetailModal()" class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <div class="detail-label">AQI</div>
                                <div class="detail-value aqi-badge" style="background: ${getAQIColor(data.aqi)}">${data.aqi}</div>
                                <div class="detail-status">${getAQILabel(data.aqi)}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">PM2.5</div>
                                <div class="detail-value">${data.pm2_5.toFixed(1)}</div>
                                <div class="detail-unit">μg/m³</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Nhiệt độ</div>
                                <div class="detail-value">${data.temperature_2m.toFixed(1)}</div>
                                <div class="detail-unit">°C</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Độ ẩm</div>
                                <div class="detail-value">${data.relative_humidity_2m.toFixed(1)}</div>
                                <div class="detail-unit">%</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Tốc độ gió</div>
                                <div class="detail-value">${data.wind_speed_10m.toFixed(1)}</div>
                                <div class="detail-unit">km/h</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Áp suất</div>
                                <div class="detail-value">${data.pressure_msl.toFixed(1)}</div>
                                <div class="detail-unit">hPa</div>
                            </div>
                        </div>
                        <div class="aqi-tips">
                            <i class="fas fa-lightbulb"></i>
                            <span>${getAQITips(data.aqi)}</span>
                        </div>
                        <div class="update-time">
                            <i class="fas fa-clock"></i>
                            Cập nhật: ${new Date(data.time).toLocaleString('vi-VN')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalContent);
    } catch (error) {
        console.error('Error fetching detail data:', error);
        alert('Không thể tải thông tin chi tiết. Vui lòng thử lại.');
    }
}

function closeDetailModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Highlight District in Sidebar
function highlightDistrictInSidebar(districtName) {
    if (!sidebarOpen) {
        toggleSidebar();
    }

    // Remove previous highlights
    document.querySelectorAll('.ranking-item').forEach(item => {
        item.classList.remove('highlighted');
    });

    // Highlight target district
    const targetItem = document.querySelector(`[data-district="${districtName}"]`);
    if (targetItem) {
        targetItem.classList.add('highlighted');
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Load and Display Data
async function loadAQIData() {
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/aqi/latest`);
        if (!response.ok) throw new Error('Failed to fetch data');

        aqiData = await response.json();

        // Clear existing layers
        markerLayers.forEach(layer => map.removeLayer(layer));
        markerLayers = [];

        // Create polygons for each station
        aqiData.forEach(station => {
            const marker = createAQIMarker(station);
            markerLayers.push(marker);
        });

        // Update sidebar with animation
        updateSidebar();
        updateLastUpdateTime();

        // Animate ranking items after they're rendered
        setTimeout(animateRankingItems, 300);

    } catch (error) {
        console.error('Error loading AQI data:', error);
        showError('Không thể tải dữ liệu AQI. Vui lòng thử lại.');
    } finally {
        showLoading(false);
    }
}

// Update Sidebar
function updateSidebar() {
    // Process data for ranking
    const districtData = {};

    aqiData.forEach(station => {
        const districtName = getDistrictName(station.latitude, station.longitude);
        const aqi = station.aqi;

        if (!districtData[districtName] || districtData[districtName].aqi < aqi) {
            districtData[districtName] = {
                name: districtName,
                aqi: aqi,
                pm25: station.pm2_5,
                temperature: station.temperature_2m,
                humidity: station.relative_humidity_2m,
                windSpeed: station.wind_speed_10m,
                time: station.time,
                lat: station.latitude,
                lng: station.longitude
            };
        }
    });

    // Convert to array and sort by AQI
    const sortedDistricts = Object.values(districtData).sort((a, b) => b.aqi - a.aqi);

    // Update stats
    const totalStations = aqiData.length;
    const avgAQI = Math.round(sortedDistricts.reduce((sum, d) => sum + d.aqi, 0) / sortedDistricts.length);
    const worstAQI = sortedDistricts[0]?.aqi || 0;

    // Animate stat updates
    animateStatUpdate('totalStations', totalStations);
    animateStatUpdate('avgAQI', avgAQI);
    animateStatUpdate('worstAQI', worstAQI);

    // Update ranking list
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '';

    sortedDistricts.forEach((district, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        rankingItem.setAttribute('data-district', district.name);

        rankingItem.innerHTML = `
            <div class="ranking-rank">
                <div class="rank-number">${index + 1}</div>
                <div class="district-info">
                    <h4>${district.name}</h4>
                    <p>AQI: ${district.aqi}</p>
                </div>
            </div>
            <div class="aqi-value">
                <div class="aqi-number" style="background: ${getAQIColor(district.aqi)}">${district.aqi}</div>
                <div class="aqi-label">${getAQILabel(district.aqi)}</div>
            </div>
        `;

        // Add click event to zoom to district
        rankingItem.addEventListener('click', () => {
            map.setView([district.lat, district.lng], 13);

            // Find and open popup for this district
            markerLayers.forEach(layer => {
                if (layer.getLatLng &&
                    Math.abs(layer.getLatLng().lat - district.lat) < 0.01 &&
                    Math.abs(layer.getLatLng().lng - district.lng) < 0.01) {
                    layer.openPopup();
                }
            });
        });

        rankingList.appendChild(rankingItem);
    });

    // Update air quality tips
    const aqiTips = document.getElementById('aqiTips');
    aqiTips.innerHTML = `<p>${getAQITips(avgAQI)}</p>`;
}

// Update Last Update Time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('lastUpdate').textContent = `Cập nhật lúc ${timeString}`;
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');

    sidebarOpen = !sidebarOpen;

    if (sidebarOpen) {
        sidebar.classList.add('open');
        toggleBtn.innerHTML = '<i class="fas fa-times"></i> Đóng';
    } else {
        sidebar.classList.remove('open');
        toggleBtn.innerHTML = '<i class="fas fa-list"></i> Bảng xếp hạng';
    }
}

// Loading State
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// Error Handling
function showError(message) {
    alert(message); // Simple error handling - could be improved with toast notifications
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    // Initialize map
    initMap();

    // Load initial data
    loadAQIData();

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebarClose').addEventListener('click', toggleSidebar);

    // Refresh button
    document.getElementById('refreshData').addEventListener('click', function () {
        this.querySelector('i').style.animation = 'spin 1s linear infinite';
        loadAQIData().finally(() => {
            this.querySelector('i').style.animation = '';
        });
    });

    // Auto refresh every 10 minutes
    setInterval(loadAQIData, 10 * 60 * 1000);
});

// Responsive handling
window.addEventListener('resize', function () {
    if (map) {
        map.invalidateSize();
    }
});

// Add highlighting style for ranking items
const style = document.createElement('style');
style.textContent = `
    .ranking-item.highlighted {
        background: rgba(102, 126, 234, 0.2) !important;
        border-color: #667eea !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2) !important;
    }
`;
document.head.appendChild(style);

// Animation Functions
function animateStatUpdate(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.add('updating');

    setTimeout(() => {
        element.textContent = newValue;
        element.classList.remove('updating');
    }, 400);
}

function showLoading(show = true) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const rankingList = document.getElementById('rankingList');
    const statsElements = document.querySelectorAll('.stat-value');

    if (show) {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            loadingOverlay.classList.add('show');
        }
        if (rankingList) rankingList.classList.add('loading');
        statsElements.forEach(el => el.classList.add('loading'));
    } else {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            loadingOverlay.classList.remove('show');
        }
        if (rankingList) rankingList.classList.remove('loading');
        statsElements.forEach(el => el.classList.remove('loading'));
    }
}

function animateRankingItems() {
    const items = document.querySelectorAll('.ranking-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';

        setTimeout(() => {
            item.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Hide loading overlay on page load
    showLoading(false);

    // Backup: Force hide loading after 10 seconds if still showing
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay && loadingOverlay.style.display !== 'none') {
            console.warn('Force hiding loading overlay after timeout');
            showLoading(false);
        }
    }, 10000);

    // Initialize map and load data
    initMap();
    loadAQIData();

    // Auto refresh every 5 minutes
    setInterval(loadAQIData, 5 * 60 * 1000);
}); 