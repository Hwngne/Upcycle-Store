const mongoose = require('mongoose');

const eventRequestSchema = mongoose.Schema({
  // --- Thông tin người tạo sự kiện ---
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // --- Thông tin sự kiện ---
  name: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },

  isPaid: { type: Boolean, default: false },
  
  price: { type: String, default: "Miễn phí" }, 

  location: { type: String, required: true },
  date: { type: String, required: true },       
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true },

  // --- Thông tin liên hệ ---
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  formLink: { type: String, required: true },

  // --- File & Hình ảnh ---
  bannerUrl: { type: String, default: "" }, 
  attachmentUrl: { type: String, default: "" },

  // --- Trạng thái duyệt ---
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' 
  },
// --- Trạng thái quảng bá ---
  promotionStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'active', 'rejected'],
    default: 'none' 
  },
  // --- THÔNG TIN QUẢNG BÁ  ---
  promotionLocations: {
    type: [String], 
    default: [] 
  },
  promotionStartDate: { type: String, default: "" },
  promotionEndDate: { type: String, default: "" },

}, { timestamps: true });

module.exports = mongoose.model('EventRequest', eventRequestSchema);