const Gift = require('../models/giftModel');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

// 1. Lấy danh sách quà
exports.getAllGifts = async (req, res) => {
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
exports.redeemGift = async (req, res) => {
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
      status: 'pending' // Thêm trạng thái mặc định cho chắc chắn
    });

    // E. Trả kết quả
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


// 3. Lấy lịch sử (SỬA LẠI LOGIC QUÉT)
exports.getMyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date(); // Thời điểm hiện tại
    
    // Mốc thời gian để xét duyệt đơn cũ (không có expiresAt)
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

    // --- BƯỚC A: XỬ LÝ ĐƠN "MỚI" (Có trường expiresAt) ---
    const resultNew = await Transaction.updateMany(
      { 
        user: userId,
        status: 'pending',
        expiresAt: { $exists: true, $ne: null, $lt: now } // Chỉ quét đơn có expiresAt và đã qua giờ
      },
      { $set: { status: 'expired' } }
    );
    console.log(`-> Quét đơn MỚI: Đã hủy ${resultNew.modifiedCount} đơn.`);

    // --- BƯỚC B: XỬ LÝ ĐƠN "CŨ" (Không có expiresAt) ---
    const resultOld = await Transaction.updateMany(
      { 
        user: userId,
        status: 'pending',
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }], // Không có hạn dùng
        createdAt: { $lt: threeDaysAgo } // Nhưng tạo quá lâu rồi
      },
      { $set: { status: 'expired' } }
    );

    // --- BƯỚC C: TRẢ VỀ KẾT QUẢ ---
    const transactions = await Transaction.find({ user: userId })
      .populate('giftId', 'name image point') // Lấy thêm thông tin quà nếu cần
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
      
    res.json(transactions);
  } catch (error) {
    console.error("Lỗi getMyHistory:", error);
    res.status(500).json({ message: error.message });
  }
};

// 4. Hàm chạy ngầm (Cũng cập nhật logic tương tự)
exports.checkExpiredTransactions = async () => {
  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

    const result = await Transaction.updateMany(
      { 
        status: 'pending',
        $or: [
          { expiresAt: { $lt: now } },
          { expiresAt: { $exists: false }, createdAt: { $lt: threeDaysAgo } }
        ]
      },
      { 
        $set: { status: 'expired' } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[CRON] ✅ Đã tự động hủy ${result.modifiedCount} đơn quà quá hạn.`);
    }
  } catch (error) {
    console.error("[CRON] ❌ Lỗi quét transaction:", error);
  }
};