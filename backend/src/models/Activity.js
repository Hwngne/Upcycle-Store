// import mongoose from "mongoose";

// const activitySchema = new mongoose.Schema(
//     {
//         role: {
//             type: String,
//             required: true,
//             enum: ["student", "club"]
//         },
//         name: {
//             type: String,
//             required: true,
//             trim: true
//         },
//         hunted_point: {
//             type: Number,
//             required: true,
//             min: 0
//         }, 

//         type: {
//             type: String,
//             enum: ["normal", "spin", "quiz"],
//             default: "normal"
//         },

//         active:{
//             type: Boolean,
//             default: true
//         },
        

//         description: { type: String, default: "" },   // mô tả optional
//         iconName: { type: String, default: "Trophy" }, // icon optional
//         isEditable: { type: Boolean, default: true }, // có thể sửa/xóa
//         order: { type: Number, default: 0 },          // sắp xếp
//     },
//     { timestamps: true, versionKey: false }
// );


// if (process.env.NODE_ENV !== "production") {
//     activitySchema.pre("save", async function () {
//         try {
//             await this.collection.dropIndex("name_1");
//         } catch (err) {
//             if (err.codeName !== "IndexNotFound") {
//                 console.error("Lỗi drop index cũ trong dev:", err);
//             }
//         }
//     });
// }


// activitySchema.index({ role: 1, name: 1 }, { unique: true });

// activitySchema.statics.existsForRole = async function (role, name) {
//     return await this.findOne({ role, name });
// };

// const Activity = mongoose.model("Activity", activitySchema);
// export default Activity;

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