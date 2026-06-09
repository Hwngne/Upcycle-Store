import express from 'express';
import uploadCloud from '../../config/cloudinary.js';
import { protect } from '../../middlewares/authMiddleware.js'; 
import multer from 'multer';
import { 
    createEventRequest, 
    getAllRequests, 
    getMyEvents,
    getPromotionAvailability,
    getActiveBanners,
    approveEvent,
    registerEvent,
    getEventParticipants,
    getMyRegisteredEvents,
    checkInWithQRImage
} from '../../controllers/mobile/eventRequestController.js';

const router = express.Router();
const uploadMemory = multer({ storage: multer.memoryStorage() });

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
router.get('/my-tickets', protect, getMyRegisteredEvents);
router.post('/check-in-qr', protect, uploadMemory.single('qrImage'), checkInWithQRImage);
router.post('/:eventId/register', protect, registerEvent);
router.get('/:eventId/participants', protect, getEventParticipants);
export default router;