import os
import io
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_403_FORBIDDEN
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key_gemini = os.getenv("GEMINI_API_KEY")
if not api_key_gemini:
    print("Warning: GEMINI_API_KEY is not set in .env file.")
else:
    genai.configure(api_key=api_key_gemini)

# API Security Config
API_KEY = os.getenv("API_KEY", "WwasteClassifySecret2024")
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    else:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "code": 403,
                "message": "Không có quyền truy cập. API Key không hợp lệ.",
                "data": None
            }
        )

# System Instruction for Gemini
SYSTEM_INSTRUCTION = (
    "Bạn là một chuyên gia về phân loại rác thải. "
    "Nhiệm vụ của bạn là phân tích hình ảnh và cung cấp thông tin chính xác về loại rác thải đó. "
    "Đặc biệt đối với nhựa, bạn phải cố gắng xác định loại nhựa cụ thể (ví dụ: số 1 - PET, số 2 - HDPE, số 3 - PVC, số 4 - LDPE, số 5 - PP, số 6 - PS, số 7 - Others) nếu có thể quan sát thấy từ hình ảnh hoặc ký hiệu trên sản phảm. "
    "Bạn phải trả về kết quả dưới dạng JSON duy nhất, không có văn bản nào bên ngoài. "
    "Cấu trúc JSON bao gồm: "
    "- label: Tên loại rác (tiếng Việt, ví dụ: Rác hữu cơ, Rác vô cơ, Rác tái chế, Rác nguy hại). "
    "- item_name: Tên vật phẩm cụ thể (tiếng Việt). "
    "- material: Chất liệu cụ thể và chi tiết (ví dụ: Nhựa PET, Nhựa HDPE, Giấy, Kim loại nhôm, v.v.). "
    "- is_recyclable: Boolean (true nếu có thể tái chế, false nếu không). "
    "- is_organic: Boolean (true nếu là rác hữu cơ, false nếu không). "
    "- classification_code: Chuỗi ('organic', 'inorganic', 'recyclable', 'hazardous'). "
    "- disposal_advice: Lời khuyên xử lý rác (tiếng Việt, ngắn gọn)."
)

app = FastAPI(
    title="Waste Classification API",
    description="API to classify waste into categories using Gemini AI",
    version="1.2.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models with system instruction
model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=SYSTEM_INSTRUCTION
)

def standard_response(success: bool, code: int, message: str, data: Optional[Any] = None) -> Dict[str, Any]:
    """Helper to create a standard API response structure."""
    return {
        "success": success,
        "code": code,
        "message": message,
        "data": data
    }

@app.get("/")
async def root():
    return standard_response(True, 200, "Waste Classification API is running", {"version": "1.2.0"})

@app.post("/classify")
async def classify_waste(
    file: UploadFile = File(...),
    api_key: str = Depends(get_api_key)
):
    """
    Upload an image of waste to classify it into categories.
    (Requires X-API-Key in header)
    """
    if not file.content_type.startswith("image/"):
        return standard_response(False, 400, "File must be an image", {"filename": file.filename})

    try:
        # Read image content
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Generate content with Gemini - we only need to pass the image since instruction is in system_instruction
        response = model.generate_content(image)
        
        # Extract text response
        result_text = response.text.strip()
        
        # Strip potential markdown formatting if Gemini returns it
        if result_text.startswith("```json"):
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif result_text.startswith("```"):
            result_text = result_text.split("```")[1].split("```")[0].strip()

        try:
            classification_result = json.loads(result_text)
            return standard_response(True, 200, "Phân loại rác thải thành công", classification_result)
        except json.JSONDecodeError as je:
            print(f"JSON Decode Error: {je} - Original text: {result_text}")
            return standard_response(False, 500, "Lỗi phân tích kết quả từ AI", {"error": str(je)})

    except Exception as e:
        print(f"Error: {e}")
        return standard_response(False, 500, f"Lỗi xử lý hình ảnh: {str(e)}", None)

if __name__ == "__main__":
    import uvicorn
    # Use dynamic port from env if exists (for some deployment platforms)
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
