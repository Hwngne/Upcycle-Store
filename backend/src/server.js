import dotenv from "dotenv";
//dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

// --- 1. CONFIG & DB & CRON ---
import { connectDB } from "./config/db.js";
import { cloudinary } from "./config/cloudinary.js"; 
global.cloudinary = cloudinary;
import "./cron/promotionCron.js"; 
import { checkExpiredTransactions } from "./controllers/mobile/giftController.js"; 

// --- 2. IMPORT MODELS CHO SOCKET.IO ---
import Message from './models/mobile/messageModel.js'; 
import Notification from './models/mobile/notificationModel.js';
import User from './models/mobile/userModel.js';

// --- 3. IMPORT ROUTES CỦA WEB ADMIN ---
import accountsRoute from "./routes/web/accountsRoute.js";
import authRoutes from "./routes/web/authRoutes.js";
import wasteStationsRoute from "./routes/web/wasteStationsRoute.js";
import wasteConfigRoute from "./routes/web/wasteConfigRoute.js";
import rewardsRoute from "./routes/web/rewardsRoute.js";
import contentConfigRoute from "./routes/web/contentConfigRoute.js";
import activityAdminRoutes from "./routes/web/activityAdminRoutes.js";
import quizRoute from "./routes/web/quizRoute.js";
import spinConfigRoutes from "./routes/web/spinConfigRoutes.js";
import articleRoute from "./routes/web/articleRoute.js";
import videoRoutes from "./routes/web/videoRoute.js";
import eventRequestRoutes from "./routes/web/eventRoute.js";
import statsRoutes from "./routes/web/statsRoutes.js";
import activityHistoryRoutes from "./routes/web/activityHistoryRoutes.js";
import adminAlertRoute from "./routes/web/adminAlertRoute.js";

// --- 4. IMPORT ROUTES CỦA MOBILE APP ---
import mobileUserRoutes from './routes/mobile/userRoutes.js';
import mobileUploadRoutes from './routes/mobile/uploadRoutes.js';
import mobilePostRoutes from './routes/mobile/postRoutes.js';
import mobileWasteStationRoutes from './routes/mobile/wasteStationRoutes.js';
import mobileGiftRoutes from './routes/mobile/giftRoutes.js';
import mobileEarnRoutes from './routes/mobile/earnRoutes.js';
import mobileEventRequestRouter from './routes/mobile/eventRequestRouter.js';
import mobileConfigRouter from './routes/mobile/configRoutes.js';
import mobileChatRoutes from './routes/mobile/chatRoutes.js'; 
import mobileNotificationRoutes from './routes/mobile/notificationRoutes.js';
import mobileOrderRoutes from './routes/mobile/orderRoutes.js';

// --- 5. IMPORT MIDDLEWARES ---
import { authenticate } from "./middlewares/auth.js";
import { requireChangedPassword } from "./middlewares/requireChangedPassword.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// ==========================================
// KHỞI TẠO APP & MIDDLEWARES CƠ BẢN
// ==========================================
const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://doan-environment.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

// Thư mục tĩnh cho Mobile Uploads
const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, 'uploads')));

// Kết nối DB
console.log("👉 [1] Bắt đầu kết nối MongoDB...");
connectDB();
console.log("✅ [2] Đã đi qua hàm connectDB.");
// ==========================================
// KHỞI TẠO HTTP SERVER & SOCKET.IO (CHAT)
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(` Kết nối Socket mới: ${socket.id}`);

  socket.on('user_online', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(` User Online: ${userId}`);
      io.emit('get_online_users', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} đã vào phòng: ${roomId}`);
  });

  socket.on('send_message', async (data, callback) => {
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

        let messagePreview = data.type === 'image' ? '[Hình ảnh]' : data.content;

        const newNoti = new Notification({
            user: data.receiverId, 
            title: `Tin nhắn từ ${senderName}`,
            message: messagePreview,
            type: 'chat', 
            isRead: false
        });
        await newNoti.save();

        if (callback) callback({ status: 'ok', data: messageToSend });
    } catch (e) {
        console.log("Lỗi lưu tin nhắn Socket:", e);
    }
  });

  socket.on('revoke_message', async (data) => {
    try {
      const updatedMsg = await Message.findByIdAndUpdate(
        data.messageId,
        { content: "Tin nhắn đã bị thu hồi", type: "revoked" },
        { new: true }
      );
      if (updatedMsg) {
        io.to(data.roomId).emit('message_revoked', { 
            messageId: data.messageId, content: "Tin nhắn đã bị thu hồi" 
        });
      }
    } catch (e) { console.log("Lỗi thu hồi:", e); }
  });

  socket.on('edit_message', async (data) => {
    try {
      const updatedMsg = await Message.findByIdAndUpdate(
        data.messageId,
        { content: data.newContent, isEdited: true },
        { new: true }
      );
      if (updatedMsg) {
        io.to(data.roomId).emit('message_edited', { 
            messageId: data.messageId, newContent: data.newContent 
        });
      }
    } catch (e) { console.log("Lỗi sửa tin nhắn:", e); }
  });
  
  socket.on('delete_for_me', async (data) => {
      try {
          await Message.findByIdAndUpdate(data.messageId, {
              $addToSet: { deletedBy: data.userId }
          });
      } catch (e) { console.log(e); }
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('display_typing', { 
        userId: socket.id, isTyping: data.isTyping 
    });
  });

  socket.on('disconnect', () => {
     // Xử lý khi user ngắt kết nối (tuỳ chọn)
  });
});

// CRON JOBS LẬP LỊCH
import cron from 'node-cron';
cron.schedule('* * * * *', () => {
    checkExpiredTransactions(); 
});

app.get("/", (req, res) => {
  res.send(" Backend (Web + Mobile + Socket) is running perfectly!");
});

//  1. ROUTES CỦA WEB ADMIN 
app.use("/api/auth", authRoutes);
app.use("/api/accounts", authenticate, requireChangedPassword, accountsRoute);
app.use("/api/rewards", rewardsRoute);
app.use("/api/waste-stations", wasteStationsRoute);
app.use("/api/waste-config", wasteConfigRoute);
app.use("/api/content-config", contentConfigRoute);
app.use("/api/admin/activities", activityAdminRoutes);
app.use("/api/quizzes", quizRoute);
app.use("/api/spin-config", spinConfigRoutes);
app.use("/api/articles", articleRoute);
app.use("/api/videos", videoRoutes);
app.use("/api/events", eventRequestRoutes); 
app.use("/api/activity-histories", activityHistoryRoutes);
app.use("/api/admin/alerts", adminAlertRoute);
app.use("/api/admin/stats", statsRoutes);

//  2. ROUTES CỦA MOBILE APP (Tiền tố /api/mobile) 
app.use('/api/mobile/users', mobileUserRoutes);
app.use('/api/mobile/upload', mobileUploadRoutes);
app.use('/api/mobile/posts', mobilePostRoutes);
app.use('/api/mobile/wastestations', mobileWasteStationRoutes);
app.use('/api/mobile/gifts', mobileGiftRoutes);
app.use('/api/mobile/earn', mobileEarnRoutes);
app.use('/api/mobile/event-requests', mobileEventRequestRouter);
app.use('/api/mobile/config', mobileConfigRouter);
app.use('/api/mobile/chat', mobileChatRoutes); 
app.use('/api/mobile/notifications', mobileNotificationRoutes);
app.use('/api/mobile/transactions', mobileOrderRoutes);


// Xử lý lỗi toàn cục
app.use(errorHandler);

// START SERVER
console.log("👉 [3] Đang chuẩn bị mở Port...");
server.listen(PORT,'0.0.0.0', () => {
  console.log(` Server đang chạy trên cổng ${PORT}`);
});
