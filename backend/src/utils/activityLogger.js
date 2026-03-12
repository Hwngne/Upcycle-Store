import ActivityHistory from "../models/ActivityHistory.js";

export const logActivity = async ({
  req,
  action,
  description,
  targetType,
  target, 
}) => {
  if (!req?.user) return;

  try {
    await ActivityHistory.create({
      actor: req.user._id,     
      actorRole: req.user.role,
      action,
      description,
      targetType,
      target,                   
    });
  } catch (err) {
    console.error("Log activity failed:", err.message);
  }
};
