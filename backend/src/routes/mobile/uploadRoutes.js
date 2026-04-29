import path from 'path';
import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../../config/cloudinary.js'; 

const router = express.Router();

// 1. Cấu hình nơi lưu trữ 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vlu_eco_mobile_uploads', 
  },
});

// 2. Bộ lọc file 
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
  
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (extname) { 
    return cb(null, true);
  } else {
    console.log(" Từ chối file vì sai định dạng!");
    cb('Lỗi: Chỉ được upload file ảnh (jpg, jpeg, png, gif, webp)!');
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 3. API Upload 
router.post('/', upload.single('image'), (req, res) => {
  if (req.file) {
    console.log(" Upload Cloudinary thành công:", req.file.path);
    // Trả thẳng link Cloudinary về cho App
    res.send(req.file.path);
  } else {
    res.status(400).send('Không có file nào được upload');
  }
});

export default router;