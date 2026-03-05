const path = require('path');
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const cron = require('node-cron');
const { checkExpiredTransactions } = require('./src/controllers/giftController');
const Message = require('./src/models/messageModel'); 
const Notification = require('./src/models/notificationModel');
const User = require('./src/models/userModel');

dotenv.config();
connectDB();

try {
    require('./src/models/userModel'); 
    require('./src/models/postModel');
    require('./src/models/wasteStationModel'); 
    require('./src/models/giftModel');
    require('./src/models/earningModel')
    require('./src/models/articleModel')
    require('./src/models/quizModel');
    require('./src/models/messageModel'); 
    require('./src/models/notificationModel');
} catch (error) {
    console.error("⚠️ Lỗi nạp Model:", error.message);
}

// ... (Phần import Routes cũ giữ nguyên) ...
const uploadRoutes = require('./src/routes/uploadRoutes');
const userRoutes = require('./src/routes/userRoutes');
const postRoutes = require('./src/routes/postRoutes');
const wasteStationRoutes = require('./src/routes/wasteStationRoutes');
const giftRoutes = require('./src/routes/giftRoutes');
const earnRoutes = require('./src/routes/earnRoutes');
const eventRequestRouter = require('./src/routes/eventRequestRouter');
const configRouter = require('./src/routes/configRoutes');
const chatRoutes = require('./src/routes/chatRoutes'); 
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();

// 3. Cấu hình CORS cho cả Express và Socket
app.use(cors());
app.use(express.json());

// 4. Tạo HTTP Server từ Express App
const server = http.createServer(app);

// 5. Khởi tạo Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// --- LOGIC SOCKET.IO ---
let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`⚡ Kết nối mới: ${socket.id}`);

  // 1. Sự kiện: Người dùng báo danh "Tôi đã Online"
  socket.on('user_online', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`🟢 User Online: ${userId}`);
      io.emit('get_online_users', Array.from(onlineUsers.keys()));
    }
  });

  // 2. Sự kiện: Tham gia phòng chat
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} đã vào phòng: ${roomId}`);
  });

  //3. Sự kiện gửi tin nhắn
  socket.on('send_message', async (data, callback) => {
    // Lưu vào Database
    try {
        const newMessage = new Message({
            sender: data.senderId,
            receiver: data.receiverId,
            content: data.content,
            type: data.type || 'text'
        });
        await newMessage.save();
        const messageToSend = {
            _id: newMessage._id,          
            sender: data.senderId,        
            receiver: data.receiverId,    
            content: data.content,
            createdAt: newMessage.createdAt, 
            timestamp: newMessage.createdAt  
        };
        
        io.to(data.roomId).emit('receive_message', messageToSend);

        const sender = await User.findById(data.senderId).select('student_name club_info email');
        let senderName = "Người dùng ẩn danh";
        if (sender) {
            senderName = sender.student_name || (sender.club_info ? sender.club_info.club_name : sender.email);
        }

        // 2. Tóm tắt nội dung 
        let messagePreview = data.type === 'image' ? '[Hình ảnh]' : data.content;

        // 3. Tạo và lưu thông báo
        const newNoti = new Notification({
            user: data.receiverId, 
            title: `Tin nhắn từ ${senderName}`,
            message: messagePreview,
            type: 'chat', 
            isRead: false
        });
        await newNoti.save();

        if (callback) {
            callback({
                status: 'ok',
                data: messageToSend
            });
        }
        
    } catch (e) {
        console.log("Lỗi lưu tin nhắn Socket:", e);
    }
  });

  socket.on('revoke_message', async (data) => {
    try {
      const updatedMsg = await Message.findByIdAndUpdate(
        data.messageId,
        { 
            content: "Tin nhắn đã bị thu hồi", 
            type: "revoked" 
        },
        { new: true }
      );

      if (updatedMsg) {
        io.to(data.roomId).emit('message_revoked', { 
            messageId: data.messageId,
            content: "Tin nhắn đã bị thu hồi"
        });
      }
    } catch (e) {
      console.log("Lỗi thu hồi:", e);
    }
  });

  // 2. SỰ KIỆN: SỬA TIN NHẮN
  socket.on('edit_message', async (data) => {
    try {
      const updatedMsg = await Message.findByIdAndUpdate(
        data.messageId,
        { 
            content: data.newContent, 
            isEdited: true 
        },
        { new: true }
      );

      if (updatedMsg) {
        io.to(data.roomId).emit('message_edited', { 
            messageId: data.messageId,
            newContent: data.newContent
        });
      }
    } catch (e) {
      console.log("Lỗi sửa tin nhắn:", e);
    }
  });
  
  //  XÓA PHÍA TÔI
  socket.on('delete_for_me', async (data) => {
      try {
          await Message.findByIdAndUpdate(data.messageId, {
              $addToSet: { deletedBy: data.userId }
          });
      } catch (e) { console.log(e); }
  });
  // 5. SỰ KIỆN: ĐANG SOẠN TIN (Typing)
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('display_typing', { 
        userId: socket.id, 
        isTyping: data.isTyping 
    });
  });

  socket.on('disconnect', () => {
  });
});

app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/wastestations', wasteStationRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/earn', earnRoutes);
app.use('/api/event-requests', eventRequestRouter);
app.use('/api/config', configRouter);
app.use('/api/chat', chatRoutes); 
app.use('/api/notifications', notificationRoutes);

const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads')));
cron.schedule('* * * * *', () => {
    checkExpiredTransactions();
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server Socket đang chạy ở cổng ${PORT}`);
});