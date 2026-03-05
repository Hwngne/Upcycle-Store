// src/components/EditGiftModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const EditGiftModal = ({ isOpen, onClose, gift, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        point: "",
        quantity: "",
        location: "",
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && gift) {
            setFormData({
                name: gift.name || "",
                description: gift.description || "",
                point: gift.point?.toString() || "",
                quantity: gift.quantity?.toString() || "0",
                location: gift.location || "",
            });
            setPreview(gift.imageUrl);
            setSelectedFile(null);
        }
    }, [isOpen, gift]);

    if (!isOpen || !gift) return null;

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuantityChange = (action) => {
        setFormData((prev) => {
            const current = Number(prev.quantity) || 0;
            return {
                ...prev,
                quantity:
                    action === "inc"
                        ? (current + 1).toString()
                        : Math.max(0, current - 1).toString(),
            };
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
        const pointNum = Number(formData.point);
        const quantityNum = Number(formData.quantity);

        if (!formData.name.trim()) return toast.error("Vui lòng nhập tên quà tặng");
        if (!pointNum || pointNum <= 0) return toast.error("Điểm phải lớn hơn 0");
        if (!formData.location.trim()) return toast.error("Vui lòng nhập nơi nhận");

        setLoading(true);

        const submitData = new FormData();
        submitData.append("name", formData.name.trim());
        submitData.append("description", formData.description.trim());
        submitData.append("point", pointNum);
        submitData.append("quantity", quantityNum);
        submitData.append("location", formData.location.trim());

        if (selectedFile) {
            submitData.append("image", selectedFile);
        }

        try {
            await onUpdateSuccess(gift._id, submitData);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Cập nhật thất bại");
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
                    <h3 className="text-2xl font-bold text-[#4B0503]">Chỉnh sửa quà tặng</h3>
                    <button onClick={onClose} className="text-3xl text-gray-500 hover:text-gray-700 font-bold">
                        ×
                    </button>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Tên quà tặng *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleTextChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Mô tả
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleTextChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition"
                        />
                    </div>

                    {/* ===== HÌNH ẢNH (CHỈ SỬA STYLE) ===== */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Hình ảnh quà tặng
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition
                                       file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-[#B40001]/10 file:text-[#B40001]
                                       hover:file:bg-[#B40001]/20"
                        />
                        {/* HIỂN THỊ TÊN FILE */}
                        {(selectedFile || gift?.imageUrl) && (
                            <p className="mt-2 text-sm text-[#4B0503]/70 italic">
                                File đã chọn:{" "}
                                <span className="font-medium text-[#4B0503]">
                                    {selectedFile?.name || gift.imageUrl.split("/").pop()}
                                </span>
                            </p>
                        )}
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-64 object-cover rounded-xl mt-4"
                            />
                        )}
                    </div>

                    {/* ===== SỐ LƯỢNG ===== */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Số lượng *
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => handleQuantityChange("dec")}
                                disabled={loading}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-bold"
                            >
                                −
                            </button>
                            <input
                                type="text"
                                value={formData.quantity}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === "" || /^\d+$/.test(v)) {
                                        setFormData((p) => ({ ...p, quantity: v }));
                                    }
                                }}
                                onBlur={() => {
                                    setFormData((p) => ({
                                        ...p,
                                        quantity: Math.max(0, Number(p.quantity) || 0).toString(),
                                    }));
                                }}
                                className="w-24 text-center py-3 rounded-lg border border-gray-300 font-semibold"
                            />
                            <button
                                type="button"
                                onClick={() => handleQuantityChange("inc")}
                                disabled={loading}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-bold"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* ===== ĐIỂM ===== */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Điểm quy đổi *
                        </label>
                        <input
                            type="text"
                            value={formData.point}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === "" || /^\d+$/.test(v)) {
                                    setFormData((p) => ({ ...p, point: v }));
                                }
                            }}
                            onBlur={() => {
                                setFormData((p) => ({
                                    ...p,
                                    point: Math.max(1, Number(p.point) || 1).toString(),
                                }));
                            }}
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Nơi nhận *
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleTextChange}
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="px-8 py-3 rounded-xl border">
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 rounded-xl text-white font-bold"
                        style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                    >
                        {loading ? "Đang lưu..." : "Cập nhật"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditGiftModal;
