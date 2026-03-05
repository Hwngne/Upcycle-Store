import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateAccountApi } from "@/services/account.service";

const EditClubAccountModal = ({ isOpen, onClose, account, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        club_info: {
            club_name: "",
            president_name: "",
            member_count: 0,
            club_phone: "",  // ← Chỉ còn club_phone
        },
    });

    // Load dữ liệu khi mở modal
    useEffect(() => {
        if (account && account.club_info && isOpen) {
            setFormData(prev => ({
                ...prev,
                club_info: {
                    club_name: account.club_info.club_name || "",
                    president_name: account.club_info.president_name || "",
                    member_count: account.club_info.member_count || 0,
                    club_phone: account.club_info.club_phone || "",
                },
            }));
        }
    }, [account, isOpen]);

    // Reset form khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                club_info: {
                    club_name: "",
                    president_name: "",
                    member_count: 0,
                    club_phone: "",
                },
            });
        }
    }, [isOpen]);

    if (!isOpen || !account) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            club_info: {
                ...prev.club_info,
                [name]: name === "member_count" ? Number(value) || 0 : value,
            },
        }));
    };

    const handleSubmit = async () => {
        try {
            await updateAccountApi(account._id, formData);
            toast.success("Cập nhật CLB thành công!");
            onUpdateSuccess();
            onClose();
        } catch (err) {
            toast.error("Cập nhật thất bại");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-[500px] rounded-xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#4B0503]">Chỉnh sửa Câu lạc bộ</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">Tên CLB</label>
                        <input
                            name="club_name"
                            value={formData.club_info.club_name}
                            onChange={handleChange}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">Chủ nhiệm CLB</label>
                        <input
                            name="president_name"
                            value={formData.club_info.president_name}
                            onChange={handleChange}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">Số thành viên</label>
                        <input
                            type="number"
                            name="member_count"
                            value={formData.club_info.member_count}
                            onChange={handleChange}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">Số điện thoại CLB</label>
                        <input
                            name="club_phone"
                            value={formData.club_info.club_phone}
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
                        style={{ background: "linear-gradient(to right, #5B0704 0%, #D12B1E 100%)" }}
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditClubAccountModal;