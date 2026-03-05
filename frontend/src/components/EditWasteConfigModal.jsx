// src/components/EditWasteConfigModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const EditWasteConfigModal = ({ isOpen, onClose, item, onSuccess }) => {
    const [formData, setFormData] = useState({ name: "", description: "" });

    useEffect(() => {
        if (isOpen && item) {
            setFormData({
                name: item.name || "",
                description: item.description || "",
            });
        }
    }, [isOpen, item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("Tên không được để trống");
            return;
        }

        try {
            await onSuccess({ ...formData, name: formData.name.trim() }); // onSuccess sẽ gọi API update
            toast.success("Cập nhật thành công!");
            onClose();
        } catch (err) {
            toast.error("Cập nhật thất bại");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div
                className="relative z-10 w-[420px] rounded-2xl bg-white/95 backdrop-blur-md p-8 shadow-2xl border border-white/30"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold text-[#4B0503] mb-6 text-center">
                    Chỉnh sửa {item?.category === "waste_type" ? "Loại rác" : "Khu vực"}
                </h3>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Tên</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                            placeholder="Nhập tên"
                        />
                    </div>

                    {item?.category === "waste_type" && (
                        <div>
                            <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Mô tả</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                                placeholder="Nhập mô tả (tùy chọn)"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-semibold transition"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditWasteConfigModal;