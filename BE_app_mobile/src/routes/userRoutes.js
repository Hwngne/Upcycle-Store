const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  changePassword,
  getLeaderboard, 
  updateUserProfile, 
  addPoints, 
  dailyCheckIn,
  getUserProfile,
  getMyHistory 
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware'); 

router.post('/login', loginUser);
router.get('/leaderboard', getLeaderboard); 

// --- CÁC ROUTE BẢO VỆ  ---
// Đổi mật khẩu
router.post('/change-password', protect, changePassword); 

// Profile (Lấy thông tin & Cập nhật)
router.route('/profile')
    .get(protect, getUserProfile)    
    .put(protect, updateUserProfile); 
router.get('/my', protect, getMyHistory);

// Điểm danh & Cộng điểm
router.post('/attendance', protect, dailyCheckIn); 
router.post('/add-points', protect, addPoints);


module.exports = router;