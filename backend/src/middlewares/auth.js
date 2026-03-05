import jwt from "jsonwebtoken";


export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Thiếu token xác thực",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET chưa được cấu hình");
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            _id: decoded.id,
            role: decoded.role,
            email: decoded.email,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Token không hợp lệ hoặc đã hết hạn",
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập",
            });
        }
        next();
    };
};
