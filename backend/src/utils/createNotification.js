import Notification from "../models/web/Notification.js";

export const createNotification = async ({
  user,
  title,
  message,
  type,
  relatedEvent,
}) => {
  try {
    await Notification.create({
      user,
      title,
      message,
      type,
      relatedEvent,
    });
  } catch (err) {
    console.error("Create notification error:", err);
  }
};
