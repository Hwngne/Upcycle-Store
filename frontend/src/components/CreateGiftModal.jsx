// src/components/CreateGiftModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const CreateGiftModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        quantity: "125", // ← Giữ string để tránh lỗi hiển thị
        point: "",
        location: "",
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reset form khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: "",
                description: "",
                quantity: "100",
                point: "",
                location: "",
            });
            setSelectedFile(null);
            setPreview(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuantityChange = (action) => {
        setFormData((prev) => {
            let current = Number(prev.quantity || 0);
            let newQty = action === "inc" ? current + 1 : current - 1;
            newQty = Math.max(0, newQty);
            return { ...prev, quantity: newQty.toString() };
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("Vui lòng nhập tên quà tặng");
            return;
        }
        if (!formData.point || formData.point <= 0) {
            toast.error("Giá trị quy đổi phải lớn hơn 0");
            return;
        }
        if (!formData.location.trim()) {
            toast.error("Vui lòng nhập nơi nhận");
            return;
        }

        setLoading(true);

        const submitData = new FormData();
        submitData.append("name", formData.name.trim());
        submitData.append("description", formData.description.trim());
        submitData.append("point", formData.point);
        submitData.append("quantity", Number(formData.quantity) || 0);
        submitData.append("location", formData.location.trim());

        if (selectedFile) {
            submitData.append("image", selectedFile);
        }

        try {
            await onSubmit(submitData);
            onClose();
        } catch (err) {
            // GiftsPage xử lý toast lỗi
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div
                className="relative z-10 w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white/90 backdrop-blur-md p-8 shadow-2xl border border-white/30"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-[#4B0503]">Tạo quà tặng mới</h3>
                    <button onClick={onClose} className="text-3xl text-gray-500 hover:text-gray-700 font-bold">
                        ×
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Tên quà tặng - ĐÃ SỬA ĐÚNG */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Tên quà tặng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleTextChange} // ← DÙNG handleTextChange
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition"
                            placeholder="Nhập tên quà"
                            required
                        />
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Mô tả quà tặng
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleTextChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition"
                            placeholder="Mô tả ngắn gọn"
                        />
                    </div>

                    {/* Hình ảnh */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Hình ảnh quà tặng
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#B40001]/10 file:text-[#B40001] hover:file:bg-[#B40001]/20"
                        />
                        {preview && (
                            <div className="mt-4">
                                <p className="text-sm text-[#4B0503]/70 mb-2">Xem trước:</p>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-xl shadow-md border border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    {/* Số lượng - ĐÃ FIX LỖI HIỂN THỊ */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Số lượng quà tặng <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => handleQuantityChange("dec")}
                                disabled={loading}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-bold hover:opacity-90 transition disabled:opacity-50"
                            >
                                −
                            </button>
                            <input
                                type="text" // ← Dùng text để kiểm soát hoàn toàn
                                inputMode="numeric"
                                value={formData.quantity}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/^0+/, "") || "0"; // Xóa leading zero
                                    if (/^\d*$/.test(value)) {
                                        setFormData(prev => ({ ...prev, quantity: value === "" ? "0" : value }));
                                    }
                                }}
                                disabled={loading}
                                className="w-24 text-center py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none font-semibold text-[#4B0503]"
                                placeholder="0"
                            />
                            <button
                                type="button"
                                onClick={() => handleQuantityChange("inc")}
                                disabled={loading}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-bold hover:opacity-90 transition disabled:opacity-50"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Điểm quy đổi */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Giá trị quy đổi (điểm) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="point"
                            value={formData.point}
                            onChange={handleTextChange}
                            min="1"
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition"
                            placeholder="Số điểm cần để đổi"
                            required
                        />
                    </div>

                    {/* Nơi nhận */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Nơi nhận <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleTextChange}
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition"
                            placeholder="Ví dụ: CS3.01.01, Kho B, Phòng Đoàn..."
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition disabled:opacity-70"
                        style={{
                            background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                        }}
                    >
                        {loading ? "Đang lưu..." : "Lưu quà tặng"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGiftModal;