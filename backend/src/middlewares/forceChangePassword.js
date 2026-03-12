import Account from "../models/Account.js";

export const forceChangePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const account = await Account.findById(userId);

        if (!account) {
            return res.status(401).json({
                message: "Tài khoản không tồn tại",
            });
        }

        // Nếu bị khóa hoặc đã bị xóa (phòng thủ)
        if (account.status === "locked") {
            return res.status(403).json({
                message: "Tài khoản đã bị khóa",
            });
        }

        // Nếu chưa đổi mật khẩu lần đầu → chặn
        if (account.change_password === true) {
            return res.status(403).json({
                message: "Vui lòng đổi mật khẩu trước khi sử dụng hệ thống",
                code: "FORCE_CHANGE_PASSWORD",
            });
        }

        next();
    } catch (error) {
        console.error("Lỗi forceChangePassword:", error);
        return res.status(500).json({
            message: "Lỗi hệ thống",
        });
    }
};
