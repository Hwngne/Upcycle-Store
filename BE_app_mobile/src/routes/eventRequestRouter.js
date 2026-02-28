const express = require('express');
const router = express.Router();
const uploadCloud = require('../config/cloudinaryConfig');
const { protect } = require('../middleware/authMiddleware'); 

const { 
    createEventRequest, 
    getAllRequests, 
    getMyEvents,
    getPromotionAvailability,
    getActiveBanners,
    approveEvent 
} = require('../controllers/eventRequestController');


router.post('/create', 
    protect, 
    uploadCloud.fields([
        { name: 'banner', maxCount: 1 }, 
        { name: 'attachment', maxCount: 1 }
    ]),
    createEventRequest
);

router.put('/:id/approve', protect, approveEvent);

router.get('/all', protect, getAllRequests);
router.get('/my-events', protect, getMyEvents);
router.get('/availability', protect, getPromotionAvailability);
router.get('/banners', getActiveBanners);

module.exports = router;