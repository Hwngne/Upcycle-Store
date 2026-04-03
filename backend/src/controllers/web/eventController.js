//controller/eventController.js

import EventRequest from "../../models/web/EventRequest.js";
import { normalizeEvent } from "../../utils/normalizeEvent.js";
import { createNotification } from "../../utils/createNotification.js";
export const getEventRequests = async (req, res) => {
  try {
    const events = await EventRequest.find()
      .populate({
        path: "createdBy",
        select: "club_info.club_name email avatar phone_number",
      })
      .sort({ createdAt: -1 })
      .lean();
    const normalizedEvents = events.map(normalizeEvent);

    res.json(normalizedEvents);
  } catch (err) {
    console.error("Lỗi getEventRequests:", err);
    res.status(500).json({ message: "Không thể lấy danh sách sự kiện" });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const updated = await EventRequest.findByIdAndUpdate(
      id,
      { status },                 
      {
        new: true,
        runValidators: false,     
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    }

    if (status === "approved") {
      await createNotification({
        user: updated.createdBy,
        title: "Sự kiện đã được duyệt",
        message: `Sự kiện "${updated.name}" đã được quản trị viên phê duyệt.`,
        type: "event",
        relatedEvent: updated._id,
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái sự kiện:", err);
    res.status(500).json({ message: "Cập nhật trạng thái thất bại" });
  }
};

export const getEventPromotions = async (req, res) => {
  try {
    const events = await EventRequest.find({
      promotionStatus: { $in: ["pending", "active", "approved", "rejected"] }
    })
      .populate({
        path: "createdBy",
        select: "club_info.club_name email",
      })
      .sort({ updatedAt: -1 })
      .lean();

    const normalized = events.map(normalizeEvent);

    res.json(normalized);
  } catch (err) {
    console.error("Lỗi getEventPromotions:", err);
    res.status(500).json({ message: "Không thể lấy danh sách quảng bá" });
  }
};
export const updatePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { promotionStatus } = req.body;

    if (!["active", "rejected"].includes(promotionStatus)) {
      return res.status(400).json({
        message: "Hành động quảng bá không hợp lệ",
      });
    }

    const event = await EventRequest.findById(id);
    if (!event) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện",
      });
    }

    if (event.promotionStatus === "none") {
      return res.status(400).json({
        message: "Sự kiện chưa đăng ký quảng bá",
      });
    }

    if (event.promotionStatus !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể xử lý quảng bá đang chờ duyệt",
      });
    }

    if (event.status !== "approved") {
      return res.status(400).json({
        message: "Sự kiện chưa được duyệt nội dung",
      });
    }

    // ===== TỪ CHỐI =====
    if (promotionStatus === "rejected") {
      event.promotionStatus = "rejected";
      await event.save();

      await createNotification({
        user: event.createdBy,
        title: "Quảng bá sự kiện bị từ chối",
        message: `Quảng bá cho sự kiện "${event.name}" đã bị từ chối.`,
        type: "promotion",
        relatedEvent: event._id,
      });

      return res.json({
        message: "Đã từ chối quảng bá",
        promotionStatus: "rejected",
      });
    }

    // ===== DUYỆT =====
    event.promotionStatus = "active";
    await event.save();

    await createNotification({
      user: event.createdBy,
      title: "Quảng bá sự kiện đã được duyệt",
      message: `Quảng bá cho sự kiện "${event.name}" đã được duyệt và sẽ bắt đầu theo lịch.`,
      type: "promotion",
      relatedEvent: event._id,
    });

    return res.json({
      message: "Đã duyệt quảng bá (chưa tới ngày chạy)",
      promotionStatus: "active",
    });
  } catch (err) {
    console.error("[ERROR updatePromotionStatus]", err);
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const getEventStatsByMonth = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const stats = await EventRequest.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },

          // 🔴 Đếm tất cả yêu cầu tổ chức
          eventsRequested: { $sum: 1 },

          // 🟡 Đếm tất cả yêu cầu có đăng ký quảng bá
          promotionRequested: {
            $sum: {
              $cond: [
                { $ne: ["$promotionStatus", "none"] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          eventsRequested: 1,
          promotionRequested: 1,
        },
      },
    ]);

    res.json({
      month,
      year,
      data: stats,
    });
  } catch (error) {
    console.error("Lỗi getEventStatsByMonth:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUpcomingApprovedEvents = async (req, res) => {
  try {
    const events = await EventRequest.find({
      status: "approved",
    })
    .populate({
        path: "createdBy",
        select: "club_info.club_name email avatar",
      })
      .lean();

    const now = new Date();

    // Hôm nay (00:00)
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // 3 ngày tới (23:59:59 của ngày thứ 3)
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    threeDaysLater.setHours(23, 59, 59, 999);

    const parseVNDate = (dateStr) => {
      if (!dateStr) return null;

      const [day, month, year] = dateStr.split("/");
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
    };

    const filteredEvents = events.filter((event) => {
      const eventDate = parseVNDate(event.date);
      if (!eventDate) return false;

      return eventDate >= today && eventDate <= threeDaysLater;
    });

    // Sắp xếp theo ngày tăng dần
    filteredEvents.sort(
      (a, b) =>
        parseVNDate(a.date) - parseVNDate(b.date)
    );

    res.json(filteredEvents);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const getUpcomingApprovedEvents = async (req, res) => {
//   try {
//     const today = new Date();
//     const threeDaysLater = new Date();
//     threeDaysLater.setDate(today.getDate() + 3);

//     // Reset giờ để so chính xác theo ngày
//     today.setHours(0, 0, 0, 0);
//     threeDaysLater.setHours(23, 59, 59, 999);

//     const events = await EventRequest.find({
//       status: "approved",
//       date: {
//         $gte: today,
//         $lte: threeDaysLater,
//       },
//     })
//       .populate({
//         path: "createdBy",
//         select: "club_info.club_name",
//       })
//       .sort({ date: 1 })
//       .lean();

//     res.json(events);
//   } catch (err) {
//     console.error("Lỗi getUpcomingApprovedEvents:", err);
//     res.status(500).json({
//       message: "Không thể lấy sự kiện sắp diễn ra",
//     });
//   }
// };