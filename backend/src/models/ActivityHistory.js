// import mongoose from "mongoose";

// const activityHistorySchema = new mongoose.Schema(
//   {
//     actor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Account",
//       required: true,
//     },

//     actorRole: {
//       type: String,
//       enum: ["admin", "student", "club"],
//       required: true,
//     },

//     action: {
//       type: String,
//       required: true,
//     },

//     description: {
//       type: String,
//       required: true,
//     },

//     targetType: String,
//     targetId: mongoose.Schema.Types.ObjectId,
//   },
//   { timestamps: true }
// );

// const ActivityHistory = mongoose.model(
//   "ActivityHistory",
//   activityHistorySchema
// );

// export default ActivityHistory;
import mongoose from "mongoose";

const activityHistorySchema = new mongoose.Schema(
  {
    // 👤 Người thực hiện hành động (admin / user đăng nhập)
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    actorRole: {
      type: String,
      enum: ["admin", "student", "club"],
      required: true,
    },

    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },

    targetType: {
      type: String,
    },

    action: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const ActivityHistory = mongoose.model(
  "ActivityHistory",
  activityHistorySchema
);

export default ActivityHistory;
