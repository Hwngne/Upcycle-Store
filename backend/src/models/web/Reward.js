import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
    },
    
    giftId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gift",
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },
    rewardCode: {
        type: String,
        unique: true,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "expired", "cancelled"],
        default: "pending",
    },
    exchangedAt: {
        type: Date,
        default: Date.now,
    },
    receivedAt: Date,
    expiredAt: {
        type: Date,
        default: () => Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
}, {
   
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


rewardSchema.virtual('gift', {
    ref: 'Gift',
    localField: 'giftId',       
    foreignField: '_id',        
    justOne: true               
});

rewardSchema.pre("save", async function () {
    if (this.isNew) {
        const count = await mongoose.model("Reward").countDocuments();
        this.rewardCode = `RW-${String(count + 1000).padStart(4, "0")}`;
    }
});

export default mongoose.model("Reward", rewardSchema);