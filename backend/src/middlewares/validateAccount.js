import Account from "../models/Account.js";

export const validateCreateAccount = async (req, res, next) => {
    try {
        const { email, phone_number, student_code, role } = req.body;

        // Check email
        if (email) {
            const existedEmail = await Account.findOne({ email });
            if (existedEmail) {
                return res.status(409).json({
                    message: "Email đã tồn tại",
                });
            }
        }

        // Check phone number
        if (phone_number) {
            const existedPhone = await Account.findOne({ phone_number });
            if (existedPhone) {
                return res.status(409).json({
                    message: "Số điện thoại đã được sử dụng",
                });
            }
        }

        // Check student_code
        if (role === "student" && student_code) {
            const existedCode = await Account.findOne({ student_code });
            if (existedCode) {
                return res.status(409).json({
                    message: "Mã sinh viên đã tồn tại",
                });
            }
        }

        next();
    } catch (error) {
        console.error("Lỗi validateCreateAccount:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
