// backend/utils/token.js
import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Access token ngắn: 1 giờ
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
        },
        process.env.REFRESH_SECRET, // Secret riêng cho refresh token
        { expiresIn: "30d" } // Refresh token dài: 30 ngày
    );
};