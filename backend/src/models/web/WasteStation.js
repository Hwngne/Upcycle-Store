import mongoose from "mongoose";

const wasteStationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Vui lòng nhập tên trạm"],
            trim: true,
        },
        address: {
            type: String,
            required: [true, "Vui lòng nhập địa chỉ"],
            trim: true,
        },
        // --- Các trường từ Web ---
        type: {
            type: String,
            required: true,
            enum: [
                "Rác y tế", "Rác công nghiệp", "Rác sinh học", 
                "Rác hữu cơ", "Rác hỗn hợp", "Rác điện tử", "Rác sinh hoạt",
            ],
        },
        area: {
            type: String,
            required: true,
            trim: true,
        },
        contact: {
            type: String,
            trim: true,
        },
        // --- Các trường từ Mobile ---
        latitude: { 
            type: Number, 
            required: true,
            default: 10.7769 
        },
        longitude: { 
            type: Number, 
            required: true,
            default: 106.7009 
        },
        imageUrl: {
            type: String,
            default: 'https://via.placeholder.com/150'
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const WasteStation = mongoose.models.WasteStation || mongoose.model('WasteStation', wasteStationSchema);
export default WasteStation;