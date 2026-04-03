import mongoose from "mongoose";

// Schema con: Câu trả lời
const answerSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        is_correct: { type: Boolean, required: true, default: false }, 
    },
    { _id: false }
);

// Schema con: Câu hỏi
const questionSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        answers: {
            type: [answerSchema],
            validate: v => v.length === 4, 
        },
        score: { type: Number, default: 10 }, 
    },
    { _id: false }
);

// Schema chính: Quiz
const quizSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        
        time_limit: { 
            type: Number, 
            required: true, 
            default: 15 
        },
        
        max_points: { 
            type: Number, 
            default: 100 
        },

        rewardActivity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
            required: false, 
        },

        rewardPoint: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        questions: {
            type: [questionSchema],
            validate: v => v.length <= 5, 
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft", 
        },

        visible: { 
            type: Boolean, 
            default: false 
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account", 
        },
    },
    { 
        timestamps: true, 
        versionKey: false,
        collection: 'quizzes' 
    }
);

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export default Quiz;