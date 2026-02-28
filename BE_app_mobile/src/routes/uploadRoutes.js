const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();

// 1. Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 2. Bộ lọc file (ĐÃ SỬA ĐỂ DỄ TÍNH HƠN)
function checkFileType(file, cb) {
  // 👇 LOG RA ĐỂ XEM FILE GỬI LÊN LÀ GÌ (DEBUG)
  console.log("📥 Đang kiểm tra file:", file.originalname);
  console.log("🔖 Mimetype nhận được:", file.mimetype);

  const filetypes = /jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
  
  // 1. Kiểm tra đuôi file (Quan trọng nhất)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // 2. Kiểm tra Mimetype (Cho phép thêm 'application/octet-stream' để fix lỗi Flutter)
  const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';

  // 👇 CHỈ CẦN ĐÚNG ĐUÔI FILE LÀ CHO QUA (Bỏ qua check mimetype chặt chẽ)
  if (extname) { 
    return cb(null, true);
  } else {
    console.log("❌ Từ chối file vì sai định dạng!");
    cb('Lỗi: Chỉ được upload file ảnh (jpg, jpeg, png, gif, webp)!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 3. API Upload
router.post('/', upload.single('image'), (req, res) => {
  if (req.file) {
    console.log("✅ Upload thành công:", req.file.path);
    // Trả về đường dẫn chuẩn (thay dấu \ thành / cho Windows)
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
  } else {
    res.status(400).send('Không có file nào được upload');
  }
});

module.exports = router;