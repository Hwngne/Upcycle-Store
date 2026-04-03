import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getMessages, getConversations, markAsRead, uploadMessageImage } from '../../controllers/mobile/chatController.js'; 
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// --- CẤU HÌNH MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/chat/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'chat_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- ROUTES ---
router.post('/upload-image', protect, upload.single('image'), uploadMessageImage);

router.get('/conversations/:userId', protect, getConversations);
router.get('/:senderId/:receiverId', protect, getMessages);
router.put('/mark-read', protect, markAsRead);

export default router;