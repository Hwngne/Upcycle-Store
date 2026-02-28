const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 
const { getAllGifts, redeemGift, getMyHistory } = require('../controllers/giftController');

router.get('/', getAllGifts);

router.post('/redeem', protect, redeemGift); 
router.get('/history', protect, getMyHistory);

module.exports = router;