import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        is_correct: { type: Boolean, default: false },
    },
    { _id: false }
);

const questionSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        answers: {
            type: [answerSchema],
            validate: v => v.length === 4,
        },
        score: { type: Number, default: 1 },
    },
    { _id: false }
);

const quizSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        time_limit: { type: Number, required: true },
        //max_points: { type: Number, required: true },
        rewardActivity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
            required: true,
        },

        rewardPoint: {
            type: Number,
            required: true,
            min: 0,
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

        visible: { type: Boolean, default: false },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
        },
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model("Quiz", quizSchema);
