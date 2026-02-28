const Post = require('../models/postModel');
const User = require('../models/userModel');

// Cấu hình điểm thưởng khi đăng bài
const POINTS_REWARD_POST = 20;

// @desc    Tạo bài viết mới + Cộng điểm
// @route   POST /api/posts
const createPost = async (req, res) => {
  try {
    const {
      email,
      type, title, content,
      topic, category, price, quantity, phone,
      attachmentName
    } = req.body;

    let imageUrl = "";
    let attachmentUrl = "";

    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        imageUrl = req.files['image'][0].path;
      }
      if (req.files['attachment'] && req.files['attachment'][0]) {
        attachmentUrl = req.files['attachment'][0].path;
      }
    }
    // 2. Tìm người dùng
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3. Tạo bài viết
    const post = new Post({
      author: user._id,
      type, title, content,

      image: imageUrl,
      attachment: attachmentUrl,
      attachmentName,

      topic, category, price, quantity, phone
    });

    const createdPost = await post.save();

    // 4. Cộng điểm
    let message = "Đăng bài thành công!";
    const currentPoints = user.total_points || 0;
    user.total_points = currentPoints + POINTS_REWARD_POST;
    await user.save();

    message += ` Bạn nhận được +${POINTS_REWARD_POST} điểm tích lũy.`;

    // Trả về kết quả
    res.status(201).json({
      success: true,
      message: message,
      data: createdPost
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách bài viết (Có Lọc, Tìm kiếm, Đếm comment & Check Like)
// @route   GET /api/posts?email=...&type=...&topic=...&keyword=...
const getPosts = async (req, res) => {
  try {
    const { email, type, topic, category, keyword } = req.query;
    let currentUserId = null;

    if (email) {
      const user = await User.findOne({ email });
      if (user) currentUserId = user._id.toString();
    }

    let filter = {};
    if (type && type !== 'Tất cả') {
      filter.type = type;
    }
    if (topic && topic !== 'Tất cả') {
      filter.topic = topic;
    }
    if (category && category !== 'Tất cả') {
      filter.category = category;
    }
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } }
      ];
    }
    const now = new Date();
    
    const eventCondition = {
      $or: [
        // Nhóm 1: BÀI BÌNH THƯỜNG (Không phải Sự kiện/Quảng bá) -> Luôn luôn hiển thị
        { type: { $nin: ["Sự kiện", "Quảng bá"] } }, 
        
        // Nhóm 2: LÀ BÀI SỰ KIỆN/QUẢNG BÁ -> Bắt buộc kiểm tra gắt gao
        {
          type: { $in: ["Sự kiện", "Quảng bá"] },
          $or: [
            { status: "approved" }, 
            { status: null }, 
            { status: { $exists: false } }
          ],
          // Ngày phải <= hôm nay HOẶC không có ngày
          $or: [
            { date: { $lte: now } },
            { date: null }, 
            { date: { $exists: false } }
          ]
        }
      ]
    };

    if (filter.$and) {
      filter.$and.push(eventCondition);
    } else {
      filter.$and = [eventCondition];
    }

    // 3. Query Database với Filter & Populate đầy đủ
    const posts = await Post.find(filter)
      .populate('author', 'name student_name avatar role club_info')
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'user',
            select: 'name student_name avatar role club_info'
          },
          {
            path: 'replies.user',
            select: 'name student_name avatar role club_info'
          }
        ]
      })
      .sort({ createdAt: -1 });

    // 4. Xử lý dữ liệu trả về (Map thêm isLiked và commentCount)
    const result = posts.map(post => {
      const postObj = post.toObject(); 

      // A. Check trạng thái Like
      if (currentUserId && post.likes.some(id => id.toString() === currentUserId)) {
        postObj.isLiked = true;
      } else {
        postObj.isLiked = false;
      }

      // B. Tính tổng số bình luận (Cha + Con)
      let total = postObj.comments.length; // Đếm cha
      postObj.comments.forEach(comment => {
        if (comment.replies) {
          total += comment.replies.length; // Cộng thêm con
        }
      });
      postObj.commentCount = total; // Gán vào field mới

      return postObj;
    });

    res.json(result); // Trả về mảng bài viết đã xử lý
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like / Unlike bài viết
// @route   PUT /api/posts/:id/like
const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // 1. Tìm bài viết
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    // 2. Tìm người dùng
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    // 3. Kiểm tra xem người này đã like chưa
    const isLiked = post.likes.includes(user._id);

    if (isLiked) {
      post.likes = post.likes.filter(userId => userId.toString() !== user._id.toString());
    } else {
      post.likes.push(user._id);
    }
    await post.save();
    res.json({
      success: true,
      likesCount: post.likes.length,
      isLiked: !isLiked
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bình luận vào bài viết
// @route   POST /api/posts/:id/comment
const commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, content = "" } = req.body || {}; 
    if (!content.trim() && !req.file) {
        return res.status(400).json({ message: "Bình luận phải có nội dung hoặc hình ảnh" });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path;
    }

    const newComment = {
      user: user._id,
      content: content,
      image: imageUrl,
      createdAt: new Date()
    };
    post.comments.unshift(newComment);
    await post.save();
    await post.populate({
      path: 'comments.user',
      select: 'student_name name avatar role club_info'
    });

    res.status(201).json({
      success: true,
      comments: post.comments
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike một bình luận
// @route   PUT /api/posts/:id/comment/:commentId/like
const toggleLikeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const index = comment.likes.indexOf(user._id);
    if (index === -1) {
      comment.likes.push(user._id);
    } else {
      comment.likes.splice(index, 1);
    }
    await post.save();
    res.json({ success: true, likes: comment.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa bình luận
// @route   DELETE /api/posts/:id/comment/:commentId
const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { email } = req.body;
    // 1. Tìm Post
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });
    // 2. Tìm Comment
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Bình luận không tồn tại" });
    // 3. Tìm User đang yêu cầu
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Người dùng không hợp lệ" });
    // 4. Kiểm tra quyền (Chỉ chủ comment mới được xóa)
    if (comment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này" });
    }
    // 5. Thực hiện xóa
    post.comments.pull(commentId);
    await post.save();

    await post.populate({
      path: 'comments.user',
      select: 'student_name name avatar role club_info'
    });

    res.json({ success: true, comments: post.comments });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sửa bình luận
// @route   PUT /api/posts/:id/comment/:commentId
const editComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { email, content } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Bình luận không tồn tại" });

    const user = await User.findOne({ email });

    if (comment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền sửa bình luận này" });
    }

    comment.content = content;
    await post.save();

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Trả lời một bình luận
// @route   POST /api/posts/:id/comment/:commentId/reply
const replyToComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { email, content = "" } = req.body || {};
    if (!content.trim() && !req.file) {
        return res.status(400).json({ message: "Trả lời phải có nội dung hoặc hình ảnh" });
    }
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path;
    }

    const newReply = {
      user: user._id,
      content: content,
      image: imageUrl,
      createdAt: new Date()
    };
    comment.replies.push(newReply);

    await post.save();
    await post.populate({
      path: 'comments.replies.user',
      select: 'student_name name avatar role club_info'
    });

    res.status(201).json({
      success: true,
      replies: comment.replies
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike một câu trả lời (Reply)
// @route   PUT /api/posts/:id/comment/:commentId/reply/:replyId/like
const toggleLikeReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;
    const { email } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const user = await User.findOne({ email });

    const index = reply.likes.indexOf(user._id);
    if (index === -1) {
      reply.likes.push(user._id);
    } else {
      reply.likes.splice(index, 1);
    }

    await post.save();

    res.json({ success: true, likes: reply.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa câu trả lời (Reply)
// @route   DELETE /api/posts/:id/comment/:commentId/reply/:replyId
const deleteReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;
    const { email } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const user = await User.findOne({ email });
    if (reply.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền xóa reply này" });
    }

    comment.replies.pull(replyId);
    await post.save();

    await post.populate({
      path: 'comments.replies.user',
      select: 'student_name name avatar role club_info'
    });

    const updatedComment = post.comments.id(commentId);
    res.json({ success: true, replies: updatedComment.replies });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sửa câu trả lời (Reply)
// @route   PUT /api/posts/:id/comment/:commentId/reply/:replyId
const editReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;
    const { email, content } = req.body;

    const post = await Post.findById(id);
    const comment = post.comments.id(commentId);
    const reply = comment.replies.id(replyId);
    const user = await User.findOne({ email });

    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền sửa reply này" });
    }

    reply.content = content;
    await post.save();

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Xóa bài viết
// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body; 
    // 1. Tìm bài viết
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }

    // 2. Tìm User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (post.author.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bài viết này" });
    }

    // 4. Xóa bài viết
    await Post.findByIdAndDelete(id);
    res.json({ success: true, message: "Đã xóa bài viết" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Đánh dấu sản phẩm đã bán (Hết hàng)
// @route   PUT /api/posts/:id/sold
const markPostAsSold = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Người dùng không hợp lệ" });

    // Chỉ chủ bài viết mới được đánh dấu
    if (post.author.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền sửa bài viết này" });
    }

    // Cập nhật số lượng về 0 (Hết hàng)
    post.quantity = 0;
    await post.save();

    res.json({ success: true, message: "Đã cập nhật trạng thái hết hàng" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLikePost,
  commentPost,
  toggleLikeComment,
  deleteComment,
  editComment,
  replyToComment,
  toggleLikeReply,
  deleteReply,
  editReply,
  deletePost,
  markPostAsSold
};