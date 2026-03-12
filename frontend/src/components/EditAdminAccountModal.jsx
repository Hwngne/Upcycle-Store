// src/components/EditAdminAccountModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateAccountApi } from "@/services/account.service";

const EditAdminAccountModal = ({ isOpen, onClose, account, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        email: "",
        admin_name: "",
        admin_gender: "",
        phone_number: "", // Dùng phone_number để backend đồng bộ với admin_phone
    });

    const [genderOpen, setGenderOpen] = useState(false);
    const genderRef = useRef(null);

    // Reset form khi mở modal và load dữ liệu từ account
    useEffect(() => {
        if (isOpen && account) {
            setFormData({
                email: account.email || "",
                admin_name: account.admin_name || "",
                admin_gender: account.admin_gender || "",
                phone_number: account.phone_number || account.admin_phone || "", // Ưu tiên phone_number nếu có
            });
        }
    }, [isOpen, account]);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (genderRef.current && !genderRef.current.contains(e.target)) {
                setGenderOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    if (!isOpen || !account) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await updateAccountApi(account._id, formData);
            toast.success("Cập nhật tài khoản admin thành công!");
            onUpdateSuccess();
            onClose();
        } catch (err) {
            const message = err.response?.data?.message || "Cập nhật thất bại";
            toast.error(message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div
                className="relative z-10 w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white/90 backdrop-blur-md p-8 shadow-2xl border border-white/30"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-[#4B0503]">Chỉnh sửa tài khoản Admin</h3>
                    <button
                        onClick={onClose}
                        className="text-2xl text-gray-500 hover:text-gray-700 font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition"
                            placeholder="example@vanlanguni.vn"
                            required
                        />
                        <p className="text-xs text-[#4B0503]/60 mt-1">Phải có đuôi @vanlanguni.vn</p>
                    </div>

                    {/* Họ và tên */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="admin_name"
                            value={formData.admin_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition"
                            required
                        />
                    </div>

                    {/* Giới tính - Dropdown */}
                    <div className="relative" ref={genderRef}>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Giới tính</label>
                        <div
                            onClick={() => setGenderOpen(!genderOpen)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 flex justify-between items-center cursor-pointer hover:border-[#B40001] transition"
                        >
                            <span>
                                {formData.admin_gender === "M"
                                    ? "Nam"
                                    : formData.admin_gender === "F"
                                        ? "Nữ"
                                        : "Chọn giới tính"}
                            </span>
                            <svg
                                className={`w-5 h-5 text-[#4B0503]/60 transition-transform ${genderOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {genderOpen && (
                            <div className="absolute mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                {["Nam", "Nữ"].map((g) => (
                                    <div
                                        key={g}
                                        onClick={() => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                admin_gender: g === "Nam" ? "M" : "F",
                                            }));
                                            setGenderOpen(false);
                                        }}
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/50 cursor-pointer transition"
                                    >
                                        {g}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Số điện thoại</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="Ví dụ: 0901234567"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none transition"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition"
                        style={{
                            background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                        }}
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditAdminAccountModal;