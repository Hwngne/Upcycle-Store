import express from "express";
import {
    getAllAccounts,
    createAccounts,
    updateAccounts,
    deleteAccounts,
    lockAccount,
    unlockAccount,
    getMyProfile,
    updateMyProfile,
    getLeaderboard,
    getAccountOverview,
    getAccountPieStats
} from "../../controllers/web/accountsControllers.js"

import { authenticate, authorize } from "../../middlewares/auth.js"; 
import Account from "../../models/web/Account.js";
import { validateCreateAccount } from "../../middlewares/validateAccount.js";
import { forceChangePassword } from "../../middlewares/forceChangePassword.js";
import multer from "multer";
const router = express.Router();
const upload = multer({dest: "uploads/"});
// ===== LẤY THÔNG TIN CÁ NHÂN (người dùng hiện tại) =====
router.get("/me", authenticate, getMyProfile); // ← DÙNG authenticate
// Thêm route này vào trước hoặc sau các route khác
router.put("/me", authenticate, updateMyProfile);
// ===== ADMIN ONLY ROUTES =====
router
    .route("/")
    .get(authenticate, forceChangePassword, authorize("admin"), getAllAccounts)
    .post(authenticate, authorize("admin"), validateCreateAccount, createAccounts);

router
    .route("/:id")
    .put(authenticate, authorize("admin", "student", "club"), updateAccounts)
    .delete(authenticate, authorize("admin"), deleteAccounts);

// ===== LOCK / UNLOCK ACCOUNT (admin only) =====
router.patch("/:id/lock", authenticate, authorize("admin"), lockAccount);
router.patch("/:id/unlock", authenticate, authorize("admin"), unlockAccount);

// API cập nhật avatar (dùng chung cho mọi role)
router.put(
    "/me/avatar",
    authenticate,
    upload.single("avatar"), // tên field là "avatar"
    async (req, res) => {
        try {
            const userId = req.user.id;

            let avatarUrl = null;

            if (req.file && req.file.path) {
                try {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: "avatars",
                        public_id: `user_${userId}_${Date.now()}`,
                        overwrite: true,
                        resource_type: "image",
                    });
                    avatarUrl = result.secure_url;
                } catch (uploadErr) {
                    console.error("Lỗi upload avatar:", uploadErr);
                    return res.status(500).json({ message: "Upload ảnh thất bại" });
                }
            }

            if (!avatarUrl) {
                return res.status(400).json({ message: "Không có ảnh được tải lên" });
            }

            const updatedAccount = await Account.findByIdAndUpdate(
                userId,
                { avatar: avatarUrl },
                { new: true }
            ).select("avatar");

            res.status(200).json({
                message: "Cập nhật avatar thành công",
                data: { avatar: updatedAccount.avatar },
            });
        } catch (error) {
            console.error("Lỗi update avatar:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
);

router.get(
    "/leaderboard",
    authenticate,
    getLeaderboard
);

router.get("/overview", authenticate, getAccountOverview);
router.get("/account-pie-stats", authenticate, getAccountPieStats);
export default router;
