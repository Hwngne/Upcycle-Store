import dotenv from "dotenv";
dotenv.config();
import {v2 as cloudinary} from  "cloudinary";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary config loaded:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
});

// Export global để controller dùng
global.cloudinary = cloudinary;



import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import cron from 'node-cron';
//import accountsRoute from "./routes/accountsRoute.js";
import accountsRoute from "./routes/accountsRoute.js";
import authRoutes from "./routes/authRoutes.js";
import { authenticate } from "./middlewares/auth.js";
import { requireChangedPassword } from "./middlewares/requireChangedPassword.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import wasteStationsRoute from "./routes/wasteStationsRoute.js";
import wasteConfigRoute from "./routes/wasteConfigRoute.js";
import rewardsRoute from "./routes/rewardsRoute.js";
import contentConfigRoute from "./routes/contentConfigRoute.js";
import activityAdminRoutes from "./routes/activityAdminRoutes.js";
import quizRoute from "./routes/quizRoute.js";
import spinConfigRoutes from "./routes/spinConfigRoutes.js";
import articleRoute from "./routes/articleRoute.js";
import videoRoutes from "./routes/videoRoute.js";
import eventRequestRoutes from "./routes/eventRoute.js"
import EventRequest from "./models/EventRequest.js";
import statsRoutes from "./routes/statsRoutes.js";
import "./cron/promotionCron.js"
import activityHistoryRoutes from "./routes/activityHistoryRoutes.js";
import adminAlertRoute from "./routes/adminAlertRoute.js";

const app = express();

// Manual CORS để bypass nếu proxy Render strip headers
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Log để check Render logs sau
  console.log(`[CORS DEBUG] Incoming Origin: ${origin || 'no-origin'}, Method: ${req.method}`);

  // Cho phép exact + vercel domains
  const isAllowed = !origin || 
    origin === 'https://doan-environment.vercel.app' ||
    origin === 'http://localhost:5173' ||
    (origin && origin.endsWith('.vercel.app') && origin.startsWith('https://'));

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');  // fallback * nếu no origin
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');  // cache preflight 24h
  }

  // Handle OPTIONS preflight manual (trả ngay 200, không chờ logic khác)
  if (req.method === 'OPTIONS') {
    console.log('[CORS DEBUG] Handling OPTIONS preflight');
    return res.sendStatus(200);
  }

  next();
});
const PORT = process.env.PORT || 5001;


// app.use(
//     cors({
//         origin: "http://localhost:5173", 
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );
app.use(cors({
  origin: function (origin, callback) {
    // Cho phép các origin cụ thể + localhost + vercel domains
    const allowedOrigins = [
      'http://localhost:5173',
      'https://doan-environment.vercel.app',
      // Nếu có preview branches: thêm regex
    ];
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200, // Một số browser cũ cần 200 thay 204
  maxAge: 86400, // Cache preflight 24h
}));

// Explicit handle preflight cho mọi route (dự phòng)
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
    res.send("Backend is running");
});

// ===== ROUTE KHÔNG CẦN TOKEN =====
app.use("/api/auth", authRoutes);

// ===== ROUTE CẦN TOKEN =====
app.use("/api/accounts", authenticate, requireChangedPassword, accountsRoute);

// // ===== GLOBAL ERROR =====
// app.use(errorHandler);

app.use("/api/rewards", rewardsRoute);

app.use("/api/waste-stations", wasteStationsRoute);

app.use("/api/waste-config", wasteConfigRoute);

app.use("/api/content-config", contentConfigRoute);

app.use("/api/admin/activities", activityAdminRoutes);

app.use("/api/quizzes", quizRoute);

app.use("/api/spin-config", spinConfigRoutes);

app.use("/api/articles", articleRoute);

app.use("/api/videos", videoRoutes);

app.use("/api", eventRequestRoutes);

app.use("/api/activity-histories", activityHistoryRoutes);

app.use("/api/admin/alerts", adminAlertRoute);
app.use("/api/admin/stats", statsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});