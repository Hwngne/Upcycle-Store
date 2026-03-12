import React from "react";
import {
    FaTimes,
    FaGift,
    FaUser,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaTag,
    FaCoins,
} from "react-icons/fa";

const STATUS_LABEL = {
    pending: "Chờ nhận",
    completed: "Đã nhận",
    expired: "Quá hạn",
    cancelled: "Đã hủy",
};

const STATUS_COLOR = {
    pending: "#d97706",
    completed: "#059669",
    expired: "#dc2626",
    cancelled: "#6b7280",
};

const ViewRewardModal = ({ isOpen, onClose, reward }) => {
    if (!isOpen || !reward) return null;
    const getRewardsterName = (account) => {
        if (!account) return "N/A";

        if (account.role === "student") {
            return account.student_name || account.email;
        }

        if (account.role === "club") {
            return account.club_info?.club_name || account.email;
        }

        if (account.role === "admin") {
            return account.admin_name || account.email;
        }

        return account.email || "N/A";
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/40" />

            <div
                className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#4B0503]">
                        Chi tiết đổi quà
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-3xl text-[#4B0503]/70 hover:text-[#B40001]"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Gift image */}
                    {reward.giftImage ? (
                        <img
                            src={reward.giftImage}
                            alt={reward.giftName}
                            className="w-full h-72 object-cover rounded-xl shadow"
                        />
                    ) : (
                        <div className="w-full h-72 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                            Không có hình ảnh
                        </div>
                    )}

                    {/* Gift name */}
                    <h2 className="text-2xl font-bold text-[#4B0503]">
                        {reward.giftName}
                    </h2>

                    {/* Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <FaUser />
                            <span className="text-sm">
                                Người đổi:{" "}
                                <span className="font-medium">
                                    {getRewardsterName(reward.account || reward.user)}
                                </span>
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <FaCoins />
                            <span className="text-sm">
                                Điểm đã dùng:{" "}
                                <strong>{reward.pointsSpent}</strong>
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <FaMapMarkerAlt />
                            <span className="text-sm">
                                Nơi nhận: {reward.location}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <FaTag />
                            <span className="text-sm">
                                Mã nhận thưởng: {reward.redemptionCode}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <FaCalendarAlt />
                            <span className="text-sm">
                                Ngày đổi:{" "}
                                {reward.createdAt
                                    ? new Date(reward.createdAt).toLocaleString("vi-VN")
                                    : "--"}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <FaCalendarAlt />
                            <span className="text-sm">
                                Hết hạn:{" "}
                                {reward.expiresAt
                                    ? new Date(reward.expiresAt).toLocaleString("vi-VN")
                                    : "--"}
                            </span>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-[#4B0503]/60">Trạng thái</p>
                        <p
                            className="text-lg font-semibold mt-1"
                            style={{ color: STATUS_COLOR[reward.status] }}
                        >
                            {STATUS_LABEL[reward.status] || reward.status}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg bg-gray-200 text-[#4B0503] font-medium hover:bg-gray-300"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewRewardModal;
