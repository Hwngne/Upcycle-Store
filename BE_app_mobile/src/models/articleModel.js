const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String }, 
  thumbnail: { type: String, default: null }, 
  
  rewardPoint: {        
    type: Number,
    default: 0
  },

  readingTime: { type: Number, default: 30 },

  displayType: { type: String, default: "home" },
  status: { type: String, default: "draft" }, // draft, published
  visible: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  collection: 'articles'
});

module.exports = mongoose.model('Article', articleSchema);