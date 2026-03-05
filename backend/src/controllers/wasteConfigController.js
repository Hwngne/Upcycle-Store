// src/controllers/wasteConfigController.js
import mongoose from "mongoose";
import WasteConfig from "../models/WasteConfig.js";

// Lấy tất cả cấu hình (cả loại rác và khu vực)
export const getAllConfigs = async (req, res) => {
    try {
        const configs = await WasteConfig.find().sort({ category: 1, name: 1 });

        // Tách riêng để frontend dễ dùng
        const wasteTypes = configs.filter(c => c.category === "waste_type");
        const areas = configs.filter(c => c.category === "area");

        res.status(200).json({
            waste_types: wasteTypes,
            areas: areas,
        });
    } catch (error) {
        console.error("Lỗi getAllConfigs:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Admin thêm mới (loại rác hoặc khu vực)
export const createConfig = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin mới được thêm cấu hình" });
        }

        const { category, name, description = "" } = req.body;

        if (!["waste_type", "area"].includes(category)) {
            return res.status(400).json({ message: "Category không hợp lệ" });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Tên là bắt buộc" });
        }

        const normalizedName = name.trim();

        // Kiểm tra trùng trong cùng category
        const existed = await WasteConfig.findOne({
            category,
            name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
        });

        if (existed) {
            return res.status(409).json({ message: `${category === "waste_type" ? "Loại rác" : "Khu vực"} đã tồn tại` });
        }

        const newConfig = await WasteConfig.create({
            category,
            name: normalizedName,
            description: description.trim(),
        });

        res.status(201).json({
            message: "Thêm thành công",
            data: newConfig,
        });
    } catch (error) {
        console.error("Lỗi createConfig:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Admin xóa
export const deleteConfig = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin mới được xóa" });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const config = await WasteConfig.findByIdAndDelete(id);
        if (!config) {
            return res.status(404).json({ message: "Không tìm thấy cấu hình" });
        }

        res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
        console.error("Lỗi deleteConfig:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const updateConfig = async (req, res) => {
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

        const config = await WasteConfig.findById(id);
        if (!config) {
            return res.status(404).json({ message: "Không tìm thấy cấu hình" });
        }

        const normalizedName = name.trim();

        // Kiểm tra trùng (ngoại trừ chính nó)
        const existed = await WasteConfig.findOne({
            category: config.category,
            name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
            _id: { $ne: id },
        });

        if (existed) {
            return res.status(409).json({ message: `${config.category === "waste_type" ? "Loại rác" : "Khu vực"} đã tồn tại` });
        }

        config.name = normalizedName;
        if (description !== undefined) config.description = description.trim();

        await config.save();

        res.status(200).json({
            message: "Cập nhật thành công",
            data: config,
        });
    } catch (error) {
        console.error("Lỗi updateConfig:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

