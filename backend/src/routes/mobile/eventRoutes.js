import express from 'express';
import multer from 'multer';
import { createEvent } from '../../controllers/mobile/eventController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route POST với middleware hứng 2 file: banner và attachment
router.post(
  '/create', 
  protect, 
  upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'attachment', maxCount: 1 }]), 
  createEvent
);

export default router;