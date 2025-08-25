import React from 'react';
import { Menu, MessageCircle, Clock } from 'lucide-react';

interface HeaderProps {
    onRefresh: () => void;
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
    lastUpdate?: string;
    onOpenChatbot: () => void;
}

const Header: React.FC<HeaderProps> = ({
    onToggleSidebar,
    sidebarOpen,
    lastUpdate,
    onOpenChatbot
}) => {
    const formatUpdateTime = (timeString: string) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa cập nhật';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <div className="logo-icon">
                        <div className="logo-earth">
                            <div className="earth-layers">
                                <div className="earth-core"></div>
                                <div className="earth-mantle"></div>
                                <div className="earth-surface"></div>
                                <div className="earth-atmosphere"></div>
                            </div>
                            <div className="air-particles">
                                <div className="particle"></div>
                                <div className="particle"></div>
                                <div className="particle"></div>
                                <div className="particle"></div>
                                <div className="particle"></div>
                            </div>
                        </div>
                    </div>
                    <div className="logo-text">
                        <h1>AirVXM</h1>
                        <div className="logo-subtitle">Giám sát chất lượng không khí Hà Nội</div>
                    </div>
                </div>

                <div className="header-info">
                    {lastUpdate && (
                        <div className="update-time">
                            <Clock size={16} />
                            <span>{formatUpdateTime(lastUpdate)}</span>
                        </div>
                    )}

                    <button
                        className="btn-chatbot"
                        onClick={onOpenChatbot}
                        title="Mở trợ lý AI"
                    >
                        <MessageCircle size={18} />
                        Trợ lý AI
                    </button>

                    <button
                        className="btn-toggle"
                        onClick={onToggleSidebar}
                        title={sidebarOpen ? "Đóng bảng điều khiển" : "Mở bảng điều khiển"}
                        style={{
                            background: sidebarOpen
                                ? 'rgba(102, 126, 234, 0.2)'
                                : 'rgba(255, 255, 255, 0.2)',
                            color: sidebarOpen ? '#667eea' : '#666'
                        }}
                    >
                        <Menu size={18} />
                        {sidebarOpen ? 'Đóng' : 'Mở'} bảng điều khiển
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
