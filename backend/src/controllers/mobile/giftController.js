import Gift from '../../models/mobile/giftModel.js';
import User from '../../models/mobile/userModel.js';
import Transaction from '../../models/mobile/transactionModel.js';
import Notification from '../../models/mobile/notificationModel.js'; 

// 1. Lấy danh sách quà
export const getAllGifts = async (req, res) => {
  try {
    // Tìm quà hiển thị được
    const gifts = await Gift.find({ visible: true })
                            .sort({ createdAt: -1 });
    res.json(gifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Xử lý đổi quà
export const redeemGift = async (req, res) => {
  try {
    // --- Kiểm tra Login trước ---
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Lỗi xác thực: Không tìm thấy thông tin người dùng." });
    }

    const { giftId } = req.body;
    const userId = req.user.id; 

    // A. Kiểm tra User & Điểm
    const user = await User.findById(userId);
    const gift = await Gift.findById(giftId);

    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
    if (!gift) return res.status(404).json({ message: "Quà không tồn tại" });
    
    if (user.total_points < gift.point) {
      return res.status(400).json({ message: "Không đủ điểm để đổi quà này" });
    }
    if (gift.quantity <= 0) {
      return res.status(400).json({ message: "Món quà này đã hết hàng" });
    }

    // B. Trừ điểm & Trừ kho
    user.total_points -= gift.point;
    await user.save();
    
    gift.quantity -= 1;
    await gift.save();

    // C. Sinh mã Code
    const shortUserId = userId.toString().slice(-4).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `ECO-${shortUserId}-${randomNum}`;

    // D. Tạo Transaction
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 3);

    const transaction = await Transaction.create({
      user: userId,
      giftId: gift._id,
      giftName: gift.name,
      giftImage: gift.imageUrl,
      pointsSpent: gift.point,
      redemptionCode: code,
      location: gift.location,
      expiresAt: expireDate,
      status: 'pending' 
    });

    // ==========================================
    // E. GỬI THÔNG BÁO (NOTIFICATION) 
    // ==========================================
    try {
      await Notification.create({
        user: userId,
        title: "Đổi quà thành công! ",
        message: `Bạn đã đổi thành công phần quà "${gift.name}". ${gift.point} điểm đã được khấu trừ. Mã nhận quà của bạn là: ${code}. Vui lòng kiểm tra lịch sử để xem chi tiết.`,
        type: "gift", // Phân loại thông báo để frontend dễ xử lý icon (nếu cần)
        isRead: false
      });
      console.log(`[Notification] Đã gửi thông báo đổi quà cho user ${userId}`);
    } catch (notiErr) {
      // Dùng try-catch riêng để nếu lỗi thông báo cũng KHÔNG làm gãy luồng đổi quà chính
      console.error("Lỗi gửi thông báo đổi quà:", notiErr);
    }
    // ==========================================

    // F. Trả kết quả
    res.status(200).json({
      success: true,
      newPoints: user.total_points,
      code: code,
      location: gift.location,
      expiresAt: expireDate
    });

  } catch (error) {
    console.error("❌ Lỗi redeemGift:", error); 
    res.status(500).json({ message: error.message });
  }
};


// 3. Lấy lịch sử 
export const getMyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Mốc thời gian để xét duyệt đơn cũ 
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

    // --- BƯỚC A: XỬ LÝ ĐƠN ---
    const resultNew = await Transaction.updateMany(
      { 
        user: userId,
        status: 'pending',
        expiresAt: { $exists: true, $ne: null, $lt: now } 
      },
      { $set: { status: 'expired' } }
    );
    console.log(`-> Quét đơn MỚI: Đã hủy ${resultNew.modifiedCount} đơn.`);

    // --- BƯỚC B: XỬ LÝ ĐƠN "CŨ"---
    const resultOld = await Transaction.updateMany(
      { 
        user: userId,
        status: 'pending',
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }], 
        createdAt: { $lt: threeDaysAgo } 
      },
      { $set: { status: 'expired' } }
    );

    // --- BƯỚC C: TRẢ VỀ KẾT QUẢ ---
    const transactions = await Transaction.find({ user: userId })
      .populate('giftId', 'name image point') 
      .sort({ createdAt: -1 });
      
    res.json(transactions);
  } catch (error) {
    console.error("Lỗi getMyHistory:", error);
    res.status(500).json({ message: error.message });
  }
};

// 4. Hàm chạy ngầm 
export const checkExpiredTransactions = async () => {
  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

    // A. Tìm tất cả các đơn hàng đã quá hạn chưa được xử lý
    const expiredTransactions = await Transaction.find({
      status: 'pending',
      $or: [
        { expiresAt: { $lt: now } },
        { expiresAt: { $exists: false }, createdAt: { $lt: threeDaysAgo } }
      ]
    });

    if (expiredTransactions.length > 0) {
      // B. Duyệt qua từng đơn để cập nhật và bắn thông báo cá nhân hóa
      for (const trans of expiredTransactions) {
        trans.status = 'expired';
        await trans.save();

        try {
          // Bắn thông báo đến đúng người đổi 
          await Notification.create({
            user: trans.user, 
            title: "Mã nhận quà đã hết hạn! ⏰",
            message: `Mã nhận quà ${trans.redemptionCode} cho phần quà "${trans.giftName}" của bạn đã quá hạn 3 ngày và bị hủy tự động.`,
            type: "gift",
            isRead: false
          });
        } catch (notiErr) {
          console.error("Lỗi bắn thông báo hủy đơn:", notiErr);
        }
      }
      console.log(`[CRON] Đã tự động hủy và bắn thông báo cho ${expiredTransactions.length} đơn quà quá hạn.`);
    }
  } catch (error) {
    console.error("[CRON] Lỗi quét transaction:", error);
  }
};