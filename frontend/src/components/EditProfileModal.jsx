// src/components/EditProfileModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateMyProfileApi } from "@/services/account.service";

const EditProfileModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const genderRef = useRef(null);
    const [genderOpen, setGenderOpen] = useState(false);

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen && user) {
            if (user.role === "Sinh viên") {
                setFormData({
                    student_name: user.name || "",
                    gender: user.gender === "Nam" ? "M" : user.gender === "Nữ" ? "F" : "",
                });
            } else if (user.role === "Admin") {
                setFormData({
                    email: user.email || "", // ← Cho phép sửa email
                    admin_name: user.name || "",
                    admin_gender: user.gender === "Nam" ? "M" : user.gender === "Nữ" ? "F" : "",
                    admin_phone: user.phone_number || "",
                });
            } else if (user.role === "Câu lạc bộ") {
                setFormData({
                    club_info: {
                        club_name: user.name || "",
                        president_name: user.president || "",
                        member_count: user.memberCount || 0,
                    },
                });
            }
        }
    }, [isOpen, user]);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (genderRef.current && !genderRef.current.contains(e.target)) {
                setGenderOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (user.role === "Câu lạc bộ") {
            setFormData({
                ...formData,
                club_info: {
                    ...formData.club_info,
                    [name]: name === "member_count" ? Number(value) || 0 : value,
                },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await updateMyProfileApi(formData);
            toast.success("Cập nhật hồ sơ thành công!");
            onSuccess(); // Refresh profile
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div
                className="relative z-10 w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-md p-8 shadow-2xl border border-white/30"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold text-[#4B0503] mb-6 text-center">Chỉnh sửa hồ sơ</h3>

                <div className="space-y-5">
                    {/* === ADMIN - ĐƯỢC SỬA EMAIL === */}
                    {user.role === "Admin" && (
                        <>
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                                    placeholder="nhapemail@vanlanguni.vn"
                                    required
                                />
                                <p className="text-xs text-[#4B0503]/60 mt-1">Phải có đuôi @vanlanguni.vn</p>
                            </div>

                            {/* Họ và tên */}
                            <div>
                                <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    name="admin_name"
                                    value={formData.admin_name || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="admin_phone"
                                    value={formData.admin_phone || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            {/* Giới tính */}
                            <div className="relative" ref={genderRef}>
                                <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Giới tính</label>
                                <div
                                    onClick={() => setGenderOpen(!genderOpen)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 flex justify-between items-center cursor-pointer bg-white"
                                >
                                    <span>
                                        {formData.admin_gender === "M" ? "Nam" : formData.admin_gender === "F" ? "Nữ" : "Chọn giới tính"}
                                    </span>
                                    <svg
                                        className={`w-5 h-5 transition-transform ${genderOpen ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                {genderOpen && (
                                    <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                        {["Nam", "Nữ"].map((g) => (
                                            <div
                                                key={g}
                                                onClick={() => {
                                                    setFormData({ ...formData, admin_gender: g === "Nam" ? "M" : "F" });
                                                    setGenderOpen(false);
                                                }}
                                                className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                            >
                                                {g}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* === SINH VIÊN (giữ nguyên) === */}
                    {user.role === "Sinh viên" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    name="student_name"
                                    value={formData.student_name || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            <div className="relative" ref={genderRef}>
                                <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Giới tính</label>
                                <div
                                    onClick={() => setGenderOpen(!genderOpen)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 flex justify-between items-center cursor-pointer bg-white"
                                >
                                    <span>{formData.gender === "M" ? "Nam" : formData.gender === "F" ? "Nữ" : "Chọn giới tính"}</span>
                                    <svg className={`w-5 h-5 transition-transform ${genderOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                {genderOpen && (
                                    <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                        {["Nam", "Nữ"].map((g) => (
                                            <div
                                                key={g}
                                                onClick={() => {
                                                    setFormData({ ...formData, gender: g === "Nam" ? "M" : "F" });
                                                    setGenderOpen(false);
                                                }}
                                                className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                            >
                                                {g}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* === CÂU LẠC BỘ (giữ nguyên) === */}
                    {user.role === "Câu lạc bộ" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Tên câu lạc bộ</label>
                                <input
                                    type="text"
                                    name="club_name"
                                    value={formData.club_info?.club_name || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                                    placeholder="Tên câu lạc bộ"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Chủ nhiệm CLB</label>
                                <input
                                    type="text"
                                    name="president_name"
                                    value={formData.club_info?.president_name || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                                    placeholder="Tên chủ nhiệm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Số thành viên</label>
                                <input
                                    type="number"
                                    name="member_count"
                                    value={formData.club_info?.member_count || 0}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                                />
                            </div>
                        </>
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
                        disabled={loading}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-semibold disabled:opacity-70 transition"
                    >
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;