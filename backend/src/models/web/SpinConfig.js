import mongoose from "mongoose";

const spinConfigSchema = new mongoose.Schema(
    {
        label: { type: String, required: true }, 
        rewardPoint: { type: Number, required: true, min: 0 }, 
        probability: {
            type: Number,
            required: true,
            min: 0,
            max: 100, // %
        },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model("SpinConfig", spinConfigSchema);
