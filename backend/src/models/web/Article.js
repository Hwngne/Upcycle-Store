import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Vui lòng nhập tiêu đề"],
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Vui lòng nhập nội dung"],
        },
        authorName: {
            type: String,
            required: true,
            trim: true,
            default: "Admin" 
        },
        thumbnail: {
            type: String,
            default: null,
        },
        rewardActivity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
            required: false 
        },
        rewardPoint: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        readingTime: { 
            type: Number, 
            default: 30 
        },
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            default: null,
        },
        displayType: {
            type: String,
            enum: ["hunt", "home"],
            default: "home",
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
        collection: 'articles' 
    }
);

const Article = mongoose.models.Article || mongoose.model("Article", articleSchema);
export default Article;