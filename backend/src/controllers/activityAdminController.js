import Activity from "../models/Activity.js";
import Article from "../models/Article.js";
import Quiz from "../models/Quiz.js";
import Video from "../models/Video.js";

export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ active: true }).sort({
      order: 1,
      createdAt: 1
    });

    res.json(activities);
  } catch {
    res.status(500).json({ message: "Lỗi lấy danh sách hoạt động" });
  }
};


export const getHuntPointsConfig = async (req, res) => {
    try {
        const { role } = req.params;

        if (!["student", "club"].includes(role)) {
            return res.status(400).json({ message: "Role không hợp lệ" });
        }

        const activities = await Activity.find({ role }).sort({
            order: 1,
            createdAt: 1,
        });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy cấu hình săn điểm" });
    }
};


export const updateHuntPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { hunted_point, description, iconName } = req.body;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity không tồn tại" });
    }

    if (!activity.isEditable || activity.type !== "normal") {
      return res.status(403).json({ message: "Không thể chỉnh sửa activity này" });
    }
    if (!activity.isEditable && activity.type !== "quiz") {
        return res.status(403).json({ message: "Không thể chỉnh sửa activity này" });
    }

    activity.hunted_point = Number(hunted_point);
    activity.description = description;
    activity.iconName = iconName;
    await activity.save();

    await Article.updateMany(
        { rewardActivity: activity._id },
        { $set: { rewardPoint: activity.hunted_point } }
    );

    await Quiz.updateMany(
        {rewardActivity: activity._id},
        {$set: {rewardPoint: activity.hunted_point}}
    );

    await Video.updateMany(
        { rewardActivity: activity._id },
        { $set: { rewardPoint: activity.hunted_point } }
    );

    res.json({
      message: "Cập nhật điểm thành công",
      activity,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật điểm" });
  }
};


export const createActivity = async (req, res) => {
  try {
    const { name, hunted_point = 0 } = req.body;

    const exists = await Activity.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ message: "Activity đã tồn tại" });
    }

    const activity = await Activity.create({
      name: name.trim(),
      hunted_point
    });

    res.status(201).json(activity);
  } catch {
    res.status(500).json({ message: "Lỗi tạo activity" });
  }
};


export const updateActivityConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, active, isEditable } = req.body;

        const updated = await Activity.findByIdAndUpdate(
            id,
            {
                ...(type && { type }),
                ...(active !== undefined && { active }),
                ...(isEditable !== undefined && { isEditable }),
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Activity không tồn tại" });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật cấu hình activity" });
    }
};
