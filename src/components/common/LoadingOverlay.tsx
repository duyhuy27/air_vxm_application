import React from 'react';

interface LoadingOverlayProps {
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    message = "Đang tải dữ liệu..."
}) => {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="spinner"></div>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
