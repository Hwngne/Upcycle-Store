import express from 'express';
import { 
  loginUser, 
  changePassword,
  getLeaderboard, 
  updateUserProfile, 
  addPoints, 
  dailyCheckIn,
  getUserProfile,
  getMyHistory,
  forgotPassword,
  resetPassword 
} from '../../controllers/mobile/userController.js';

import { protect } from '../../middlewares/authMiddleware.js'; 

const router = express.Router();

router.post('/login', loginUser);
router.get('/leaderboard', getLeaderboard); 

// --- CÁC ROUTE BẢO VỆ  ---
// Đổi mật khẩu
router.post('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword); 

// Profile (Lấy thông tin & Cập nhật)
router.route('/profile')
    .get(protect, getUserProfile)    
    .put(protect, updateUserProfile); 
router.get('/my', protect, getMyHistory);

// Điểm danh & Cộng điểm
router.post('/attendance', protect, dailyCheckIn); 
router.post('/add-points', protect, addPoints);

export default router;