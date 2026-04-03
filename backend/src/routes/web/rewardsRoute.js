import express from "express";
import {
    getAllGifts,
    createGift,
    updateGift,
    deleteGift,
    exchangeGift,
    getAllRewards,
    updateRewardStatus,
} from "../../controllers/web//rewardsControllers.js";

import { authenticate, authorize } from "../../middlewares/auth.js";
import { uploadImage } from "../../middlewares/upload.js";

const router = express.Router();

/* ================= GIFTS (ADMIN) ================= */
router.get("/gifts", authenticate, authorize("admin"), getAllGifts);

router.post(
    "/gifts",
    authenticate,
    authorize("admin"),
    uploadImage.single("image"),
    createGift
);

router.put(
    "/gifts/:id",
    authenticate,
    authorize("admin"),
    uploadImage.single("image"),
    updateGift
);

router.delete("/gifts/:id", authenticate, authorize("admin"), deleteGift);

/* ================= EXCHANGE (USER) ================= */
router.post("/exchange", authenticate, exchangeGift);

/* ================= REWARDS (ADMIN / USER) ================= */
router.get("/rewards", authenticate, getAllRewards);

router.patch(
    "/rewards/:id/status",
    authenticate,
    authorize("admin"),
    updateRewardStatus
);

export default router;
