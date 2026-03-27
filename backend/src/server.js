import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import "./cron/promotionCron.js";

import accountsRoute from "./routes/accountsRoute.js";
import authRoutes from "./routes/authRoutes.js";
import wasteStationsRoute from "./routes/wasteStationsRoute.js";
import wasteConfigRoute from "./routes/wasteConfigRoute.js";
import rewardsRoute from "./routes/rewardsRoute.js";
import contentConfigRoute from "./routes/contentConfigRoute.js";
import activityAdminRoutes from "./routes/activityAdminRoutes.js";
import quizRoute from "./routes/quizRoute.js";
import spinConfigRoutes from "./routes/spinConfigRoutes.js";
import articleRoute from "./routes/articleRoute.js";
import videoRoutes from "./routes/videoRoute.js";
import eventRequestRoutes from "./routes/eventRoute.js";
import statsRoutes from "./routes/statsRoutes.js";
import activityHistoryRoutes from "./routes/activityHistoryRoutes.js";
import adminAlertRoute from "./routes/adminAlertRoute.js";

import { authenticate } from "./middlewares/auth.js";
import { requireChangedPassword } from "./middlewares/requireChangedPassword.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5001;


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

global.cloudinary = cloudinary;

const allowedOrigins = [
  "http://localhost:5173",
  "https://doan-environment.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {

      // allow server-to-server or Postman
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],

    credentials: true,

    optionsSuccessStatus: 200,
  })
);

app.options("*", cors());

app.use(express.json());
app.use(cookieParser());


connectDB();



app.get("/", (req, res) => {
  res.send("Backend is running");
});


app.use("/api/auth", authRoutes);






app.use(
  "/api/accounts",
  authenticate,
  requireChangedPassword,
  accountsRoute
);


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
  console.log(`🚀 Server running on port ${PORT}`);
});