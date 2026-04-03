import express from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import {
    getAllContentConfigs,
    createContentConfig,
    deleteContentConfig,
    updateContentConfig,
} from "../../controllers/web//contentConfigController.js";

const router = express.Router();


router.get("/", getAllContentConfigs);
router.post("/", authenticate, authorize("admin"), createContentConfig);
router.put("/:id", authenticate, authorize("admin"), updateContentConfig);
router.delete("/:id", authenticate, authorize("admin"), deleteContentConfig);

export default router;