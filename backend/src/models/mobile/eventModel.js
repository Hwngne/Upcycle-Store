import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String },
  description: { type: String, required: true },
  
  // Thông tin vé & Địa điểm
  isPaid: { type: Boolean, default: false },
  price: { type: String },
  location: { type: String, required: true },
  
  // Ngày giờ quan trọng
  eventDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  
  // Thông tin liên hệ
  contactName: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  
  // File đính kèm
  bannerUrl: { type: String },
  attachmentUrl: { type: String },
  
  // Quảng bá
  promotionLocations: [{ type: String }],
  promotionStartDate: { type: String },
  promotionEndDate: { type: String },
  
  // Quản lý trạng thái & Điểm danh
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'pending' // Mặc định chờ Admin duyệt
  },
  participants: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      registeredAt: { type: Date, default: Date.now },
      checkInStatus: { type: String, enum: ['registered', 'attended'], default: 'registered' },
      checkInAt: { type: Date }
    }
  ]
}, { timestamps: true });

export default mongoose.model('ClubEvent', eventSchema);