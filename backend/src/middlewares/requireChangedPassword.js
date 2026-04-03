import Account from "../models/web/Account.js";

const EXCLUDE_PATHS = ["/api/auth/change-password", "/api/auth/login"];

export const requireChangedPassword = async (req, res, next) => {
    try {
        // Bỏ qua login & change-password
        if (EXCLUDE_PATHS.includes(req.originalUrl)) {
            return next();
        }

        const userId = req.user.id;
        const account = await Account.findById(userId).select("change_password");

        if (!account) {
            return res.status(401).json({
                message: "Tài khoản không tồn tại",
            });
        }

        if (account.change_password === true) {
            return res.status(403).json({
                message: "Vui lòng đổi mật khẩu trước khi sử dụng hệ thống",
                require_change_password: true,
            });
        }

        next();
    } catch (error) {
        console.error("requireChangedPassword error:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
