import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Header from './components/Header/Header';
import Map from './components/Map/Map';
import Sidebar from './components/Sidebar/Sidebar';
import ForecastPage from './components/Forecast/ForecastPage';
import ChatbotPage from './components/Chatbot/ChatbotPage';
import LoadingOverlay from './components/common/LoadingOverlay';
import { aqiAPI } from './services/api';
import './App.css';
import { AQIData } from './types/aqi';

// Create a client
const queryClient = new QueryClient();

// Main App Component
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <MainApp />
            </Router>
        </QueryClientProvider>
    );
}

// Main App Logic
function MainApp() {
    const [aqiData, setAqiData] = useState<AQIData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<AQIData | null>(null);
    const [currentPage, setCurrentPage] = useState<'map' | 'forecast' | 'chatbot'>('map');
    const [lastUpdate, setLastUpdate] = useState<string>('');

    const navigate = useNavigate();

    // Load AQI data
    const loadAQIData = async () => {
        try {
            setLoading(true);
            setError(null);
            setAqiData([]); // Clear previous data first

            console.log('🔄 Loading fresh AQI data from BigQuery...');
            const response = await aqiAPI.getLatest();
            console.log('📡 API Response:', response);
            console.log('📊 Response type:', typeof response);
            console.log('📊 Response length:', response ? response.length : 'null/undefined');

            if (response && response.length > 0) {
                console.log('📊 AQI values in response:', response.map(d => d.aqi));
                setAqiData(response);
                console.log('✅ Real AQI data set successfully');
            } else {
                console.log('⚠️ No data received from API');
                setAqiData([]);
            }

            setLastUpdate(new Date().toISOString());
        } catch (err: any) {
            console.error('❌ Error loading AQI data:', err);
            setError('Không thể tải dữ liệu AQI thật từ BigQuery. Vui lòng kiểm tra kết nối.');

            // KHÔNG có fallback - chỉ hiển thị empty state
            setAqiData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadAQIData();
    }, []);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(loadAQIData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Listen for forecast navigation events from map
    useEffect(() => {
        const handleForecastEvent = (event: CustomEvent) => {
            console.log('📍 App: Received forecast event:', event.detail);
            const { location } = event.detail;
            if (location) {
                setSelectedLocation(location);
                setCurrentPage('forecast');
                navigate('/forecast');
            }
        };

        window.addEventListener('openForecast', handleForecastEvent as EventListener);

        return () => {
            window.removeEventListener('openForecast', handleForecastEvent as EventListener);
        };
    }, [navigate]);

    // Handle location selection
    const handleLocationSelect = (location: AQIData) => {
        setSelectedLocation(location);
        setSidebarOpen(true);
    };

    // Handle sidebar toggle
    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Handle page navigation (currently unused but kept for future use)
    // const handlePageChange = (page: 'map' | 'forecast' | 'chatbot') => {
    //     setCurrentPage(page);
    //     if (page === 'map') {
    //         navigate('/');
    //     } else {
    //         navigate(`/${page}`);
    //     }
    // };

    // Handle back to map
    const handleBackToMap = () => {
        setCurrentPage('map');
        navigate('/');
    };

    // Handle open chatbot
    const handleOpenChatbot = () => {
        setCurrentPage('chatbot');
        navigate('/chatbot');
    };

    // Handle open forecast
    const handleOpenForecast = () => {
        setCurrentPage('forecast');
        navigate('/forecast');
    };

    // Render current page
    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'forecast':
                return (
                    <ForecastPage
                        selectedLocation={selectedLocation}
                        onBack={handleBackToMap}
                    />
                );
            case 'chatbot':
                return (
                    <ChatbotPage
                        onBack={handleBackToMap}
                    />
                );
            default:
                return (
                    <div className="main-content">
                        <Map
                            data={aqiData}
                            onLocationSelect={handleLocationSelect}
                            selectedLocation={selectedLocation}
                        />

                        <Sidebar
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                            data={aqiData}
                            selectedLocation={selectedLocation}
                            onLocationSelect={handleLocationSelect}
                            onOpenForecast={handleOpenForecast}
                        />
                    </div>
                );
        }
    };

    if (loading && aqiData.length === 0) {
        return <LoadingOverlay message="Đang tải AirVXM Platform..." />;
    }

    return (
        <div className="app">
            <Header
                onRefresh={loadAQIData}
                onToggleSidebar={handleToggleSidebar}
                sidebarOpen={sidebarOpen}
                lastUpdate={lastUpdate}
                onOpenChatbot={handleOpenChatbot}
            />

            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={loadAQIData}>Thử lại</button>
                </div>
            )}

            {renderCurrentPage()}
        </div>
    );
}

export default App;
