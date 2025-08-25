import React, { useState } from 'react';
import { ArrowLeft, Send, Bot } from 'lucide-react';

interface ChatbotPageProps {
    onBack: () => void;
}

interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            content: 'Xin chào! Tôi là trợ lý AI của AirVXM. Tôi có thể giúp bạn tìm hiểu về chất lượng không khí tại Hà Nội. Bạn có thể hỏi tôi về tình trạng AQI hiện tại, dự báo thời tiết, hoặc lời khuyên sức khỏe.',
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const suggestedQuestions = [
        "Chất lượng không khí Hà Nội hiện tại như thế nào?",
        "AQI ở quận nào cao nhất?",
        "Tôi có nên tập thể dục ngoài trời không?",
        "Dự báo chất lượng không khí ngày mai?",
        "PM2.5 là gì và tại sao nó nguy hiểm?",
        "Làm thế nào để bảo vệ sức khỏe khi AQI cao?"
    ];

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputValue,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Simulate API call với mock responses
        setTimeout(() => {
            const botResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: generateMockResponse(inputValue),
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botResponse]);
            setIsLoading(false);
        }, 1000);
    };

    const generateMockResponse = (question: string): string => {
        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.includes('chất lượng không khí') || lowerQuestion.includes('aqi')) {
            return 'Hiện tại, chất lượng không khí tại Hà Nội đang ở mức trung bình với AQI dao động từ 80-120. Các khu vực trung tâm thành phố có xu hướng cao hơn do mật độ giao thông. Tôi khuyến nghị bạn hạn chế hoạt động ngoài trời vào giờ cao điểm.';
        }

        if (lowerQuestion.includes('quận nào') || lowerQuestion.includes('cao nhất')) {
            return 'Theo dữ liệu mới nhất, các quận có AQI cao nhất hiện tại là Đống Đa (AQI: 145), Hai Bà Trưng (AQI: 138), và Hoàn Kiếm (AQI: 132). Điều này chủ yếu do mật độ giao thông và hoạt động công nghiệp.';
        }

        if (lowerQuestion.includes('tập thể dục') || lowerQuestion.includes('thể thao')) {
            return 'Với mức AQI hiện tại, tôi khuyên bạn nên tập thể dục trong nhà hoặc tại các khu vực có cây xanh nhiều như công viên. Nếu phải tập ngoài trời, hãy chọn thời gian sáng sớm trước 7h hoặc tối sau 19h khi chất lượng không khí tốt hơn.';
        }

        if (lowerQuestion.includes('dự báo') || lowerQuestion.includes('ngày mai')) {
            return 'Dự báo cho ngày mai, chất lượng không khí dự kiến sẽ cải thiện nhẹ với AQI giảm xuống mức 70-90 do có gió và không mưa. Tuy nhiên, vẫn nên thận trọng vào giờ cao điểm giao thông.';
        }

        if (lowerQuestion.includes('pm2.5') || lowerQuestion.includes('nguy hiểm')) {
            return 'PM2.5 là các hạt bụi siêu nhỏ có đường kính dưới 2.5 micromet, nhỏ hơn 30 lần so với sợi tóc. Chúng nguy hiểm vì có thể xâm nhập sâu vào phổi và gây ra các bệnh về hô hấp, tim mạch, và thậm chí ung thư phổi khi tiếp xúc lâu dài.';
        }

        if (lowerQuestion.includes('bảo vệ') || lowerQuestion.includes('sức khỏe')) {
            return 'Để bảo vệ sức khỏe khi AQI cao: 1) Đeo khẩu trang N95 khi ra ngoài, 2) Đóng cửa sổ và sử dụng máy lọc không khí trong nhà, 3) Hạn chế hoạt động ngoài trời, đặc biệt là tập thể dục, 4) Uống nhiều nước và ăn thực phẩm giàu chất chống oxy hóa.';
        }

        return 'Cảm ơn bạn đã hỏi! Tôi hiểu bạn quan tâm về chất lượng không khí. Để có thông tin chính xác nhất, tôi khuyên bạn kiểm tra dữ liệu realtime trên bản đồ AirVXM. Bạn có thể hỏi tôi về AQI, dự báo thời tiết, hoặc lời khuyên sức khỏe cụ thể hơn không?';
    };

    const handleSuggestionClick = (question: string) => {
        setInputValue(question);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chatbot-page" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: '#f8fafc'
        }}>
            {/* Header */}
            <div className="chatbot-header" style={{
                background: 'white',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                <button
                    className="back-button"
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Bot size={32} style={{ color: '#667eea' }} />
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', color: '#2d3748' }}>
                            Trợ lý AI AirVXM
                        </h1>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                            Hỏi tôi về chất lượng không khí Hà Nội
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages" style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            display: 'flex',
                            flexDirection: message.isUser ? 'row-reverse' : 'row',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: message.isUser
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {message.isUser ? '👤' : <Bot size={20} color="#666" />}
                        </div>
                        <div style={{
                            background: message.isUser ? '#667eea' : 'white',
                            color: message.isUser ? 'white' : '#2d3748',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            maxWidth: '70%',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                            {message.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Bot size={20} color="#666" />
                        </div>
                        <div style={{
                            background: 'white',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#cbd5e0',
                                    animation: 'pulse 1.5s ease-in-out infinite'
                                }}></div>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#cbd5e0',
                                    animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                                }}></div>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#cbd5e0',
                                    animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                                }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
                <div style={{
                    padding: '0 20px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <p style={{
                        width: '100%',
                        color: '#666',
                        fontSize: '14px',
                        marginBottom: '12px'
                    }}>
                        💡 Câu hỏi gợi ý:
                    </p>
                    {suggestedQuestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(question)}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: '#4a5568'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f7fafc';
                                e.currentTarget.style.borderColor = '#cbd5e0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            {question}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="chat-input" style={{
                background: 'white',
                padding: '20px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập câu hỏi của bạn về chất lượng không khí..."
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            minHeight: '44px',
                            maxHeight: '120px',
                            padding: '12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '22px',
                            fontSize: '14px',
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
                <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: inputValue.trim() && !isLoading
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : '#e2e8f0',
                        border: 'none',
                        color: 'white',
                        cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatbotPage;
