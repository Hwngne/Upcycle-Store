import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        rewardActivity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
        },

        rewardPoint: {
            type: Number,
            default: 0,
        },
        publicId: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            default: "",
        },
        thumbnailUrl: {
            type: String,
            required: true,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["published", "draft"],
            default: "draft",
        },
        visible: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },

    },
    { timestamps: true }
);


export default mongoose.model("Video", videoSchema);
