const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  point: { type: Number, required: true }, // Trong ảnh là 'point', code cũ là 'cost' -> phải khớp DB
  quantity: { type: Number, required: true, default: 0 },
  location: { type: String, required: true },
  visible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Gift', giftSchema, 'gifts');
