// src/models/WasteConfig.js
import mongoose from "mongoose";

const wasteConfigSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            enum: ["waste_type", "area"], 
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

// Index để đảm bảo name + category là unique
wasteConfigSchema.index({ category: 1, name: 1 }, { unique: true });

const WasteConfig = mongoose.model("WasteConfig", wasteConfigSchema);
export default WasteConfig;