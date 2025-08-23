import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Bot, Lightbulb } from 'lucide-react';
import { chatbotAPI } from '../../services/api';

interface ChatbotPageProps {
    onBack: () => void;
}

interface ChatMessage {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    suggestions?: string[];
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        // Load suggestions khi component mount
        loadSuggestions();

        // Thêm welcome message
        setMessages([
            {
                id: 'welcome',
                type: 'bot',
                content: 'Xin chào! Tôi là trợ lý AI của AirVXM Platform. Tôi có thể giúp bạn:',
                timestamp: new Date(),
                suggestions: [
                    'Chất lượng không khí ở quận Cầu Giấy hôm nay thế nào?',
                    'Dự báo AQI ngày mai ra sao?',
                    'So sánh chất lượng không khí giữa Ba Đình và Hoàn Kiếm',
                    'Lời khuyên sức khỏe khi AQI cao'
                ]
            }
        ]);
    }, []);

    const loadSuggestions = async () => {
        try {
            const response = await chatbotAPI.getSuggestions();
            if (response.suggestions) {
                const allSuggestions = [
                    ...response.suggestions.current_status || [],
                    ...response.suggestions.forecast || [],
                    ...response.suggestions.comparison || [],
                    ...response.suggestions.health_advice || []
                ];
                setSuggestions(allSuggestions.slice(0, 8)); // Lấy 8 suggestions đầu tiên
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
            // Fallback suggestions
            setSuggestions([
                'Chất lượng không khí ở quận Cầu Giấy hôm nay thế nào?',
                'Dự báo AQI ngày mai ra sao?',
                'So sánh chất lượng không khí giữa Ba Đình và Hoàn Kiếm',
                'Lời khuyên sức khỏe khi AQI cao'
            ]);
        }
    };

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: content.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        try {
            const response = await chatbotAPI.query({ query: content.trim() });

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: response.response.answer,
                timestamp: new Date(),
                suggestions: response.response.suggestions
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
                timestamp: new Date(),
                suggestions: [
                    'Chất lượng không khí ở quận Cầu Giấy hôm nay thế nào?',
                    'Dự báo AQI ngày mai ra sao?'
                ]
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8fafc'
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bot size={24} color="#667eea" />
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#2d3748' }}>
                        AI Chatbot
                    </h1>
                </div>
            </div>

            {/* Chat Container */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '800px',
                margin: '0 auto',
                width: '100%',
                padding: '1rem'
            }}>
                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {messages.map((message) => (
                        <div key={message.id} style={{
                            marginBottom: '1.5rem',
                            display: 'flex',
                            flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                            gap: '0.75rem'
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: message.type === 'user' ? '#667eea' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {message.type === 'user' ? (
                                    <span style={{ color: 'white', fontSize: '1.2rem' }}>👤</span>
                                ) : (
                                    <Bot size={20} color="#4a5568" />
                                )}
                            </div>

                            {/* Message Content */}
                            <div style={{
                                maxWidth: '70%',
                                background: message.type === 'user' ? '#667eea' : '#f7fafc',
                                color: message.type === 'user' ? 'white' : '#2d3748',
                                padding: '0.75rem 1rem',
                                borderRadius: '18px',
                                border: message.type === 'user' ? 'none' : '1px solid #e2e8f0'
                            }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    {message.content}
                                </div>

                                <div style={{
                                    fontSize: '0.75rem',
                                    opacity: 0.7,
                                    textAlign: message.type === 'user' ? 'right' : 'left'
                                }}>
                                    {formatTime(message.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Bot size={20} color="#4a5568" />
                            </div>

                            <div style={{
                                background: '#f7fafc',
                                padding: '0.75rem 1rem',
                                borderRadius: '18px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                                    Đang xử lý...
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                            color: '#4a5568',
                            fontSize: '0.875rem'
                        }}>
                            <Lightbulb size={16} />
                            Gợi ý câu hỏi:
                        </div>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }}>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    style={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '20px',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem',
                                        color: '#4a5568',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f7fafc';
                                        e.currentTarget.style.borderColor = '#667eea';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    gap: '0.75rem',
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Nhập câu hỏi của bạn về chất lượng không khí..."
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#667eea';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                        }}
                    />

                    <button
                        type="submit"
                        disabled={!inputValue.trim() || loading}
                        style={{
                            background: inputValue.trim() && !loading ? '#667eea' : '#cbd5e0',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            cursor: inputValue.trim() && !loading ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'background 0.2s ease'
                        }}
                    >
                        <Send size={16} />
                        Gửi
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatbotPage;

