const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnailUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  views: { type: Number, default: 0 },
  status: { type: String, default: 'published' },
  visible: { type: Boolean, default: true },
  rewardPoint: {        
    type: Number,
    default: 0
  },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);