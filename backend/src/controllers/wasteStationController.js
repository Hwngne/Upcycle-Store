// src/controllers/wasteStationController.js
import mongoose from "mongoose";
import WasteStation from "../models/WasteStation.js";

// Lấy tất cả trạm thu gom (dùng cho cả admin và app di động)
export const getAllWasteStations = async (req, res) => {
    try {
        const stations = await WasteStation.find().sort({ createdAt: -1 });
        res.status(200).json(stations);
    } catch (error) {
        console.error("Lỗi getAllWasteStations:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Admin tạo trạm mới
export const createWasteStation = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin mới được tạo trạm thu gom" });
        }

        const { name, type, area, address, contact, latitude, longitude } = req.body;

        if (!name || !type || !area || !address) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc: tên, loại rác, khu vực, địa chỉ" });
        }

        const newStation = await WasteStation.create({
            name: name.trim(),
            type,
            area: area.trim(),
            address: address.trim(),
            contact: contact?.trim() || "",
            latitude,
            longitude,
        });

        res.status(201).json({
            message: "Tạo trạm thu gom thành công",
            data: newStation,
        });
    } catch (error) {
        console.error("Lỗi createWasteStation:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Admin cập nhật trạm
export const updateWasteStation = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin mới được cập nhật" });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const updates = req.body;
        const station = await WasteStation.findById(id);

        if (!station) {
            return res.status(404).json({ message: "Không tìm thấy trạm thu gom" });
        }

        // Cập nhật các trường được phép
        if (updates.name) station.name = updates.name.trim();
        if (updates.type) station.type = updates.type;
        if (updates.area) station.area = updates.area.trim();
        if (updates.address) station.address = updates.address.trim();
        if (updates.contact !== undefined) station.contact = updates.contact?.trim() || "";
        if (updates.latitude !== undefined) station.latitude = updates.latitude;
        if (updates.longitude !== undefined) station.longitude = updates.longitude;

        await station.save();

        res.status(200).json({
            message: "Cập nhật trạm thu gom thành công",
            data: station,
        });
    } catch (error) {
        console.error("Lỗi updateWasteStation:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Admin xóa trạm
export const deleteWasteStation = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Chỉ admin mới được xóa" });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const station = await WasteStation.findByIdAndDelete(id);
        if (!station) {
            return res.status(404).json({ message: "Không tìm thấy trạm thu gom" });
        }

        res.status(200).json({ message: "Xóa trạm thu gom thành công" });
    } catch (error) {
        console.error("Lỗi deleteWasteStation:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};