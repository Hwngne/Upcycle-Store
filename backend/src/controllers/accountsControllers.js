import Account from "../models/Account.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { logActivity } from "../utils/activityLogger.js";


/* ===== HÀM KIỂM TRA EMAIL VANLANG ===== */
const isVanLangEmail = (email) => {
    return typeof email === "string" && email.endsWith("@vanlanguni.vn");
};

/* ===== HÀM KIỂM TRA MÃ SINH VIÊN ===== */
const isValidStudentCode = (code) => {
    return /^\d{13}$/.test(code); // 13 chữ số
};

export const getAllAccounts = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Chỉ admin mới được xem danh sách tài khoản",
            });
        }

        const accounts = await Account.find({
            status: { $ne: "deleted" },
        }).select("-password -refreshToken");
        return res.status(200).json(accounts);
    } catch (error) {
        console.error("Lỗi getAllAccounts:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const createAccounts = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Chỉ admin mới được tạo tài khoản",
            });
        }

        const {
            email,
            role,
            student_code,
            student_name,
            gender,
            phone_number,
            club_info,
            admin_name,
            admin_gender,
            admin_phone,
        } = req.body;


        if (!["student", "club", "admin"].includes(role)) {
            return res.status(400).json({
                errors: { role: "Role không hợp lệ" }
            });
        }

        /* ===== CHECK EMAIL VANLANG ===== */
        // if (!isVanLangEmail(email)) {
        //     return res.status(400).json({
        //         error: "Email phải có đuôi @vanlanguni.vn",
        //     });
        // }
        if (!email) {
            return res.status(400).json({
                errors: { email: "Vui lòng nhập email" }
            });
        }

        if (!isVanLangEmail(email)) {
            return res.status(400).json({
                errors: { email: "Email phải có đuôi @vanlanguni.vn" }
            });
        }

        /* ===== VALIDATE THEO ROLE ===== */
        if (role === "student") {
            // if (!student_code || !student_name || !email || !gender) {
            //     return res.status(400).json({
            //         message: "Student cần MSSV, tên, email, giới tính",
            //     });
            // }

            const errors = {};

            if (!student_code)
                errors.student_code = "Vui lòng nhập mã sinh viên";

            if (!student_name)
                errors.student_name = "Vui lòng nhập họ tên";

            if (!gender)
                errors.gender = "Vui lòng chọn giới tính";

            if (Object.keys(errors).length > 0) {
                return res.status(400).json({ errors });
            }

            // if (!isValidStudentCode(student_code)) {
            //     return res.status(400).json({
            //         message: "Mã sinh viên phải gồm 13 chữ số",
            //     });
            // }
            if (!isValidStudentCode(student_code)) {
                return res.status(400).json({
                    errors: { student_code: "Mã sinh viên phải gồm 13 chữ số" }
                });
            }
        }

        // if (role === "club") {
        //     if (!club_info?.club_name || !email) {
        //         return res.status(400).json({
        //             message: "CLB cần tên CLB và email",
        //         });
        //     }

        
        // }

        if (role === "club") {
            const errors = {};

            if (!club_info?.club_name)
                errors.club_name = "Vui lòng nhập tên câu lạc bộ";

            if (Object.keys(errors).length > 0) {
                return res.status(400).json({ errors });
            }
        }

        // if (role === "admin" && !email) {
        //     return res.status(400).json({
        //         message: "Admin cần email",
        //     });
        // }
        if (role === "admin") {
            const errors = {};

            if (!admin_name)
                errors.admin_name = "Vui lòng nhập họ tên admin";

            if (!admin_gender)
                errors.admin_gender = "Vui lòng chọn giới tính";

            if (!admin_phone)
                errors.phone_number = "Vui lòng nhập số điện thoại";

            // Kiểm tra format số điện thoại (10–11 số)
            if (admin_phone && !/^\d{10,11}$/.test(admin_phone)) {
                errors.phone_number = "Số điện thoại phải gồm 10-11 chữ số";
            }

            if (Object.keys(errors).length > 0) {
                return res.status(400).json({ errors });
            }
        }
        /* ===== CHECK TRÙNG ===== */
        // if (await Account.findOne({ email })) {
        //     return res.status(409).json({ message: "Email đã tồn tại" });
        // }
        if (await Account.findOne({ email })) {
            return res.status(409).json({
                errors: { email: "Email đã tồn tại" }
            });
        }

        // ===== CHECK SỐ ĐIỆN THOẠI CHUNG =====
        
        // Xác định phone_number cuối cùng sẽ dùng
        let finalPhoneNumber = phone_number;

        if (role === "admin" && admin_phone !== undefined) {
            finalPhoneNumber = admin_phone; // Ưu tiên admin_phone nếu có
        }

        // Kiểm tra trùng phone_number (duy nhất 1 lần)
        if (finalPhoneNumber) {
            const existedPhone = await Account.findOne({ phone_number: finalPhoneNumber });
            if (existedPhone) {
                // return res.status(409).json({
                //     message: "Số điện thoại đã được sử dụng",
                // });
                return res.status(409).json({
                    errors: { phone_number: "Số điện thoại đã được sử dụng" }
                });
            }
        }

        


        if (role === "student" && student_code) {
            const existedCode = await Account.findOne({ student_code });
            if (existedCode) {
                // return res.status(409).json({
                //     message: "Mã sinh viên đã tồn tại",
                // });
                return res.status(409).json({
                    errors: { student_code: "Mã sinh viên đã tồn tại" }
                });
            }
        }

        /* ===== PASSWORD ===== */
        if (!process.env.DEFAULT_PASSWORD) {
            throw new Error("DEFAULT_PASSWORD chưa được cấu hình trong .env");
        }

        const defaultPassword = process.env.DEFAULT_PASSWORD;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);


        const newAccount = await Account.create({
            email,
            password: hashedPassword,
            role,
            // phone_number: phone_number || undefined,  
            phone_number: finalPhoneNumber || undefined,
            student_code: role === "student" ? student_code : undefined,
            student_name: role === "student" ? student_name : undefined,
            gender: role === "student" ? gender : undefined,
            club_info: role === "club" ? club_info : undefined,
            admin_name: role === "admin" ? admin_name : undefined,
            admin_gender: role === "admin" ? admin_gender : undefined,
            admin_phone: role === "admin" ? admin_phone : undefined,
            status: "active",
            change_password: true,
        });

        await logActivity({
            req,
            action: "ACCOUNT_CREATE",
            description: `tài khoản ${newAccount.email}`,
            targetType: "Account",
            target: newAccount._id,
        });


        return res.status(201).json({
        message: "Tạo tài khoản thành công",
        data: {
            id: newAccount._id,
            email: newAccount.email,
            role: newAccount.role,
        },
        });


    } catch (error) {
        console.error("Lỗi createAccounts:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const updateAccounts = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const account = await Account.findById(id);
        if (!account || account.status === "deleted") {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản",
            });
        }

        if (req.user.role !== "admin" && req.user.id !== id) {
            return res.status(403).json({
                message: "Không có quyền cập nhật tài khoản này",
            });
        }

        
        if (req.body.role || req.body.total_points) {
            return res.status(400).json({
                message: "Không được cập nhật role hoặc total_points",
            });
        }
        if (req.body.email) {
            if (req.user.role !== "admin" || account.role !== "admin") {
                return res.status(403).json({
                    message: "Chỉ admin mới được thay đổi email của tài khoản admin",
                });
            }

            if (!isVanLangEmail(req.body.email)) {
                return res.status(400).json({
                    message: "Email phải có đuôi @vanlanguni.vn",
                });
            }

            const existedEmail = await Account.findOne({
                email: req.body.email,
                _id: { $ne: id },
            });
            if (existedEmail) {
                return res.status(409).json({ message: "Email đã tồn tại" });
            }

            account.email = req.body.email;
        }

        const { student_name, student_code, gender, status, password, club_info } =
            req.body;

        /* ===== STATUS ===== */
        if (status) {
            if (!["active", "locked"].includes(status)) {
                return res.status(400).json({ message: "Status không hợp lệ" });
            }
            account.status = status;
        }

        /* ===== NAME ===== */
        if (student_name && account.role !== "club") {
            account.student_name = student_name;
        }

        /* ===== STUDENT ===== */
        if (account.role === "student") {
            if (student_code) {
                if (!isValidStudentCode(student_code)) {
                    return res.status(400).json({
                        message: "Mã sinh viên phải gồm 13 chữ số",
                    });
                }

                const existedCode = await Account.findOne({
                    student_code,
                    _id: { $ne: id },
                });
                if (existedCode) {
                    return res.status(409).json({
                        message: "Mã sinh viên đã tồn tại",
                    });
                }
                account.student_code = student_code;
            }

            if (gender) account.gender = gender;
        }

       
        if (account.role === "club" && club_info) {
            account.club_info = {
                ...account.club_info,
                ...club_info,
            };
        }

        
        /* ===== XỬ LÝ SỐ ĐIỆN THOẠI CHUNG (SINH VIÊN, CLB, ADMIN) ===== */
        if (req.body.phone_number !== undefined) {
            if (req.body.phone_number) {
                const existedPhone = await Account.findOne({
                    phone_number: req.body.phone_number,
                    _id: { $ne: id },
                });
                if (existedPhone) {
                    return res.status(409).json({
                        message: "Số điện thoại đã được sử dụng bởi tài khoản khác",
                    });
                }
            }
            account.phone_number = req.body.phone_number || null;
        }

        /* ===== ADMIN RIÊNG ===== */
        if (account.role === "admin") {
            const { admin_name, admin_gender, admin_phone } = req.body;

            if (admin_name) account.admin_name = admin_name;
            if (admin_gender) account.admin_gender = admin_gender;

            if (admin_phone !== undefined) {
                if (admin_phone) {
                    const existedAdminPhone = await Account.findOne({
                        phone_number: admin_phone,
                        _id: { $ne: id },
                    });
                    if (existedAdminPhone) {
                        return res.status(409).json({
                            message: "Số điện thoại admin đã được sử dụng",
                        });
                    }
                }
                account.admin_phone = admin_phone || null;
                account.phone_number = admin_phone || null; // đồng bộ
            }
        }

        await account.save();

        await logActivity({
            req,
            action: "ACCOUNT_UPDATE",
            description: `thông tin tài khoản ${account.email}`,
            targetType: "Account",
            target: account._id,
        });

        return res.status(200).json({
            message: "Cập nhật tài khoản thành công",
        });

    } catch (error) {
        console.error("Lỗi updateAccounts:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const deleteAccounts = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Chỉ admin mới được xóa tài khoản",
            });
        }

        const deletedAccount = await Account.findOneAndDelete({
            _id: id,
            role: { $ne: "admin" }, // không cho xóa admin
        });

        if (!deletedAccount) {
            return res.status(404).json({
                message: "Tài khoản không tồn tại hoặc không thể xóa",
            });
        }

        await logActivity({
            req,
            action: "ACCOUNT_DELETE",
            description: `tài khoản ${deletedAccount.email}`,
            targetType: "Account",
            target: deletedAccount._id,
        });

        return res.status(200).json({
            message: "Xóa tài khoản vĩnh viễn thành công",
        });

    } catch (error) {
        console.error("Lỗi deleteAccounts:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const lockAccount = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Chỉ admin mới được khóa tài khoản",
            });
        }

        const account = await Account.findById(id);
        if (!account || account.status === "deleted") {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản",
            });
        }

        if (account.status === "locked") {
            return res.status(400).json({
                message: "Tài khoản đã bị khóa",
            });
        }

        account.status = "locked";
        await account.save();

        await logActivity({
            req,
            action: "ACCOUNT_LOCK",
            description: `tài khoản ${account.email}`,
            targetType: "Account",
            target: account._id,
        });


        return res.status(200).json({
            message: "Khóa tài khoản thành công",
        });
    } catch (error) {
        console.error("Lỗi lockAccount:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const unlockAccount = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Chỉ admin mới được mở khóa tài khoản",
            });
        }

        const account = await Account.findById(id);
        if (!account || account.status === "deleted") {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản",
            });
        }

        if (account.status === "active") {
            return res.status(400).json({
                message: "Tài khoản đang hoạt động",
            });
        }

        account.status = "active";
        await account.save();
        
        await logActivity({
            req,
            action: "ACCOUNT_UNLOCK",
            description: `tài khoản ${account.email}`,
            targetType: "Account",
            target: account._id,
        });

        return res.status(200).json({
            message: "Mở khóa tài khoản thành công",
        });
    } catch (error) {
        console.error("Lỗi unlockAccount:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Lấy thông tin cá nhân của người dùng hiện tại
export const getMyProfile = async (req, res) => {
    try {
        // req.user được gắn từ middleware auth (protect route)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Không xác thực được người dùng" });
        }

        const account = await Account.findById(req.user.id).select("-password -refreshToken");

        if (!account || account.status === "deleted") {
            return res.status(404).json({ message: "Tài khoản không tồn tại" });
        }

        return res.status(200).json(account);
    } catch (error) {
        console.error("Lỗi getMyProfile:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};


export const updateMyProfile = async (req, res) => {
    try {
        const { id } = req.user;

        const account = await Account.findById(id);
        if (!account || account.status === "deleted") {
            return res.status(404).json({ message: "Tài khoản không tồn tại" });
        }

       
        if (req.body.role || req.body.password || req.body.total_points) {
            return res.status(400).json({
                message: "Không được sửa role, password hoặc total_points",
            });
        }

        if (req.body.email) {
            if (account.role !== "admin") {
                return res.status(403).json({
                    message: "Chỉ admin mới được thay đổi email của chính mình",
                });
            }

            if (!isVanLangEmail(req.body.email)) {
                return res.status(400).json({
                    message: "Email phải có đuôi @vanlanguni.vn",
                });
            }

            const existedEmail = await Account.findOne({
                email: req.body.email,
                _id: { $ne: account._id },
            });
            if (existedEmail) {
                return res.status(409).json({ message: "Email đã tồn tại" });
            }

            account.email = req.body.email;
        }

        const updates = req.body;

        if (account.role === "student") {
            if (updates.student_name) account.student_name = updates.student_name;
            if (updates.gender) account.gender = updates.gender;
        } else if (account.role === "admin") {
            if (updates.admin_name) account.admin_name = updates.admin_name;
            if (updates.admin_gender) account.admin_gender = updates.admin_gender;

            // Ưu tiên admin_phone nếu có
            if (updates.admin_phone !== undefined) {
                account.admin_phone = updates.admin_phone || null;
                account.phone_number = updates.admin_phone || null;
            }
            // Nếu chỉ gửi phone_number chung → đồng bộ vào admin_phone
            else if (updates.phone_number !== undefined) {
                account.admin_phone = updates.phone_number || null;
            }
        } else if (account.role === "club") {
            if (updates.club_info) {
                account.club_info = { ...account.club_info, ...updates.club_info };
            }
        }

        // Xử lý phone_number chung (cho student/club và fallback cho admin)
        if (updates.phone_number !== undefined) {
            if (updates.phone_number) {
                const existedPhone = await Account.findOne({
                    phone_number: updates.phone_number,
                    _id: { $ne: account._id },
                });
                if (existedPhone) {
                    return res.status(409).json({
                        message: "Số điện thoại đã được sử dụng bởi tài khoản khác",
                    });
                }
            }
            account.phone_number = updates.phone_number || null;
        }

        await account.save();
        
        await logActivity({
            req,
            action: "PROFILE_UPDATE",
            description: `hồ sơ cá nhân`,
            targetType: "Account",
            target: account._id,
        });

         return res.status(200).json({ message: "Cập nhật hồ sơ thành công" });
    } catch (error) {
        console.error("Lỗi updateMyProfile:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Account.find({
            status: "active",
            role: { $in: ["student", "club"] },
            totalScore: { $gt: 0 },
        })
        .select("student_name club_info role totalScore avatar")
        .sort({ totalScore: -1 })
        .limit(10);

        const formatted = leaderboard.map(acc => ({
            name: acc.student_name || acc.club_info?.club_name || "Người dùng",
            role: acc.role === "student" ? "Sinh viên" : "CLB",
            totalScore: acc.totalScore,
            avatar: acc.avatar,
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Lỗi getLeaderboard:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getAccountOverview = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Chỉ admin mới được xem thống kê tài khoản",
            });
        }

        const totalAccounts = await Account.countDocuments({
            status: { $ne: "deleted" }
        });

        // Tài khoản đang active
        const activeAccounts = await Account.countDocuments({
            status: "active"
        });

        // Tổng sinh viên
        const totalStudents = await Account.countDocuments({
            role: "student",
            status: { $ne: "deleted" }
        });

        return res.status(200).json({
            totalAccounts,
            activeAccounts,
            totalStudents
        });

    } catch (error) {
        console.error("Lỗi getAccountOverview:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getAccountPieStats = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Chỉ admin mới được xem thống kê tài khoản",
            });
        }

        /* ================= ROLE TOTAL ================= */
        const roleStatsTotalRaw = await Account.aggregate([
            { $match: { status: { $ne: "deleted" } } },
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        /* ================= ROLE ACTIVE ================= */
        const roleStatsActiveRaw = await Account.aggregate([
            { $match: { status: "active" } },
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        /* ================= FORMAT FUNCTION ================= */
        const formatRoleStats = (data) => {
            const obj = { student: 0, admin: 0, club: 0 };
            data.forEach(item => {
                obj[item._id] = item.count;
            });
            return obj;
        };

        const roleStatsTotal = formatRoleStats(roleStatsTotalRaw);
        const roleStatsActive = formatRoleStats(roleStatsActiveRaw);

        /* ================= STATUS STATS ================= */
        const statusStatsRaw = await Account.aggregate([
            { $match: { status: { $ne: "deleted" } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusStats = { active: 0, locked: 0 };

        statusStatsRaw.forEach(item => {
            if (item._id !== "deleted") {
                statusStats[item._id] = item.count;
            }
        });

        return res.status(200).json({
            roleStatsTotal,
            roleStatsActive,
            statusStats
        });

    } catch (error) {
        console.error("Lỗi getAccountPieStats:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};