import express from 'express';
import { protect } from '../../middlewares/authMiddleware.js';
import { 
  getArticles, 
  getQuizzes, 
  claimArticlePoints, 
  claimQuizPoints,
  getVideos,
  claimVideoPoints,
  spinWheel
} from '../../controllers/mobile/earnController.js';

const router = express.Router();

// Lấy danh sách (Cần token để xác thực user)
router.get('/articles', protect, getArticles);
router.get('/quizzes', protect, getQuizzes);
router.get('/videos', protect, getVideos);
router.post('/video/claim', protect, claimVideoPoints);
router.post('/spin', protect, spinWheel);
// Nhận thưởng
router.post('/article', protect, claimArticlePoints);
router.post('/quiz', protect, claimQuizPoints);

export default router;