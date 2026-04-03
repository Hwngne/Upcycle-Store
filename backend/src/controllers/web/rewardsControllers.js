// src/controllers/rewardsControllers.js
import Gift from "../../models/web/gift.js";
import Reward from "../../models/web/Reward.js";
import Account from "../../models/web/Account.js";
import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.js";
import { createNotification } from "../../utils/createNotification.js";
import { logActivity } from "../../utils/activityLogger.js";

export const getAllGifts = async (req, res) => {
    try {
        const gifts = await Gift.find({}).sort({ createdAt: -1 });
        res.status(200).json(gifts);
    } catch (error) {
        console.error("Lỗi getAllGifts:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// === ĐỔI QUÀ ===

export const createGift = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin được thực hiện" });
        }

        let imageUrl = "https://via.placeholder.com/150";

        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(
                    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                    {
                        folder: "gifts",
                        public_id: `gift_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                        resource_type: "image",
                    }
                );
                imageUrl = result.secure_url;
            } catch (uploadError) {
                console.error("Lỗi upload Cloudinary:", uploadError);
            }
        }

        const { name, description, point, quantity, location } = req.body;

        if (!name?.trim() || !point || !quantity || !location?.trim()) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc: tên, điểm, số lượng, nơi nhận",
            });
        }

        const gift = await Gift.create({
            name: name.trim(),
            description: description?.trim() || "",
            imageUrl,
            point: Number(point),
            quantity: Number(quantity),
            location: location.trim(),
        });

        res.status(201).json({
            message: "Tạo quà thành công",
            data: gift,
        });

        await logActivity({
            req,
            action: "GIFT_CREATE",
            description: `"${gift.name}"`,
            targetType: "Gift",
            target: gift._id,
        });

    } catch (error) {
        console.error("Lỗi createGift:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const updateGift = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin được thực hiện" });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const updateData = { ...req.body };

        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(
                    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                    {
                        folder: "gifts",
                        public_id: `gift_${id}_${Date.now()}`,
                        resource_type: "image",
                    }
                );
                updateData.imageUrl = result.secure_url;
            } catch (uploadErr) {
                console.error("Lỗi upload Cloudinary:", uploadErr);
                return res.status(500).json({ message: "Upload ảnh thất bại" });
            }
        }

        if (updateData.point !== undefined) {
            updateData.point = Number(updateData.point);
        }
        if (updateData.quantity !== undefined) {
            updateData.quantity = Number(updateData.quantity);
        }
        if (updateData.visible !== undefined) {
            updateData.visible = updateData.visible === "true" || updateData.visible === true;
        }

        updateData.updatedAt = Date.now();

        const updatedGift = await Gift.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!updatedGift) {
            return res.status(404).json({ message: "Không tìm thấy quà" });
        }

        res.status(200).json({
            message: "Cập nhật thành công",
            data: updatedGift,
        });
        await logActivity({
        req,
        action: "GIFT_UPDATE",
        description: `quà "${updatedGift.name}"`,
        targetType: "Gift",
        target: updatedGift._id,
    });

    } catch (error) {
        console.error("Lỗi updateGift:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// DELETE: Xóa quà (admin only)
export const deleteGift = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin được thực hiện" });
        }

        const { id } = req.params;
        const gift = await Gift.findByIdAndDelete(id);
        if (!gift) return res.status(404).json({ message: "Không tìm thấy quà" });

        res.status(200).json({ message: "Xóa quà thành công" });

         await logActivity({
            req,
            action: "GIFT_DELETE",
            description: `quà "${gift.name}"`,
            targetType: "Gift",
            target: gift._id,
        });

    } catch (error) {
        console.error("Lỗi deleteGift:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};


export const exchangeGift = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { giftId } = req.body;
        const userId = req.user.id;

        const gift = await Gift.findById(giftId).session(session);
        if (!gift) return res.status(404).json({ message: "Quà không tồn tại" });

        const account = await Account.findById(userId).session(session);
        if (!account) return res.status(404).json({ message: "Tài khoản không tồn tại" });

        if (account.total_points < gift.point) {
            return res.status(400).json({ message: "Không đủ điểm" });
        }

        account.total_points -= gift.point;
        const reward = new Reward({
            account: userId,
            user: userId,
            gift: giftId,
            location: gift.location,
            quantity: 1,
            status: "pending",
        });

        await account.save({ session });
        await reward.save({ session });

        await session.commitTransaction();

        res.status(201).json({
            message: "Đổi quà thành công, chờ admin phát",
            data: reward,
        });
        await logActivity({
            req,
            action: "GIFT_EXCHANGE",
            description: `"${gift.name}"`,
            targetType: "Reward",
            target: reward._id,
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Lỗi exchangeGift:", error);
        res.status(500).json({ message: "Đổi quà thất bại" });
    } finally {
        session.endSession();
    }
};


export const getAllRewards = async (req, res) => {
    try {
        const query = req.user.role === "admin" ? {} : { account: req.user.id };

        const rewards = await Reward.find(query)
            .populate("account", "student_name admin_name email role")
            .populate("user", "student_name admin_name email role club_info")
            .populate("gift", "name point imageUrl location");  // ← dùng virtual 'gift'

        res.status(200).json(rewards);
    } catch (error) {
        console.error("Lỗi getAllRewards:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// PATCH: Admin cập nhật trạng thái phát quà

export const updateRewardStatus = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Chỉ admin được thực hiện" });
    }

    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "completed", "cancelled", "expired"].includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }

        const updateData = { status };

        if (status === "completed") {
            updateData.receivedAt = Date.now();
        }

        // Tìm reward
        const reward = await Reward.findById(id);
        if (!reward) {
            return res.status(404).json({ message: "Không tìm thấy yêu cầu đổi quà" });
        }

        // Không cho thay đổi nếu đã completed hoặc cancelled
        if (["completed", "cancelled"].includes(reward.status)) {
            return res.status(400).json({
                message: `Không thể thay đổi trạng thái khi đã ${reward.status === "completed" ? "phát" : "hủy"}`
            });
        }

        let updatedReward;

        if (status === "completed") {
            // Kiểm tra quà qua virtual 'gift' (sau populate)
            let gift = null;

            // Populate gift trước khi kiểm tra
            await reward.populate({
                path: 'gift',
                select: 'name point imageUrl location quantity'
            });

            gift = reward.gift;  // ← dùng virtual gift

            if (gift) {
                if (gift.quantity < 1) {
                    return res.status(400).json({ message: "Hết hàng - không thể hoàn tất phát quà" });
                }
                gift.quantity -= 1;
                await gift.save();
                console.log(`[INFO] Đã trừ 1 quantity cho quà ${gift._id} (từ reward ${id})`);
            } else {
                console.warn(
                    `[WARNING] Reward ${id} hoàn tất nhưng quà tặng (giftId: ${reward.giftId}) không tồn tại hoặc đã bị xóa. Không trừ tồn kho.`
                );
            }
        }

        // Cập nhật reward
        updatedReward = await Reward.findByIdAndUpdate(id, updateData, { new: true })
            .populate({
                path: 'gift',
                select: "name point imageUrl location",
            })
            .populate("account", "student_name admin_name email role");

        res.status(200).json({
            message: "Cập nhật trạng thái thành công",
            data: updatedReward,
        });

        if (status === "completed") {
        await createNotification({
            user: updatedReward.account,
            title: "Đã nhận quà thành công",
            message: `Yêu cầu đổi quà của bạn đã được phát thành công`,
            type: "promotion",
        });
        }

        if(status==="cancelled"){
            await createNotification({
                user: reward.account,
                title:"Yêu cầu đổi quà bị hủy",
                message: `Yêu cầu đổi quà của bạn đã bị hủy. Mọi thắc mắc xin liên hệ người phụ trách tại ${reward.location}`,
                type:"promotion",
            })
        }
        if(status==="expired"){
            await createNotification({
                user: reward.account,
                title:"Yêu cầu đổi quà đã quá hạn",
                message: `Yêu cầu đổi quà của bạn đã quá thời gian nhận. 
                Điểm tích lũy đã dùng để đổi quà sẽ không được hoàn lại. Mọi thắc mắc vui lòng liên hệ với người phụ trách tại ${reward.location}`,
                type: "promotion",
            })
        };
    } catch (error) {
        console.error("Lỗi updateRewardStatus:", error);
        res.status(500).json({ message: error.message || "Lỗi hệ thống" });
    }
};