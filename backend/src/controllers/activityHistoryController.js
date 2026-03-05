import ActivityHistory from "../models/ActivityHistory.js";

export const getActivityHistories = async (req, res) => {
  try {
    const histories = await ActivityHistory.find()
      .populate("actor", "role student_name admin_name club_info avatar")  // populate đầy đủ cho getDisplayName
      .sort({ createdAt: -1 })


    res.status(200).json(histories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

