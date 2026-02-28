const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getArticles, 
  getQuizzes, 
  claimArticlePoints, 
  claimQuizPoints,
  getVideos,
  claimVideoPoints,
  spinWheel
} = require('../controllers/earnController');

// Lấy danh sách (Cần token để xác thực user)
router.get('/articles', protect, getArticles);
router.get('/quizzes', protect, getQuizzes);
router.get('/videos', protect, getVideos);
router.post('/video/claim', protect, claimVideoPoints);
router.post('/spin', protect, spinWheel);
// Nhận thưởng
router.post('/article', protect, claimArticlePoints);
router.post('/quiz', protect, claimQuizPoints);


module.exports = router;