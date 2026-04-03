import mongoose from 'mongoose';

const giftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  point: { type: Number, required: true }, 
  quantity: { type: Number, required: true, default: 0 },
  location: { type: String, required: true },
  visible: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Gift', giftSchema, 'gifts');
