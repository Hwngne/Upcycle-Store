import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        rewardActivity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: true
        },

        rewardPoint: {
        type: Number,
        required: true,
        min: 0
        },
        content: {
            type: String,
            required: true,
        },


        authorName: {
            type: String,
            required: true,
            trim: true,
        },

        thumbnail: {
            type: String,
            default: null,
        },

        // Quiz gắn kèm (optional)
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            default: null,
        },

        // Phân loại hiển thị
        displayType: {
            type: String,
            enum: ["hunt", "home"], // hunt: săn điểm | home: trang chủ
            required: true,
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },

        visible: {
            type: Boolean,
            default: true,
        },

        views: {
            type: Number,
            default: 0,
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model("Article", articleSchema);
