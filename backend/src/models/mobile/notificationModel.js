import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // Người nhận thông báo
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Tiêu đề thông báo
    title: {
      type: String,
      required: true,
    },
    // Nội dung chi tiết
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['event', 'point', 'chat', 'general'], 
      default: 'general',
    },
    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model('Notification', notificationSchema);