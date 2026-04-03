import express from 'express';
import { protect } from '../../middlewares/authMiddleware.js'; 
import { getAllGifts, redeemGift, getMyHistory } from '../../controllers/mobile/giftController.js';

const router = express.Router();

router.get('/', getAllGifts);

router.post('/redeem', protect, redeemGift); 
router.get('/history', protect, getMyHistory);

export default router;