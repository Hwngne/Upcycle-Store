import express from "express";
import Notification from "../../models/web/Notification.js";
import { authenticate } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/notifications", authenticate, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json(notifications);
});

router.patch("/notifications/:id/read", authenticate, async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, user: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
});

export default router;
