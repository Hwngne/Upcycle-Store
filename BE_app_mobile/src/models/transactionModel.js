const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  giftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift' }, 
  giftName: { type: String, required: true },
  giftImage: { type: String },
  pointsSpent: { type: Number, required: true },
  
  // Mã nhận quà (Sinh tự động)
  redemptionCode: { type: String, required: true, unique: true },
  location: { type: String },

  expiresAt: { type: Date, required: true },
  // Trạng thái & Hạn sử dụng
  status: { 
    type: String, 
    enum: ['pending', 'used', 'expired', 'cancelled', 'completed'], 
    default: 'pending' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema, 'rewards');