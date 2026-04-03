import Account from "../../models/web/Account.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../../utils/token.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập email và mật khẩu",
            });
        }

        const account = await Account.findOne({
            email: email.toLowerCase().trim(),
            status: { $ne: "deleted" },
        });

        if (!account) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không đúng",
            });
        }

        if (account.status === "locked") {
            return res.status(403).json({
                message: "Tài khoản đã bị khóa",
            });
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không đúng",
            });
        }

        if (account.role !== "admin") {
            return res.status(403).json({
                message:
                    "Tài khoản này không được phép đăng nhập hệ thống quản trị",
            });
        }

        // const token = jwt.sign(
        //     {
        //         id: account._id,
        //         role: account.role,
        //         email: account.email,
        //     },
        //     process.env.JWT_SECRET,
        //     {
        //         expiresIn: process.env.JWT_EXPIRES || "1d",
        //     }
        // );

        // res.status(200).json({
        //     message: "Đăng nhập thành công",
        //     data: {
        //         token,
        //         user: {
        //             id: account._id,
        //             email: account.email,
        //             role: account.role,
        //             change_password: account.change_password,
        //         },
        //     },
        // });
        // Tạo Access Token (ngắn: 1h) và Refresh Token (dài: 30 ngày)
        const accessToken = generateAccessToken(account);
        const refreshToken = generateRefreshToken(account);

        // Lưu refresh token vào database (rất quan trọng để validate sau này)
        account.refreshToken = refreshToken;
        await account.save();

        // Gửi refresh token qua httpOnly cookie (an toàn, không bị JS truy cập)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Chỉ bật secure ở production
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        });

        // Trả về accessToken trong body (frontend sẽ lưu vào localStorage hoặc memory)
        res.status(200).json({
            message: "Đăng nhập thành công",
            data: {
                accessToken, // ← Đổi từ "token" thành "accessToken" để rõ nghĩa
                user: {
                    id: account._id,
                    email: account.email,
                    role: account.role,
                    change_password: account.change_password,
                },
            },
        });
    } catch (error) {
        console.error("Lỗi login:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};


export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới",
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                message: "Mật khẩu mới phải có ít nhất 8 ký tự",
            });
        }

        const account = await Account.findById(userId);
        if (!account) {
            return res.status(404).json({
                message: "Tài khoản không tồn tại",
            });
        }

        const isMatch = await bcrypt.compare(old_password, account.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Mật khẩu cũ không đúng",
            });
        }

        const isSamePassword = await bcrypt.compare(
            new_password,
            account.password
        );
        if (isSamePassword) {
            return res.status(400).json({
                message: "Mật khẩu mới không được trùng mật khẩu cũ",
            });
        }

        account.password = await bcrypt.hash(new_password, 10);
        account.change_password = false;
        await account.save();

        res.status(200).json({
            message: "Đổi mật khẩu thành công",
        });
    } catch (error) {
        console.error("Lỗi changePassword:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// export const logout = async (req, res) =>{
//     try {
//         return res.status(200).json({
//             message: "Đăng xuất thành công",
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: "Lỗi hệ thống",
//         });
//     }
// }

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // Xóa refresh token khỏi DB
            await Account.updateOne(
                { refreshToken },
                { $unset: { refreshToken: 1 } }
            );
        }

        // Xóa cookie ở client
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({
            message: "Đăng xuất thành công",
        });
    } catch (error) {
        console.error("Lỗi logout:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const me = async (req, res) => {
    try {
        const account = await Account.findById(req.user.id).select(
            "-password"
        );

        if (!account || account.status === "deleted") {
            return res.status(401).json({
                message: "Token không hợp lệ",
            });
        }

        if (account.status === "locked") {
            return res.status(403).json({
                message: "Tài khoản đã bị khóa",
            });
        }

        // res.status(200).json({
        //     id: account._id,
        //     email: account.email,
        //     role: account.role,
        //     status: account.status,
        //     phone_number: account.phone_number,
        //     student_code: account.student_code,
        //     student_name: account.student_name,
        //     gender: account.gender,
        //     club_info: account.club_info,
        //     change_password: account.change_password,
        //     createdAt: account.createdAt,
        // });

        res.status(200).json({
            id: account._id,
            email: account.email,
            role: account.role,
            status: account.status,
            phone_number: account.phone_number,
            student_code: account.student_code,
            student_name: account.student_name,
            gender: account.gender,
            club_info: account.club_info,
            admin_name: account.admin_name,
            admin_gender: account.admin_gender,
            admin_phone: account.admin_phone,
            change_password: account.change_password,
            createdAt: account.createdAt,
        });

    } catch (error) {
        console.error("Lỗi /me:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const refreshToken = async (req, res) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    // Không có cookie → từ chối
    if (!refreshTokenFromCookie) {
        return res.status(401).json({
            message: "Không có refresh token",
        });
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_SECRET);

        // Tìm user và kiểm tra refresh token có khớp trong DB không
        const account = await Account.findOne({
            _id: decoded.id,
            refreshToken: refreshTokenFromCookie,
            status: { $ne: "deleted" },
        });

        if (!account) {
            return res.status(403).json({
                message: "Refresh token không hợp lệ hoặc đã bị thu hồi",
            });
        }

        if (account.status === "locked") {
            return res.status(403).json({
                message: "Tài khoản đã bị khóa",
            });
        }

        if (account.role !== "admin") {
            return res.status(403).json({
                message: "Không có quyền truy cập",
            });
        }

        // Tạo access token mới
        const newAccessToken = generateAccessToken(account);

        res.status(200).json({
            accessToken: newAccessToken,
        });
    } catch (error) {
        // Token hết hạn hoặc lỗi verify
        console.error("Lỗi refresh token:", error);
        return res.status(403).json({
            message: "Refresh token hết hạn hoặc không hợp lệ",
        });
    }
};