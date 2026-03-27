import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    hunted_point: {
      type: Number,
      required: true,
      min: 0
    },

    type: {
      type: String,
      enum: ["normal", "spin", "quiz"],
      default: "normal"
    },

    active: {
      type: Boolean,
      default: true
    },

    description: { type: String, default: "" },
    iconName: { type: String, default: "Trophy" },
    isEditable: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;