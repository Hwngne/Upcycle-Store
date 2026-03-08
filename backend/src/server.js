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
const PORT = process.env.PORT || 5001;


// app.use(
//     cors({
//         origin: "http://localhost:5173", 
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );

const allowedOrigins = [
  "http://localhost:5173",
  "https://doan-admin.onrender.com",
  "https://doan-environment.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
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