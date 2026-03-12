import express from "express";
import { getActivityHistories } from "../controllers/activityHistoryController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, getActivityHistories);

export default router;
