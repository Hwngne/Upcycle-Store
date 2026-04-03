//routes/eventRoute.js

import express from "express";
import { getEventRequests, updateEventStatus, getEventPromotions, updatePromotionStatus, getEventStatsByMonth , getUpcomingApprovedEvents} from "../../controllers/web//eventController.js";

const router = express.Router();

router.get("/event-requests", getEventRequests);
router.patch("/event-requests/:id/status", updateEventStatus);
router.get("/event-promotions", getEventPromotions);
router.patch("/event-promotions/:id/status", updatePromotionStatus);
router.get("/event-stats", getEventStatsByMonth);
router.get("/upcoming-approved-events", getUpcomingApprovedEvents);

export default router;