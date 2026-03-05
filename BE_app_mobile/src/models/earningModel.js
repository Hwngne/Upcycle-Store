const mongoose = require('mongoose');

const earningSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    activityType: {
      type: String,
      required: true,
      enum: ['checkin', 'article', 'quiz', 'video', 'wheel', 'other'],
      default: 'other'
    },
    taskName: {
      type: String,
      required: true
    },
    // Số điểm nhận được (Luôn là số dương)
    pointsEarned: {
      type: Number,
      required: true
    },
    // Mã tham chiếu (Để sau này Admin tra cứu, VD: DAILY-20240115)
    referenceCode: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true, // Tự động có createdAt, updatedAt
    collection: 'earnings' // Tên collection trong MongoDB
  }
);

const Earning = mongoose.model('Earning', earningSchema);

module.exports = Earning;