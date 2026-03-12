// src/models/WasteStation.js
import mongoose from "mongoose";

const wasteStationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "Rác y tế",
                "Rác công nghiệp",
                "Rác sinh học",
                "Rác hữu cơ",
                "Rác hỗn hợp",
                "Rác điện tử",
                "Rác sinh hoạt",
            ],
        },
        area: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        contact: {
            type: String,
            trim: true,
        },
        // Có thể thêm tọa độ GPS sau này
        latitude: { type: Number },
        longitude: { type: Number },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const WasteStation = mongoose.model("WasteStation", wasteStationSchema);
export default WasteStation;