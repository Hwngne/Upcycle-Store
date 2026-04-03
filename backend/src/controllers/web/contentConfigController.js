// src/controllers/contentConfigController.js
import mongoose from "mongoose";
import ContentConfig from "../../models/web/ContentConfig.js";

// Lấy tất cả cấu hình nội dung
export const getAllContentConfigs = async (req, res) => {
    try {
        const configs = await ContentConfig.find().sort({ category: 1, name: 1 });

        const topics = configs.filter(c => c.category === "topic");
        const productTypes = configs.filter(c => c.category === "product_type");

        res.status(200).json({
            topics,
            product_types: productTypes,
        });
    } catch (error) {
        console.error("Lỗi getAllContentConfigs:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Admin thêm mới
export const createContentConfig = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin mới được thêm" });
        }

        const { category, name, description = "" } = req.body;

        if (!["topic", "product_type"].includes(category)) {
            return res.status(400).json({ message: "Category không hợp lệ" });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Tên là bắt buộc" });
        }

        const normalizedName = name.trim();

        const existed = await ContentConfig.findOne({
            category,
            name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
        });

        if (existed) {
            return res.status(409).json({ message: `${category === "topic" ? "Chủ đề" : "Loại sản phẩm"} đã tồn tại` });
        }

        const newConfig = await ContentConfig.create({
            category,
            name: normalizedName,
            description: description.trim(),
        });

        res.status(201).json({
            message: "Thêm thành công",
            data: newConfig,
        });
    } catch (error) {
        console.error("Lỗi createContentConfig:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Admin xóa
export const deleteContentConfig = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin mới được xóa" });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const config = await ContentConfig.findByIdAndDelete(id);
        if (!config) {
            return res.status(404).json({ message: "Không tìm thấy cấu hình" });
        }

        res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
        console.error("Lỗi deleteContentConfig:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Admin cập nhật (tùy chọn sau)
export const updateContentConfig = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin mới được cập nhật" });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Tên là bắt buộc" });
        }

        const config = await ContentConfig.findById(id);
        if (!config) {
            return res.status(404).json({ message: "Không tìm thấy cấu hình" });
        }

        const normalizedName = name.trim();
        const existed = await ContentConfig.findOne({
            category: config.category,
            name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
            _id: { $ne: id },
        });

        if (existed) {
            return res.status(409).json({ message: "Tên đã tồn tại" });
        }

        config.name = normalizedName;
        if (description !== undefined) config.description = description.trim();
        await config.save();

        res.status(200).json({ message: "Cập nhật thành công", data: config });
    } catch (error) {
        console.error("Lỗi updateContentConfig:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};