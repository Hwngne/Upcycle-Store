import express from "express";
import { getHuntPointsConfig, updateHuntPoint, createActivity, updateActivityConfig, getAllActivities} from "../../controllers/web//activityAdminController.js";
import { authenticate, authorize } from "../../middlewares/auth.js";

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get("/", getAllActivities);
router.post("/", createActivity);
router.put("/:id", updateHuntPoint);
router.patch("/:id", updateActivityConfig);

export default router;
