import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "sonner";
import { changePasswordApi } from "@/services/auth.service";

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu mới không khớp");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Mật khẩu mới phải ít nhất 6 ký tự");
            return;
        }

        try {
            setLoading(true);
            await changePasswordApi({ old_password: oldPassword, new_password: newPassword });
            toast.success("Đổi mật khẩu thành công!");
            onClose();
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div
                className="relative z-10 w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-md p-8 shadow-2xl border border-white/30"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold text-[#4B0503] mb-6">Đổi mật khẩu</h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Mật khẩu cũ</label>
                        <input
                            type={showOld ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none pr-12"
                        />
                        <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-10 text-gray-600">
                            {showOld ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Mật khẩu mới</label>
                        <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none pr-12"
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-10 text-gray-600">
                            {showNew ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Xác nhận mật khẩu mới</label>
                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none pr-12"
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-10 text-gray-600">
                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100">
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-semibold disabled:opacity-70"
                        >
                            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;