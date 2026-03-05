// src/routes/wasteConfigRoute.js
import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
    getAllConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
} from "../controllers/wasteConfigController.js";

const router = express.Router();

// Public: App di động cần lấy danh sách loại rác và khu vực
router.get("/", getAllConfigs);

// Admin only
router.post("/", authenticate, authorize("admin"), createConfig);
router.put("/:id", authenticate, authorize("admin"), updateConfig);
router.delete("/:id", authenticate, authorize("admin"), deleteConfig);

export default router;