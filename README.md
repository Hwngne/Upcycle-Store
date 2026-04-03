# 🗑️ Hướng Dẫn Cài Đặt API Phân Loại Rác Thải (Waste Classification API)

Tài liệu này hướng dẫn chi tiết từng bước để bạn có thể cài đặt và chạy hệ thống phân loại rác thải bằng AI (Gemini) trên máy tính cá nhân hoặc máy chủ (Server), ngay cả khi bạn không rành về kỹ thuật.

---

## 📋 Mục lục
1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cài đặt môi trường](#2-cài-đặt-môi-trường)
3. [Cấu hình dự án](#3-cấu-hình-dự-án)
4. [Khởi chạy ứng dụng](#4-khởi-chạy-ứng-dụng)
5. [Hướng dẫn sử dụng API](#5-hướng-dẫn-sử-dụng-api)
6. [Quản lý ứng dụng lâu dài](#6-quản-lý-ứng-dụng-lâu-dài)

---

## 1. Yêu cầu hệ thống
- **Hệ điều hành**: Windows, Linux (Ubuntu/CentOS), hoặc macOS.
- **Python**: Phiên bản 3.9 trở lên.
- **Kết nối mạng**: Cần kết nối Internet để gọi API của Google Gemini.

---

## 2. Cài đặt môi trường

### Bước 2.1: Tải mã nguồn
Nếu bạn dùng Git, hãy chạy lệnh:
```bash
git clone <url-repo-cua-ban>
cd phanloairac
```
Nếu bạn tải file `.zip`, hãy giải nén và mở thư mục `phanloairac`.

### Bước 2.2: Cài đặt Python (Nếu chưa có)
- Tải tại: [python.org/downloads](https://python.org/downloads/)
- **Lưu ý**: Khi cài đặt trên Windows, hãy nhớ tích vào ô **"Add Python to PATH"**.

### Bước 2.3: Tạo môi trường ảo (Virtual Environment)
Môi trường ảo giúp dự án của bạn sạch sẽ và không gây xung đột với các ứng dụng khác.
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### Bước 2.4: Cài đặt thư viện cần thiết
Chạy lệnh sau để cài đặt các "bộ phận" cần thiết cho ứng dụng:
```bash
pip install -r requirements.txt
```

---

## 3. Cấu hình dự án

Bạn cần tạo một file tên là `.env` (file này đã được tôi cấu hình sẵn cho bạn trong thư mục). 

Mở file `.env` và điền thông tin:
```env
GEMINI_API_KEY=AIzaSy... (Khóa bí mật của Google)
API_KEY=NCKH_PHANMEM(Khóa bảo mật cho riêng API của bạn)
```

---

## 4. Khởi chạy ứng dụng

### Chạy thử nghiệm (Development)
Sử dụng chế độ này khi bạn đang chỉnh sửa mã nguồn:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- `--reload`: Tự động tải lại khi bạn lưu code.
- `--host 0.0.0.0`: Cho phép truy cập từ mạng ngoài (nếu server có IP công cộng).

### Chạy chính thức (Stable)
Sau khi cài đặt xong và muốn app chạy ổn định:
```bash
python main.py
```

---

## 5. Hướng dẫn sử dụng API

### Cách 1: Sử dụng tài liệu trực quan (Swagger UI)
Sau khi chạy app, hãy mở trình duyệt và truy cập:
👉 `http://localhost:8000/docs`

1. Nhấn vào nút **Authorize** (ổ khóa) góc trên bên phải.
2. Nhập `NCKH_PHANMEM` vào ô giá trị của `X-API-Key`.
3. Nhấn **Try it out** ở phần `/classify`.
4. Chọn file ảnh và nhấn **Execute**.

### 📋 Mẫu kết quả trả về (Example Response)
Khi phân loại thành công, API sẽ trả về dữ liệu như sau:
```json
{
  "success": true,
  "code": 200,
  "message": "Phân loại rác thải thành công",
  "data": {
    "label": "Rác tái chế",
    "item_name": "Chai nhựa rỗng",
    "material": "Nhựa PET (thân chai), Nhựa (nắp chai)",
    "is_recyclable": true,
    "is_organic": false,
    "classification_code": "recyclable",
    "disposal_advice": "Rửa sạch chai và nắp, sau đó bỏ vào thùng rác tái chế. Nên tháo rời nắp và chai nếu có thể."
  }
}
```

#### Ý nghĩa các trường dữ liệu (Field Descriptions):
- **`success`**: Trạng thái yêu cầu (`true` là thành công, `false` là thất bại).
- **`code`**: Mã phản hồi HTTP (ví dụ: 200, 403, 500).
- **`message`**: Thông báo phản hồi bằng tiếng Việt.
- **`data`**: Chứa thông tin chi tiết về rác thải:
    - **`label`**: Danh mục nhóm rác (Hữu cơ, Tái chế, Vô cơ...).
    - **`item_name`**: Tên sản phẩm được nhận diện.
    - **`material`**: Thông tin cụ thể về chất liệu (loại nhựa, kim loại...).
    - **`is_recyclable`**: Có thể tái chế hay không (`true`/`false`).
    - **`is_organic`**: Có phải rác hữu cơ không (`true`/`false`).
    - **`classification_code`**: Mã code định danh (`organic`, `recyclable`, `inorganic`, `hazardous`).
    - **`disposal_advice`**: Hướng dẫn cách xử lý rác phù hợp.

### Cách 2: Sử dụng Call (Lệnh cho dân lập trình)
```bash
curl -X 'POST' \
  'http://localhost:8000/classify' \
  -H 'X-API-Key: AI_ONEDELI_001' \
  -F 'file=@duong/dan/den/anh_cua_ban.jpg'
```

---

## 6. Quản lý ứng dụng lâu dài (Trên Server)

Để ứng dụng không bị tắt khi bạn đóng cửa sổ terminal, bạn nên dùng **PM2** (Yêu cầu cài đặt NodeJS):

1. **Cài đặt PM2**:
   ```bash
   npm install pm2 -g
   ```
2. **Khởi chạy API với PM2**:
   ```bash
   pm2 start "python main.py" --name waste-ai-api
   ```
3. **Xem trạng thái**: `pm2 status`
4. **Xem log (lỗi)**: `pm2 logs waste-ai-api`

---

## 🛠️ Khắc phục lỗi thường gặp
- **Lỗi 403**: Bạn chưa nhập hoặc nhập sai `X-API-Key` trong header.
- **Lỗi 500**: Có thể do ảnh không hợp lệ hoặc Google Gemini API gặp vấn đề.
- **Lỗi thiếu thư viện**: Chạy lại lệnh `pip install -r requirements.txt`.

---
*Chúc bạn triển khai thành công!* 🚀
