import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  image: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  content: { type: String },
  image: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [replySchema],

  createdAt: { type: Date, default: Date.now }
});

const postSchema = mongoose.Schema(
  {
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'User' 
    },
    type: { type: String, required: true }, 
    
    // Các trường chung
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: "" }, 
    attachment: { type: String, default: "" }, 
    attachmentName: { type: String, default: "" }, 
    
    // Các trường riêng cho "Kiến thức"
    topic: { type: String, default: "" }, 

    // Các trường riêng cho "Sản phẩm"
    category: { type: String, default: "" }, 
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    phone: { type: String, default: "" },
    date: { type: String, default: "" },        
    eventTime: { type: String, default: "" },    
    eventLocation: { type: String, default: "" },
    status: { type: String, default: "Đang hiển thị" }, 

    // Tương tác 
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    comments: [{ 
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      date: { type: Date, default: Date.now }
    }],
    comments: [commentSchema],
  },
  { timestamps: true } 
);
postSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Post', postSchema);