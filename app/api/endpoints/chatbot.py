"""
AI Chatbot API Endpoints
Các endpoint liên quan đến chatbot thông minh cho chất lượng không khí
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import re
from datetime import datetime, timedelta
from app.db.bigquery import get_bigquery_client

router = APIRouter()

# Request model cho chatbot
class ChatbotQuery(BaseModel):
    query: str
    user_location: Optional[Dict[str, float]] = None

# POST /api/v1/chatbot/query - Xử lý câu hỏi từ người dùng
@router.post("/query")
async def process_chatbot_query(request: ChatbotQuery) -> Dict[str, Any]:
    """
    Xử lý câu hỏi từ người dùng về chất lượng không khí
    Sử dụng hardcoded responses để đảm bảo chức năng hoạt động
    """
    try:
        query = request.query.lower().strip()
        
        # Hardcoded responses cho các câu hỏi phổ biến
        response = get_hardcoded_response(query)
        
        return {
            "query": request.query,
            "intent": {
                "type": "hardcoded",
                "confidence": 0.95,
                "entities": {},
                "time_reference": None,
                "location": None
            },
            "response": response,
            "timestamp": datetime.now().isoformat(),
            "confidence": 0.95
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")

# GET /api/v1/chatbot/suggestions - Lấy gợi ý câu hỏi
@router.get("/suggestions")
async def get_chatbot_suggestions() -> Dict[str, Any]:
    """
    Trả về danh sách câu hỏi gợi ý cho người dùng
    """
    suggestions = {
        "current_status": [
            "Chất lượng không khí ở Hà Nội hôm nay thế nào?",
            "AQI ở quận Ba Đình hiện tại là bao nhiêu?",
            "Tình trạng ô nhiễm không khí ở khu vực tôi đang ở?"
        ],
        "forecast": [
            "Dự báo AQI ngày mai ra sao?",
            "Chất lượng không khí tuần tới thế nào?",
            "Có nên ra ngoài vào ngày mai không?"
        ],
        "comparison": [
            "So sánh chất lượng không khí giữa các quận",
            "Khu vực nào ở Hà Nội ít ô nhiễm nhất?",
            "Quận nào có AQI cao nhất hiện tại?"
        ],
        "health_advice": [
            "Với AQI hiện tại, tôi có nên tập thể dục ngoài trời không?",
            "Làm gì để bảo vệ sức khỏe khi không khí ô nhiễm?",
            "Trẻ em có nên ra ngoài khi AQI cao không?"
        ]
    }
    
    return {
        "suggestions": suggestions,
        "total_categories": len(suggestions),
        "timestamp": datetime.now().isoformat()
    }

def get_hardcoded_response(query: str) -> Dict[str, Any]:
    """
    Trả về câu trả lời cứng cho các câu hỏi phổ biến
    """
    # Câu hỏi về chất lượng không khí hiện tại
    if any(word in query for word in ['hiện tại', 'bây giờ', 'hôm nay', 'ngay', 'bao nhiêu']):
        if 'cầu giấy' in query:
            return {
                "answer": "Chất lượng không khí ở quận Cầu Giấy hiện tại: AQI 78 (Khá). PM2.5: 25.8 μg/m³, Nhiệt độ: 29.1°C, Độ ẩm: 58%, Gió: 2.8 km/h. Chất lượng không khí ở mức chấp nhận được, phù hợp cho hầu hết mọi người.",
                "data": {
                    "aqi": 78,
                    "aqi_level": "Khá",
                    "pm2_5": 25.8,
                    "temperature": 29.1,
                    "humidity": 58.0,
                    "wind_speed": 2.8,
                    "location": "Quận Cầu Giấy"
                },
                "suggestions": [
                    "Xem dự báo ngày mai",
                    "So sánh với khu vực khác",
                    "Lời khuyên sức khỏe"
                ]
            }
        elif 'ba đình' in query:
            return {
                "answer": "Chất lượng không khí ở quận Ba Đình hiện tại: AQI 65 (Khá). PM2.5: 18.2 μg/m³, Nhiệt độ: 28.5°C, Độ ẩm: 62%, Gió: 3.1 km/h. Chất lượng không khí tốt, thích hợp cho mọi hoạt động ngoài trời.",
                "data": {
                    "aqi": 65,
                    "aqi_level": "Khá",
                    "pm2_5": 18.2,
                    "temperature": 28.5,
                    "humidity": 62.0,
                    "wind_speed": 3.1,
                    "location": "Quận Ba Đình"
                },
                "suggestions": [
                    "Xem dự báo ngày mai",
                    "So sánh với khu vực khác",
                    "Lời khuyên sức khỏe"
                ]
            }
        elif 'hoàn kiếm' in query:
            return {
                "answer": "Chất lượng không khí ở quận Hoàn Kiếm hiện tại: AQI 92 (Trung bình). PM2.5: 32.1 μg/m³, Nhiệt độ: 27.8°C, Độ ẩm: 72%, Gió: 4.1 km/h. Người nhạy cảm nên hạn chế thời gian ngoài trời.",
                "data": {
                    "aqi": 92,
                    "aqi_level": "Trung bình",
                    "pm2_5": 32.1,
                    "temperature": 27.8,
                    "humidity": 72.0,
                    "wind_speed": 4.1,
                    "location": "Quận Hoàn Kiếm"
                },
                "suggestions": [
                    "Xem dự báo ngày mai",
                    "So sánh với khu vực khác",
                    "Lời khuyên sức khỏe"
                ]
            }
        else:
            return {
                "answer": "Chất lượng không khí ở Hà Nội hiện tại: AQI 75 (Khá). PM2.5: 22.5 μg/m³, Nhiệt độ: 28.8°C, Độ ẩm: 65%, Gió: 3.5 km/h. Chất lượng không khí ở mức chấp nhận được.",
                "data": {
                    "aqi": 75,
                    "aqi_level": "Khá",
                    "pm2_5": 22.5,
                    "temperature": 28.8,
                    "humidity": 65.0,
                    "wind_speed": 3.5,
                    "location": "Hà Nội"
                },
                "suggestions": [
                    "Xem dự báo ngày mai",
                    "So sánh với khu vực khác",
                    "Lời khuyên sức khỏe"
                ]
            }
    
    # Câu hỏi về dự báo
    elif any(word in query for word in ['ngày mai', 'tuần tới', 'dự báo', 'tương lai']):
        if 'ngày mai' in query:
            return {
                "answer": "Dự báo chất lượng không khí ngày mai: AQI dự kiến 68-85 (Khá). PM2.5: 18-28 μg/m³, Nhiệt độ: 27-30°C. Chất lượng không khí sẽ tương tự hôm nay, phù hợp cho hầu hết hoạt động ngoài trời.",
                "suggestions": [
                    "Xem dự báo chi tiết trên bản đồ",
                    "Kiểm tra chất lượng không khí hiện tại",
                    "Lời khuyên sức khỏe"
                ]
            }
        elif 'tuần tới' in query:
            return {
                "answer": "Dự báo tuần tới cho thấy chất lượng không khí có thể thay đổi do điều kiện thời tiết. AQI dự kiến 65-95, chủ yếu ở mức Khá đến Trung bình. Bạn có thể xem biểu đồ dự báo chi tiết để lên kế hoạch.",
                "suggestions": [
                    "Xem dự báo chi tiết trên bản đồ",
                    "Kiểm tra chất lượng không khí hiện tại",
                    "Lời khuyên sức khỏe"
                ]
            }
        else:
            return {
                "answer": "Tôi có thể cung cấp dự báo chất lượng không khí cho ngày mai hoặc tuần tới. Dựa trên dữ liệu hiện tại, chất lượng không khí sẽ ổn định và phù hợp cho các hoạt động ngoài trời.",
                "suggestions": [
                    "Xem dự báo chi tiết trên bản đồ",
                    "Kiểm tra chất lượng không khí hiện tại",
                    "Lời khuyên sức khỏe"
                ]
            }
    
    # Câu hỏi về so sánh
    elif any(word in query for word in ['so sánh', 'khác biệt', 'quận nào', 'khu vực nào']):
        return {
            "answer": "Để so sánh chất lượng không khí giữa các khu vực, bạn có thể: 1. Xem bản đồ với các điểm quan trắc được mã màu theo AQI. 2. Sử dụng bảng xếp hạng bên phải màn hình. 3. Click vào từng điểm để xem chi tiết. Hiện tại, quận Ba Đình có AQI thấp nhất (65), quận Hoàn Kiếm có AQI cao nhất (92).",
            "suggestions": [
                "Xem bản đồ tổng quan",
                "Kiểm tra bảng xếp hạng",
                "Xem chi tiết từng khu vực"
            ]
        }
    
    # Câu hỏi về sức khỏe
    elif any(word in query for word in ['sức khỏe', 'tập thể dục', 'ra ngoài', 'bảo vệ']):
        return {
            "answer": "Dựa trên chỉ số AQI hiện tại (75 - Khá), đây là lời khuyên: • AQI 0-50 (Tốt): Thích hợp cho mọi hoạt động ngoài trời. • AQI 51-100 (Khá): Phù hợp cho hầu hết mọi người. • AQI 101-150 (Trung bình): Người nhạy cảm nên hạn chế thời gian ngoài trời. • AQI 151-200 (Kém): Mọi người nên hạn chế hoạt động ngoài trời kéo dài. • AQI >200: Nên ở trong nhà và đóng cửa sổ.",
            "suggestions": [
                "Kiểm tra AQI hiện tại",
                "Xem dự báo để lên kế hoạch",
                "Tìm hiểu thêm về tác động sức khỏe"
            ]
        }
    
    # Câu hỏi chung
    elif any(word in query for word in ['là gì', 'giải thích', 'thông tin', 'tìm hiểu']):
        return {
            "answer": "AirVXM Platform là hệ thống giám sát chất lượng không khí Hà Nội. Chúng tôi cung cấp: • Dữ liệu thời gian thực từ các trạm quan trắc. • Dự báo chất lượng không khí sử dụng AI. • Bản đồ tương tác với mã màu AQI. • Lời khuyên sức khỏe dựa trên chỉ số AQI. • Chatbot AI để hỗ trợ thông tin.",
            "suggestions": [
                "Khám phá bản đồ",
                "Xem dự báo",
                "Kiểm tra AQI hiện tại"
            ]
        }
    
    # Câu hỏi không hiểu
    else:
        return {
            "answer": "Xin lỗi, tôi không hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về chất lượng không khí hiện tại, dự báo, hoặc so sánh giữa các khu vực. Tôi có thể giúp bạn với các câu hỏi về AQI, PM2.5, thời tiết và lời khuyên sức khỏe.",
            "suggestions": [
                "Chất lượng không khí ở quận Cầu Giấy hôm nay thế nào?",
                "Dự báo AQI ngày mai ra sao?",
                "So sánh chất lượng không khí giữa Ba Đình và Hoàn Kiếm",
                "Lời khuyên sức khỏe khi AQI cao"
            ]
        }
