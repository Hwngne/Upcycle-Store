import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../../config/cloudinary.js'; 

import { getMessages, getConversations, markAsRead, uploadMessageImage } from '../../controllers/mobile/chatController.js'; 
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// --- CẤU HÌNH MULTER ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vlu_eco_chat_images', // Phân loại thư mục trên mây cho dễ quản lý
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- ROUTES  ---
router.post('/upload-image', protect, upload.single('image'), uploadMessageImage);

router.get('/conversations/:userId', protect, getConversations);
router.get('/:senderId/:receiverId', protect, getMessages);
router.put('/mark-read', protect, markAsRead);

export default router;