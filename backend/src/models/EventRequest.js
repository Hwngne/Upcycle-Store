// models/eventRequest.js
import mongoose from "mongoose";

const eventRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    topic: String,
    description: String,
    location: String,
    date: mongoose.Schema.Types.Mixed, 
    isPaid: { type: Boolean, default: false },
    price: { 
      type: mongoose.Schema.Types.Mixed, 
      default: 0 
    },

    bannerUrl: String,
    attachmentUrl: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    promotionStatus:{
      type: String,
      enum: ["none", "pending", "active", "approved", "rejected"],
      default: "none",
    },

    promotionStartDate: String,
    promotionEndDate: String,
    
    contactName: String,
    contactEmail: String,
    contactPhone: String,
    formLink: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  { timestamps: true }
);

export default mongoose.model("EventRequest", eventRequestSchema);