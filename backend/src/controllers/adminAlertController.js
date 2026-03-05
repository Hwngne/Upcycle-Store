import Gift from "../models/Gift.js";
import EventRequest from "../models/EventRequest.js";

export const getUrgentOverview = async (req, res) => {
  try {
    // ===== LẤY HÔM NAY (00:00:00) =====
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ===== 3 NGÀY TỚI (23:59:59) =====
    const next3Days = new Date(today);
    next3Days.setDate(today.getDate() + 3);
    next3Days.setHours(23, 59, 59, 999);

    // ===== HÀM PARSE DATE dd/mm/yyyy =====
    const parseVNDate = (dateStr) => {
      if (!dateStr) return null;

      const parts = dateStr.split("/");
      if (parts.length !== 3) return null;

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      return new Date(year, month, day);
    };

    const isWithin3Days = (dateStr) => {
      const d = parseVNDate(dateStr);
      if (!d) return false;
      return d >= today && d <= next3Days;
    };

    // ================= LOW STOCK GIFTS =================
    const lowStockGifts = await Gift.find({
      quantity: { $lte: 5 },
      visible: true,
    }).select("name quantity");

    // ================= EVENT SẮP DIỄN RA =================
    const pendingEvents = await EventRequest.find({
      status: "pending",
    }).select("name date");

    const pendingEventRequestsNearDate = pendingEvents.filter(event =>
      isWithin3Days(event.date)
    );

    // ================= PROMOTION SẮP CHẠY =================
    const pendingPromotions = await EventRequest.find({
      status: "approved",
      promotionStatus: "pending",
    }).select("name promotionStartDate");

    const pendingPromotionNearDate = pendingPromotions.filter(event =>
      isWithin3Days(event.promotionStartDate)
    );

    // ================= RESPONSE =================
    return res.json({
      lowStockGifts: lowStockGifts.length,
      pendingEventRequestsNearDate: pendingEventRequestsNearDate.length,
      pendingPromotionNearDate: pendingPromotionNearDate.length,
      details: {
        gifts: lowStockGifts,
        events: pendingEventRequestsNearDate,
        promotions: pendingPromotionNearDate,
      },
    });

  } catch (error) {
    console.error("getUrgentOverview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};