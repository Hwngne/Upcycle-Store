// src/components/CreateProductTypeModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createContentConfigApi } from "@/services/contentConfig.service";

const CreateProductTypeModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "", // Thêm description
    });

    const [loading, setLoading] = useState(false);

    // Reset form khi modal đóng/mở
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: "", description: "" });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const trimmedName = formData.name.trim();
        const trimmedDescription = formData.description.trim();

        if (!trimmedName) {
            toast.error("Vui lòng nhập tên loại sản phẩm!");
            return;
        }

        setLoading(true);
        try {
            await createContentConfigApi({
                category: "product_type",
                name: trimmedName,
                description: trimmedDescription, // Gửi description (có thể rỗng)
            });

            toast.success("Thêm loại sản phẩm thành công!");
            onSubmit(); // Refresh danh sách ở page cha
            onClose();
        } catch (err) {
            const message = err.response?.data?.message || "Thêm loại sản phẩm thất bại";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Modal */}
            <div
                className="relative z-10 w-[420px] rounded-2xl bg-white/95 backdrop-blur-md p-8 shadow-2xl border border-white/30"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-[#4B0503]">
                        Tạo loại sản phẩm
                    </h3>
                </div>

                <div className="space-y-5">
                    {/* Tên loại sản phẩm */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-2">
                            Tên loại sản phẩm <span className="text-red-600">*</span>
                        </label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ví dụ: Đồ Handmade, Thiết bị điện tử, Thực phẩm..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] focus:ring-2 focus:ring-[#B40001]/20 outline-none transition"
                            disabled={loading}
                        />
                    </div>

                    {/* Mô tả (tùy chọn) */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-2">
                            Mô tả (tùy chọn)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Mô tả ngắn về loại sản phẩm này..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] focus:ring-2 focus:ring-[#B40001]/20 outline-none transition resize-none"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-3 rounded-lg text-white font-bold shadow-lg hover:shadow-xl transition disabled:opacity-70"
                        style={{
                            background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                        }}
                    >
                        {loading ? "Đang lưu..." : "Lưu loại sản phẩm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProductTypeModal;