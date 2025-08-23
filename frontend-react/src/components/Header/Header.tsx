import React from 'react';
import { Menu, Clock, Bot } from 'lucide-react';

interface HeaderProps {
    onRefresh: () => void;
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
    lastUpdate?: string;
    onOpenChatbot?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    onRefresh,
    onToggleSidebar,
    sidebarOpen,
    lastUpdate,
    onOpenChatbot
}) => {
    const formatLastUpdate = (timeString?: string) => {
        if (!timeString) return 'Chưa có dữ liệu';

        try {
            const date = new Date(timeString);
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

            if (diffInMinutes < 1) return 'Vừa xong';
            if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
            if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
            return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
        } catch {
            return 'Không xác định';
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <div className="logo-icon">
                        🌬️
                        <div className="logo-pulse"></div>
                    </div>
                    <div className="logo-text">
                        <h1>AirVXM Platform</h1>
                        <div className="logo-subtitle">Giám sát chất lượng không khí Hà Nội</div>
                    </div>
                </div>

                <div className="header-info">
                    <div className="update-time">
                        <Clock size={16} />
                        <span>Cập nhật: {formatLastUpdate(lastUpdate)}</span>
                    </div>

                    {/* Chatbot Button */}
                    {onOpenChatbot && (
                        <button
                            className="btn-chatbot"
                            onClick={onOpenChatbot}
                            style={{
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                marginRight: '1rem',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#5a67d8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#667eea';
                            }}
                        >
                            <Bot size={16} />
                            AI Chatbot
                        </button>
                    )}

                    <button
                        className="btn-toggle"
                        onClick={onToggleSidebar}
                        aria-label={sidebarOpen ? 'Đóng sidebar' : 'Mở sidebar'}
                        style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '25px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        <Menu size={16} />
                        {sidebarOpen ? 'Đóng' : 'Mở'} Bảng thông tin
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
