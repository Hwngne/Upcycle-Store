import cron from "node-cron";
import EventRequest from "../models/EventRequest.js";

cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Promotion cron running...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // ===== active → approved =====
      const activeEvents = await EventRequest.find({
        promotionStatus: "active",
      });

      let startedCount = 0;

      for (const event of activeEvents) {
        if (!event.promotionStartDate) continue;

        const [d, m, y] = event.promotionStartDate.split("/").map(Number);
        const startDate = new Date(y, m - 1, d);
        startDate.setHours(0, 0, 0, 0);

        if (startDate <= today) {
          event.promotionStatus = "approved";
          await event.save();
          startedCount++;
        }
      }

      console.log(
        startedCount > 0
          ? `Cron: ${startedCount} quảng bá bắt đầu chạy`
          : "Cron: không có quảng bá nào bắt đầu"
      );

      // ===== approved → none =====
      const approvedEvents = await EventRequest.find({
        promotionStatus: "approved",
      });

      let expiredCount = 0;

      for (const event of approvedEvents) {
        if (!event.promotionEndDate) continue;

        const [d, m, y] = event.promotionEndDate.split("/").map(Number);
        const endDate = new Date(y, m - 1, d);
        endDate.setHours(0, 0, 0, 0);

        if (endDate < today) {
          event.promotionStatus = "none";
          await event.save();
          expiredCount++;
        }
      }

      console.log(
        expiredCount > 0
          ? `Cron: ${expiredCount} quảng bá đã hết hạn`
          : "Cron: không có quảng bá nào hết hạn"
      );
    } catch (err) {
      console.error("Promotion cron error:", err);
    }
  },
  {
    timezone: "Asia/Ho_Chi_Minh",
  }
);
