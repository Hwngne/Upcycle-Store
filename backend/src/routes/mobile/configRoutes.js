import express from 'express';
import { getConfigs } from '../../controllers/mobile/configController.js';

const router = express.Router();

router.get('/', getConfigs);

export default router;