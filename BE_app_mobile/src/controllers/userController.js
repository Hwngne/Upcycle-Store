const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/transactionModel'); 
const Earning = require('../models/earningModel');
const Notification = require('../models/notificationModel'); 
const nodemailer = require('nodemailer'); 

// 1. Tạo Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 2. Tính Rank dựa trên điểm 
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
// @desc    Yêu cầu gửi OTP Quên mật khẩu
// @route   POST /api/users/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Tìm user theo email 
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "Email này không tồn tại trong hệ thống!" });}

    // Tạo mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[DEV TEST] Mã OTP của email ${email} là: ${otp}`);
    
    // Lưu OTP và thời gian hết hạn (5 phút) vào Database
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; 
    await user.save();

    // Cấu hình gửi Mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: '"UpcycleStore System" <no-reply@upcyclestore.com>',
      to: user.email,
      subject: 'Mã xác nhận khôi phục mật khẩu - UpcycleStore',
      html: `
        <h3>Xin chào ${user.student_name || 'bạn'},</h3>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Đây là mã xác nhận (OTP) của bạn:</p>
        <h1 style="color: #B71C1C; letter-spacing: 5px;">${otp}</h1>
        <p>Mã này sẽ hết hạn sau <b>5 phút</b>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
      `
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.log(`[CẢNH BÁO DEV] Không gửi được mail tới ${user.email}, nhưng OTP vẫn được lưu. Lỗi: ${mailError.message}`);}

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn." });

  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau." });
  }
};

// @desc    Xác nhận OTP và đặt lại mật khẩu mới
// @route   POST /api/users/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    // 1. CHỈ tìm user dựa vào Email trước
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản với email này!" });
    }

    // 2. LOGIC "MÃ " ĐỂ TEST/DEMO
    if (otp !== "000000") {
      if (user.resetPasswordOtp !== otp) {
        return res.status(400).json({ message: "Mã OTP không hợp lệ!" });
      }
      
      if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
        return res.status(400).json({ message: "Mã OTP đã hết hạn!" });
      }
    } else {
      console.log(`[DEV MODE] User ${email} đang dùng mã OTP 000000`);
    }

    // 3. Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Mật khẩu quá ngắn" });
    }

    // Tìm user khớp email, khớp OTP và OTP chưa hết hạn
    //const user = await User.findOne({
      //email: email.toLowerCase().trim(),
      //resetPasswordOtp: otp,
      //resetPasswordExpires: { $gt: Date.now() }
   // });

    //if (!user) {
      //return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn!" });
    //}

    //if (newPassword.length < 8) {
      //return res.status(400).json({ message: "Mật khẩu quá ngắn" });
    //}

    // Băm mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Cập nhật lại cờ change_password 
    user.change_password = false;
    
    // Hủy OTP để không bị dùng lại
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công! Bạn có thể đăng nhập." });

  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau." });
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
  getMyHistory,
  forgotPassword,
  resetPassword
};