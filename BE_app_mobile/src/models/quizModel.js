const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: { type: String, required: true },
  is_correct: { type: Boolean, required: true }
}, { _id: false }); 

// Schema con: Câu hỏi
const questionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  score: { type: Number, default: 10 }, // Điểm của câu này
  answers: [answerSchema] // Mảng các câu trả lời
}, { _id: false });

// Schema chính: Quiz
const quizSchema = mongoose.Schema({
  title: { type: String, required: true },
  time_limit: { type: Number, default: 15 }, // Phút
  
  max_points: { type: Number, default: 100 }, 

  rewardPoint: {        
    type: Number,
    default: 0
  },

  questions: [questionSchema], // Mảng các câu hỏi

  status: { type: String, default: "published" },
  visible: { type: Boolean, default: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, { 
  timestamps: true,
  collection: 'quizzes'
});

module.exports = mongoose.model('Quiz', quizSchema);