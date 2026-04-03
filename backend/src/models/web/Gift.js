// src/models/Gift.js
import mongoose from "mongoose";

const giftSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },
    imageUrl: {
        type: String,
        default: "https://via.placeholder.com/150",
    },
    point: {
        type: Number,
        required: true,
        min: 1,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    visible: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

giftSchema.pre("save", async function () {
    this.updatedAt = Date.now();
});

const Gift = mongoose.models.Gift || mongoose.model('Gift', giftSchema);
export default Gift;