// src/components/EditStudentAccountModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateAccountApi } from "@/services/account.service";

const EditStudentAccountModal = ({ isOpen, onClose, account, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        student_name: "",
        student_code: "",
        gender: "",
        phone_number: "",
    });

    const [genderOpen, setGenderOpen] = useState(false);
    const genderRef = useRef(null);
    useEffect(() => {
        if (!isOpen) {
            setGenderOpen(false);
        }
        if (account) {
            setFormData({
                student_name: account.student_name || "",
                student_code: account.student_code || "",
                gender: account.gender || "",
                phone_number: account.phone_number || "",
            });
        }
    }, [isOpen, account]);

    // ← THÊM EFFECT ĐỂ ĐÓNG DROPDOWN KHI CLICK NGOÀI
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (genderRef.current && !genderRef.current.contains(e.target)) {
                setGenderOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen || !account) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await updateAccountApi(account._id, formData);
            toast.success("Cập nhật sinh viên thành công!");
            onUpdateSuccess();
            onClose();
        } catch (err) {
            toast.error("Cập nhật thất bại");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-[420px] rounded-xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#4B0503]">Chỉnh sửa Sinh viên</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer">
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">Họ và tên</label>
                        <input
                            name="student_name"
                            value={formData.student_name}
                            onChange={handleChange}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">MSSV</label>
                        <input
                            name="student_code"
                            value={formData.student_code}
                            onChange={handleChange}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                        />
                    </div>

                    {/* DROPDOWN GIỚI TÍNH VỚI REF */}
                    <div className="relative" ref={genderRef}>
                        <label className="block text-sm mb-1 text-[#4B0503]">Giới tính</label>
                        <div
                            className="w-full rounded-md border px-3 py-2 cursor-pointer flex justify-between items-center outline-none focus:border-[#B40001]"
                            onClick={() => setGenderOpen(!genderOpen)}
                        >
                            {formData.gender === "M" ? "Nam" : formData.gender === "F" ? "Nữ" : "Chọn giới tính"}
                            <svg
                                className={`w-4 h-4 ml-2 transition-transform duration-200 ${genderOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        {genderOpen && (
                            <div className="absolute mt-1 w-full bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg overflow-hidden z-50">
                                <ul className="text-[#4B0503]">
                                    {["Nam", "Nữ"].map((g) => (
                                        <li
                                            key={g}
                                            className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                                            onClick={() => {
                                                setFormData((prev) => ({ ...prev, gender: g === "Nam" ? "M" : "F" }));
                                                setGenderOpen(false);
                                            }}
                                        >
                                            {g}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">Số điện thoại</label>
                        <input
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-md border cursor-pointer text-gray-600 hover:bg-gray-100">
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md text-white font-semibold"
                        style={{ background: "linear-gradient(to right, #B40001 0%, #E29A7D 100%)" }}
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStudentAccountModal;