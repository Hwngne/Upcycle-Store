import express from 'express';
import { getMyNotifications, markAllAsRead, getUnreadCount } from '../../controllers/mobile/notificationController.js';
import { protect } from '../../middlewares/authMiddleware.js'; 

const router = express.Router();

// 1. Lấy danh sách thông báo 
router.get('/', protect, getMyNotifications);
// 2. Lấy số thông báo chưa đọc
router.get('/unread-count', protect, getUnreadCount);

// 3. Đánh dấu tất cả là đã đọc 
router.put('/read-all', protect, markAllAsRead);

export default router;