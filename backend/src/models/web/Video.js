import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Vui lòng nhập tiêu đề video"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        thumbnailUrl: {
            type: String,
            required: [true, "Vui lòng cung cấp ảnh thu nhỏ"],
        },
        videoUrl: {
            type: String,
            required: [true, "Vui lòng cung cấp link video"],
        },
        publicId: {
            type: String,
            required: true, 
        },
        rewardActivity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
        },
        rewardPoint: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["published", "draft"],
            default: "draft", // Dùng logic Web: Video tải lên mặc định là nháp, duyệt xong mới cho lên App
        },
        visible: {
            type: Boolean,
            default: false, // Mặc định ẩn
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
    },
    { 
        timestamps: true,
        versionKey: false // Thêm vào cho sạch data
    }
);

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);
export default Video;