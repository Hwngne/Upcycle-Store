import express from 'express';
import uploadCloud from '../../config/cloudinary.js';
import { protect } from '../../middlewares/authMiddleware.js'; 

import { 
    createEventRequest, 
    getAllRequests, 
    getMyEvents,
    getPromotionAvailability,
    getActiveBanners,
    approveEvent,
    registerEvent 
} from '../../controllers/mobile/eventRequestController.js';

const router = express.Router();

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
router.post('/:eventId/register', protect, registerEvent);

export default router;