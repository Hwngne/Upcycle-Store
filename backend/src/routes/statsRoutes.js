// src/routes/statsRoutes.js
import express from "express";
const router = express.Router();

import { authenticate } from "../middlewares/auth.js";
import { getChartData } from "../controllers/statsController.js";

router.get("/chart", authenticate, getChartData);

export default router;