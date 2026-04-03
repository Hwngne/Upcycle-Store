// src/routes/wasteStationsRoute.js
import express from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import {
    getAllWasteStations,
    createWasteStation,
    updateWasteStation,
    deleteWasteStation,
} from "../../controllers/web//wasteStationController.js";

const router = express.Router();

// Public: Người dùng app di động xem danh sách trạm
router.get("/", getAllWasteStations);

// Admin only
router.post("/", authenticate, authorize("admin"), createWasteStation);
router.put("/:id", authenticate, authorize("admin"), updateWasteStation);
router.delete("/:id", authenticate, authorize("admin"), deleteWasteStation);

export default router;