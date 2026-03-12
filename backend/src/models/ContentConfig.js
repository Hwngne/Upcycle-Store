// src/models/ContentConfig.js
import mongoose from "mongoose";

const contentConfigSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            enum: ["topic", "product_type"], // "topic" = Chủ đề bài viết, "product_type" = Loại sản phẩm
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Đảm bảo tên + category là unique
contentConfigSchema.index({ category: 1, name: 1 }, { unique: true });

const ContentConfig = mongoose.model("ContentConfig", contentConfigSchema);
export default ContentConfig;