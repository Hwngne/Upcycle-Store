const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getMessages, getConversations, markAsRead, uploadMessageImage } = require('../controllers/chatController'); // Nhớ import hàm mới
const { protect } = require('../middleware/authMiddleware');

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
module.exports = router;