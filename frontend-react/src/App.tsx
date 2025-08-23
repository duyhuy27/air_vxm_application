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

const queryClient = new QueryClient();

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <MainApp />
            </Router>
        </QueryClientProvider>
    );
};

const MainApp: React.FC = () => {
    const [aqiData, setAqiData] = useState<AQIData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<AQIData | null>(null);
    const [currentPage, setCurrentPage] = useState<'map' | 'forecast' | 'chatbot'>('map');
    const [lastUpdate, setLastUpdate] = useState<string>('');

    const navigate = useNavigate();

    const loadAQIData = async () => {
        try {
            setLoading(true);
            setError(null);
            setAqiData([]);

            const response = await aqiAPI.getLatest();

            if (response && response.length > 0) {
                setAqiData(response);
            } else {
                setAqiData([]);
            }

            setLastUpdate(new Date().toISOString());
        } catch (err: any) {
            console.error('Error loading AQI data:', err);
            setError('Không thể tải dữ liệu AQI. Vui lòng kiểm tra kết nối.');
            setAqiData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAQIData();
    }, []);

    useEffect(() => {
        const interval = setInterval(loadAQIData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLocationSelect = (location: AQIData) => {
        setSelectedLocation(location);
    };

    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleBackToMap = () => {
        setCurrentPage('map');
        navigate('/');
    };

    const handleOpenChatbot = () => {
        setCurrentPage('chatbot');
        navigate('/chatbot');
    };

    const handleOpenForecast = () => {
        setCurrentPage('forecast');
        navigate('/forecast');
    };

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
};

export default App;
