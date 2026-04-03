// src/controllers/statsController.js
import mongoose from "mongoose";
import Reward from "../../models/web/Reward.js";
import EventRequest from "../../models/web/EventRequest.js";
import Article from "../../models/web/Article.js";

export const getChartData = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin được truy cập" });
    }

    const days = parseInt(req.query.days) || 30;
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);  // ← Đảm bảo bao gồm document insert muộn trong ngày

    const start = new Date(end);
    start.setDate(end.getDate() - days);
    start.setUTCHours(0, 0, 0, 0);     // Đầu ngày

    // Tạo danh sách ngày (YYYY-MM-DD) để fill 0 nếu không có dữ liệu
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }

    // 1. Số yêu cầu đổi quà mới mỗi ngày
    const rewardAgg = await Reward.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Ho_Chi_Minh"
            }
          },
          rewardsRequested: { $sum: 1 },
        },
      },
    ]);
    // Log số lượng hôm nay (dùng múi giờ VN để hiển thị)
    const todayVN = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
    const todayCount = rewardAgg.find((item) => item._id === todayVN)?.rewardsRequested || 0;

    // 2. Số sự kiện được yêu cầu tổ chức
    const eventAgg = await EventRequest.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Ho_Chi_Minh"
            }
          },
          eventsRequested: { $sum: 1 },
        },
      },
    ]);

    // 3. Số bài viết được xuất bản
    const articleAgg = await Article.aggregate([
      {
        $match: {
          status: "published",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Ho_Chi_Minh"
            }
          },
          articlesPublished: { $sum: 1 },
        },
      },
    ]);

    // Kết hợp thành mảng dữ liệu cho frontend
    const chartData = dates.map((date) => ({
      date,
      rewardsRequested: rewardAgg.find((item) => item._id === date)?.rewardsRequested || 0,
      eventsRequested: eventAgg.find((item) => item._id === date)?.eventsRequested || 0,
      articlesPublished: articleAgg.find((item) => item._id === date)?.articlesPublished || 0,
    }));

    return res.status(200).json(chartData);
  } catch (err) {
    console.error("[getChartData] Error:", err);
    return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu biểu đồ" });
  }
};