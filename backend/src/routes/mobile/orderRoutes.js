import express from 'express';
import { confirmOrder, getOrderHistory, cancelOrder } from '../../controllers/mobile/orderController.js';
import { protect } from '../../middlewares/authMiddleware.js'; 

const router = express.Router();

// Route gọi API xác nhận đơn hàng (Yêu cầu đăng nhập)
router.post('/confirm', protect, confirmOrder);
router.post('/cancel', protect, cancelOrder);

// Route gọi API lấy lịch sử giao dịch (Yêu cầu đăng nhập)
router.get('/history/:userId', protect, getOrderHistory);

export default router;