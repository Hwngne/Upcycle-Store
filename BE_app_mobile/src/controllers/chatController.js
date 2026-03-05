const Message = require('../models/messageModel');

// Lấy lịch sử tin nhắn giữa 2 người
exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
    .sort({ createdAt: -1 }) 
    .skip(skip)              
    .limit(limit)            
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar');
    

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy tin nhắn', error: error.message });
  }
};

// Lấy danh sách các cuộc hội thoại (Inbox)
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.params.userId;
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    })
    .sort({ createdAt: -1 }) 
    .populate('sender', 'student_name admin_name club_info email avatar role') 
    .populate('receiver', 'student_name admin_name club_info email avatar role'); 

    const conversationMap = new Map();

    messages.forEach(msg => {
      // 1. Kiểm tra an toàn dữ liệu
      if (!msg.sender || !msg.receiver) return;

      const isSender = msg.sender._id.toString() === currentUserId;
      const partner = isSender ? msg.receiver : msg.sender;

      // Nếu user bị xóa
      if (!partner) return;

      const partnerId = partner._id.toString();

      if (!conversationMap.has(partnerId)) {
        let displayName = partner.email.split('@')[0]; 
        
        // Ưu tiên 1: Tên sinh viên
        if (partner.student_name && partner.student_name.trim() !== "") {
            displayName = partner.student_name;
        } 
        // Ưu tiên 2: Tên Admin
        else if (partner.admin_name && partner.admin_name.trim() !== "") {
            displayName = partner.admin_name;
        }
        // Ưu tiên 3: Tên CLB
        else if (partner.club_info && partner.club_info.club_name) {
            displayName = partner.club_info.club_name;
        }
        conversationMap.set(partnerId, {
          partnerId: partnerId,
          partnerName: displayName, 
          partnerAvatar: partner.avatar || "https://i.pravatar.cc/150?img=3",
          lastMessage: msg.content,
          lastMessageSenderId: msg.sender._id.toString(),
          time: msg.createdAt,
          isRead: msg.isRead
        });
      }
    });

    const conversations = Array.from(conversationMap.values());
    res.status(200).json(conversations);

  } catch (error) {
    console.error("❌ Lỗi getConversations:", error);
    res.status(500).json({ message: 'Lỗi lấy danh sách chat', error: error.message });
  }
};

// Đánh dấu đã đọc tin nhắn của một cuộc hội thoại
exports.markAsRead = async (req, res) => {
  try {
    const { userId, partnerId } = req.body;
    await Message.updateMany(
      { sender: partnerId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hàm upload ảnh tin nhắn
exports.uploadMessageImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Chưa chọn file' });
    }
    const imageUrl = `/uploads/chat/${req.file.filename}`;
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};