import mongoose from "mongoose";

const eventRequestSchema = new mongoose.Schema(
  {
    // --- Thông tin sự kiện ---
    name: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },

    // Dùng Mixed để App có thể lưu String ("20/11/2026"), Web có thể lưu Date object
    date: { type: mongoose.Schema.Types.Mixed, required: true }, 
    
    startTime: { type: String }, 
    endTime: { type: String },   

    isPaid: { type: Boolean, default: false },
    price: { type: mongoose.Schema.Types.Mixed, default: 0 }, 

    // --- Thông tin liên hệ ---
    contactName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    formLink: { type: String },

    // ==========================================
    // CÁC TRƯỜNG BỔ SUNG CHO TÍNH NĂNG ĐĂNG KÝ
    // ==========================================
    registrationDeadline: { type: Date }, // Hạn chót đăng ký
    participants: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        registeredAt: { type: Date, default: Date.now },
        checkInStatus: { type: String, enum: ['registered', 'attended'], default: 'registered' },
        checkInAt: { type: Date }
      }
    ],

    // --- File & Hình ảnh ---
    bannerUrl: { type: String, default: "" },
    attachmentUrl: { type: String, default: "" },

    // --- Trạng thái duyệt sự kiện ---
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // --- Trạng thái & Thông tin quảng bá ---
    promotionStatus: {
      type: String,
      enum: ["none", "pending", "active", "approved", "rejected"],
      default: "none",
    },
    promotionLocations: {
      type: [String], // Dành riêng cho App
      default: [],
    },
    promotionStartDate: { type: String, default: "" },
    promotionEndDate: { type: String, default: "" },

    // --- Thông tin người tạo ---
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true
    },
  },
  { timestamps: true, versionKey: false }
);

const EventRequest = mongoose.models.EventRequest || mongoose.model("EventRequest", eventRequestSchema);
export default EventRequest;