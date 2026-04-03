import express from 'express';
import { getAllStations, createStation } from '../../controllers/mobile/wasteStationUserController.js';

const router = express.Router();

// GET: /api/wastestations 
router.get('/', getAllStations);

// POST: /api/wastestations 
router.post('/', createStation);

export default router;