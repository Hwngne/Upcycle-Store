import mongoose from "mongoose";

const contentConfigSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            index: true, 
            enum: ["topic", "product_type"],
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

contentConfigSchema.index({ category: 1, name: 1 }, { unique: true });

const ContentConfig = mongoose.models.ContentConfig || mongoose.model("ContentConfig", contentConfigSchema);
export default ContentConfig;