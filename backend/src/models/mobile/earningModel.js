import mongoose from 'mongoose';

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
    // Số điểm nhận được 
    pointsEarned: {
      type: Number,
      required: true
    },
    // Mã tham chiếu ( VD: DAILY-20240115)
    referenceCode: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true, // Tự động có createdAt, updatedAt
    collection: 'earnings' 
  }
);

const Earning = mongoose.model('Earning', earningSchema);

export default Earning;