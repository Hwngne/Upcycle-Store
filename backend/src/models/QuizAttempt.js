// src/models/QuizAttempt.js
import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
        },

        answers: [
            {
                question_index: Number,
                selected_answer_index: Number,
            },
        ],

        score: {
            type: Number,
            default: 0,
        },

        is_passed: {
            type: Boolean,
            default: false,
        },

        earned_points: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model("QuizAttempt", quizAttemptSchema);
