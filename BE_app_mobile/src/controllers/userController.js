const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/transactionModel'); 
const Earning = require('../models/earningModel');
const Notification = require('../models/notificationModel'); 

// 1. Tạo Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 2. Tính Rank dựa trên điểm (Tránh lặp code)
const getTier = (score) => {
  if (score > 500) return 3; // Rank Vàng
  if (score > 100) return 2; // Rank Bạc
  return 1; // Rank Đồng
};

// 3. Lấy ngày hiện tại theo giờ Việt Nam (YYYY-MM-DD)
const getVietnamDateStr = () => {
  const now = new Date();
  const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return vnTime.toISOString().split('T')[0];
};

// --- MAIN CONTROLLERS ---

// @desc    Đăng nhập
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      status: { $ne: "deleted" }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check Role
      if (user.role !== 'student' && user.role !== 'club') {
        return res.status(403).json({ message: 'Ứng dụng chỉ dành cho Sinh viên và CLB!' });
      }
      // Check Status
      if (user.status === 'locked') {
        return res.status(403).json({ message: 'Tài khoản đã bị khóa!' });
      }
      const notifCount = await Notification.countDocuments({ user: user.id });
      if (notifCount === 0) {
        const displayName = user.student_name || (user.club_info ? user.club_info.club_name : "bạn");
        await Notification.create({
          user: user.id,
          title: " Chào mừng đến với Eco App!",
          message: `Xin chào ${displayName}, mừng bạn gia nhập cộng đồng Eco App! Hãy cùng nhau chung tay bảo vệ môi trường nhé !`,
          type: "general", 
          isRead: false
        });
      }

      // Trả về dữ liệu
      res.json({
        _id: user.id,
        email: user.email,
        role: user.role,
        name: user.student_name || (user.club_info ? user.club_info.club_name : user.email),
        studentId: user.student_code || "",
        avatar: user.avatar,
        phone: user.phone_number || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        
        points: user.total_points || 0,
        totalScore: user.totalScore || 0,
        attendanceHistory: user.attendanceHistory || [],
        rank: null, 
        token: generateToken(user.id),
        isFirstLogin: user.change_password === true
      });

    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Điểm danh hàng ngày
// @route   POST /api/users/checkin
const dailyCheckIn = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 
    
    const checkInDate = getVietnamDateStr(); 

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.attendanceHistory) user.attendanceHistory = [];

    if (user.attendanceHistory.includes(checkInDate)) {
      return res.status(400).json({
        success: false,
        message: "Hôm nay bạn đã điểm danh rồi!",
        attendanceHistory: user.attendanceHistory
      });
    }

    // --- LOGIC CỘNG ĐIỂM ---
    const pointsAdded = 10; 
    user.attendanceHistory.push(checkInDate);
    user.total_points = (user.total_points || 0) + pointsAdded;
    user.totalScore = (user.totalScore || 0) + pointsAdded;

    const refCode = `DAILY-${userId.toString().slice(-4)}-${Date.now().toString().slice(-6)}`;
await Earning.create({
  user: userId,
  activityType: 'checkin',      
  taskName: "Điểm danh hàng ngày",
  pointsEarned: 5,              
  referenceCode: refCode
});

    await user.save();

    res.json({
      success: true,
      message: "Điểm danh thành công",
      newPoints: user.total_points,
      attendanceHistory: user.attendanceHistory
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cộng điểm (Quiz/Đọc báo/Vòng quay)
// @route   POST /api/users/add-points
const addPoints = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { points, taskName } = req.body; 

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Cộng điểm
    user.total_points = (user.total_points || 0) + points;
    user.totalScore = (user.totalScore || 0) + points;

    const refCode = `TASK-${Date.now().toString().slice(-8)}`;
await Earning.create({
  user: userId,
  activityType: 'other', 
  taskName: taskName || "Hoàn thành nhiệm vụ",
  pointsEarned: points,
  referenceCode: refCode
});

    await user.save();

    res.json({
      success: true,
      message: "Cộng điểm thành công",
      newPoints: user.total_points,
      //newRank: calculateRank(user.totalScore)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); 
    if (user) {
      const higherScorersCount = await User.countDocuments({ 
          totalScore: { $gt: user.totalScore || 0 },
          role: 'student' 
      });
      let hasSpun = false;
      if (user.lastSpinDate) {
        const today = new Date().setHours(0,0,0,0);
        const lastSpin = new Date(user.lastSpinDate).setHours(0,0,0,0);
        if (today === lastSpin) {
            hasSpun = true;
        }
      }
      const realRank = higherScorersCount + 1;
      const currentTier = getTier(user.totalScore || 0);
      res.json({
        _id: user.id,
        email: user.email,
        role: user.role,
        name: user.student_name || (user.club_info ? user.club_info.club_name : user.email),
        studentId: user.student_code || "",
        avatar: user.avatar,
        phone: user.phone_number || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        
        points: user.total_points || 0,
        totalScore: user.totalScore || 0,
        attendanceHistory: user.attendanceHistory || [],
        rank: realRank, 
        tier: currentTier,
        hasSpunToday: hasSpun, 
        clubInfo: user.club_info || {}
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật Profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { name, phone, gender, dateOfBirth, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (phone) user.phone_number = phone;
    if (gender) {
        // Chuẩn hóa giới tính
        const g = gender.toLowerCase();
        if (g === 'nam' || g === 'male') user.gender = 'M';
        else if (g === 'nữ' || g === 'nu' || g === 'female') user.gender = 'F';
        else user.gender = gender;
    }
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    // Map lại response
    res.json({
      _id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.student_name || (updatedUser.club_info ? updatedUser.club_info.club_name : updatedUser.email),
      phone: updatedUser.phone_number,
      gender: updatedUser.gender,
      dateOfBirth: updatedUser.dateOfBirth,
      avatar: updatedUser.avatar,
      studentId: updatedUser.student_code,
      
      points: updatedUser.total_points || 0,
      totalScore: updatedUser.totalScore || 0,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đổi mật khẩu
const changePassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
    
        if (newPassword.length < 8) return res.status(400).json({ message: "Mật khẩu quá ngắn" });
        
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) return res.status(400).json({ message: "Mật khẩu mới trùng mật khẩu cũ" });
    
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.change_password = false;
        await user.save();
    
        res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};

// @desc    Bảng xếp hạng
const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({ role: 'student' })
          .sort({ totalScore: -1 })
          .limit(10)
          .select('student_name avatar totalScore total_points');
    
        const mappedUsers = users.map(u => ({
          name: u.student_name || "Sinh viên ẩn danh",
          avatar: u.avatar,
          totalScore: u.totalScore || 0,
          points: u.total_points || 0
        }));
    
        res.json(mappedUsers);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};
// 4. API LẤY LỊCH SỬ TỔNG HỢP (Gộp Redeem & Earning)
const getMyHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // A. Lấy danh sách ĐỔI QUÀ (Trừ điểm) - Bảng Transaction cũ
    const redemptions = await Transaction.find({ user: userId }).lean();
    
    // Map dữ liệu Đổi quà cho khớp format chung
    const listA = redemptions.map(item => ({
      _id: item._id, // ID giao dịch
      
      // Các trường App cần:
      giftName: item.giftName,
      redemptionCode: item.redemptionCode,
      pointsSpent: item.pointsSpent, // Giữ nguyên (Frontend sẽ tự thêm dấu -)
      status: item.status, 
      imageUrl: item.giftImage,
      createdAt: item.createdAt,
      type: 'redeem' 
    }));

    // B. Lấy danh sách KIẾM ĐIỂM (Cộng điểm) - Bảng Earning mới
    const earnings = await Earning.find({ user: userId }).lean();

    const listB = earnings.map(item => ({
      _id: item._id,
      
      // Map sang tên trường mà App đang dùng
      giftName: item.taskName,       // taskName -> giftName
      redemptionCode: item.referenceCode, // refCode -> redemptionCode
      pointsSpent: item.pointsEarned, // pointsEarned -> pointsSpent
      
      status: 'completed',           // Luôn là completed
      imageUrl: "https://cdn-icons-png.flaticon.com/512/1041/1041888.png", // Icon mặc định
      createdAt: item.createdAt,
      
      type: 'earning'
    }));

    // C. GỘP VÀ SẮP XẾP
    const unifiedList = [...listA, ...listB];
    unifiedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(unifiedList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  loginUser,
  changePassword,
  dailyCheckIn,
  addPoints,
  getLeaderboard,
  updateUserProfile,
  getUserProfile,
  getMyHistory
};