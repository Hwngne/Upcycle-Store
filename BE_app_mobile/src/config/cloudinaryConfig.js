const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;
const multer = require('multer');

// 1. Điền thông tin bạn lấy trên Dashboard vào đây
cloudinary.config({
  cloud_name: 'dl4vyi8yx',
  api_key: '182179978269322',
  api_secret: 'ebAyxGBQKKI57oihUAPViYm3O9k'
});

// 2. Cấu hình Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'club_app_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'], // Lưu ý: 'allowed_formats' (có underscore) thay vì 'allowedFormats' ở một số bản cũ
    resource_type: 'auto', // Để tự động nhận diện ảnh/video/tài liệu
  },
});

const uploadCloud = multer({ storage: storage });

module.exports = uploadCloud;