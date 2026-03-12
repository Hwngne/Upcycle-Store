import express from "express";
import { getUrgentOverview } from "../controllers/adminAlertController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/urgent-overview",
  authenticate,
  authorize("admin"),
  getUrgentOverview
);

export default router;
