import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Cấu hình Cloudinary 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dl4vyi8yx',
  api_key: process.env.CLOUDINARY_API_KEY || '182179978269322',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ebAyxGBQKKI57oihUAPViYm3O9k'
});

// 2. Cấu hình Storage cho App Mobile (Upload thẳng lên mây)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'club_app_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'], 
    resource_type: 'auto', 
  },
});

const uploadCloud = multer({ storage: storage });

// Xuất riêng cloudinary nếu Web Admin cần gọi trực tiếp
export { cloudinary }; 

// Xuất uploadCloud làm mặc định cho các Routes của Mobile dùng
export default uploadCloud;