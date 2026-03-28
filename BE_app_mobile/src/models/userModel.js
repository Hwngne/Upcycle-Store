const mongoose = require('mongoose');

const clubInfoSchema = new mongoose.Schema(
  {
    club_name: { type: String, required: true, trim: true },
    president_name: { type: String, trim: true },
    member_count: { type: Number, min: 0, default: 0 },
    club_phone: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    password: { type: String, required: true },
    role: { 
      type: String, 
      required: true, 
      enum: ["student", "club", "admin"],
      default: "student" // Mặc định là sinh viên
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "locked", "deleted"],
    },
    phone_number: { type: String, unique: true, sparse: true, trim: true },
    
    change_password: { type: Boolean, default: true },

    // ===== ĐIỂM SỐ =====
    total_points: { type: Number, default: 0, min: 0 },
    
    totalScore: { type: Number, default: 0, min: 0 },

    // ===== THÔNG TIN BỔ SUNG (Cho App Sinh viên) =====
    avatar: { type: String, default: "https://i.pravatar.cc/150?img=3" },
    attendanceHistory: { type: [String], default: [] }, // Lịch sử điểm danh
    dateOfBirth: { type: String, default: "" },

    // ===== STUDENT SPECIFIC (Admin dùng tên khác mình chút) =====
    student_code: { type: String, unique: true, sparse: true, trim: true },
    
    // Admin: student_name |
    student_name: { type: String, trim: true },
    
    gender: { type: String, enum: ["M", "F"], default: "M" },

    club_info: { type: clubInfoSchema, default: null },
    admin_name: { type: String, trim: true },
    admin_gender: { type: String, enum: ["M", "F"] },
    admin_phone: { type: String, unique: true, sparse: true, trim: true },
    refreshToken: { type: String, default: null },
    lastSpinDate: { type: Date },
    resetPasswordOtp: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'accounts' 
  }
);

const User = mongoose.model('User', userSchema); 
module.exports = User;