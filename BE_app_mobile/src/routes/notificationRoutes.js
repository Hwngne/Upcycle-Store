const express = require('express');
const router = express.Router();
const { getMyNotifications, markAllAsRead, getUnreadCount } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware'); 

// 1. Lấy danh sách thông báo 
router.get('/', protect, getMyNotifications);
// 2. Lấy số thông báo chưa đọc
router.get('/unread-count', protect, getUnreadCount);

// 3. Đánh dấu tất cả là đã đọc 
router.put('/read-all', protect, markAllAsRead);

module.exports = router;