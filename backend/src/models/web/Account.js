import mongoose from "mongoose";

const clubInfoSchema = new mongoose.Schema(
    {
        club_name: {
            type: String,
            required: true,
            trim: true,
        },
        president_name: {
            type: String,
            trim: true,
        },
        member_count: {
            type: Number,
            min: 0,
            default: 0,
        },
        club_phone: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const accountSchema = new mongoose.Schema(
    {
        // ===== DÙNG CHUNG =====
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["student", "club", "admin"],
        },
        status: {
            type: String,
            default: "active",
            enum: ["active", "locked", "deleted"],
        },
        phone_number: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        change_password: {
            type: Boolean,
            default: true,
        },

        total_points: {
            type: Number,
            default: 0,
            min: 0,
        },

       avatar: {
        type: String,
        default: function () {
            return `https://api.dicebear.com/7.x/adventurer/png?seed=${this._id}`;
        },
        },

        attendanceHistory: {
            type: [String],
            default: [],
        },
        dateOfBirth: {
            type: String,
            default: "",
        },
        totalScore: {
            type: Number,
            default: 0,
            min: 0,
        },

        student_code: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        student_name: {
            type: String,
            trim: true,
        },
        gender: {
            type: String,
            enum: ["M", "F"],
        },

        club_info: {
            type: clubInfoSchema,
            default: null,
        },
        admin_name: {
            type: String,
            trim: true,
        },
        admin_gender: {
            type: String,
            enum: ["M", "F"],
        },
        admin_phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },

        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Account = mongoose.model("Account", accountSchema);
export default Account;