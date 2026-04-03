import Notification from '../../models/mobile//notificationModel.js'; 

// 1. Lấy danh sách thông báo của user đang đăng nhập
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Đánh dấu tất cả là đã đọc
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: "Đã đánh dấu đọc tất cả" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Đếm số thông báo chưa đọc
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ user: userId, isRead: false });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
