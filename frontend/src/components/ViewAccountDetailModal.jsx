import React from "react";

const ViewAccountDetailModal = ({ isOpen, onClose, account }) => {
    if (!isOpen || !account) return null;

    const formatGender = (gender) => {
        if (!gender) return "-";
        return gender === "M" ? "Nam" : "Nữ";
    };

    const formatStatus = (status) => {
        if (status === "active") return "Còn hoạt động";
        if (status === "locked") return "Đã khóa";
        return status;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div
                className="relative z-10 w-[500px] max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-bold text-[#4B0503]">Chi tiết tài khoản</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-5 text-[#4B0503]">
                    {/* Vai trò */}
                    <div className="flex justify-between">
                        <span className="font-semibold">Vai trò:</span>
                        <span
                            className="px-4 py-1 text-sm font-semibold text-white rounded-md"
                            style={{
                                background:
                                    account.role === "student"
                                        ? "linear-gradient(90deg, #D12B1E 0%, #E5CFB5 100%)"
                                        : account.role === "admin"
                                            ? "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)"
                                            : "linear-gradient(90deg, #5B0704 0%, #D12B1E 100%)",
                            }}
                        >
                            {account.role === "student" ? "Sinh viên" : account.role === "admin" ? "Admin" : "Câu lạc bộ"}
                        </span>
                    </div>

                    {/* Email */}
                    <div className="flex justify-between">
                        <span className="font-semibold">Email:</span>
                        <span className="break-all text-right max-w-[60%]">{account.email || "-"}</span>
                    </div>

                    
                    {/* Trạng thái */}
                    <div className="flex justify-between">
                        <span className="font-semibold">Trạng thái:</span>
                        <span className={account.status === "active" ? "text-green-600" : "text-red-600"}>
                            {formatStatus(account.status)}
                        </span>
                    </div>

                    <hr className="border-gray-300" />

                    {/* Thông tin theo role */}
                    {account.role === "student" && (
                        <>
                            <div className="flex justify-between">
                                <span className="font-semibold">Mã số sinh viên:</span>
                                <span>{account.student_code || "-"}</span>
                            </div>
                            {/* Số điện thoại (chung cho mọi role) */}
                            <div className="flex justify-between">
                                <span className="font-semibold">Số điện thoại:</span>
                                <span>{account.phone_number || "-"}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-semibold">Họ và tên:</span>
                                <span>{account.student_name || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Giới tính:</span>
                                <span>{formatGender(account.gender)}</span>
                            </div>
                            
                        </>
                    )}

                    {account.role === "admin" && (
                        <>
                            <div className="flex justify-between">
                                <span className="font-semibold">Tên Admin:</span>
                                <span>{account.admin_name || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Giới tính:</span>
                                <span>{formatGender(account.admin_gender)}</span>
                            </div>
                            {/* Số điện thoại đã hiển thị ở trên (admin_phone đồng bộ với phone_number) */}
                        </>
                    )}

                    {account.role === "club" && account.club_info && (
                        <>
                            <div className="flex justify-between">
                                <span className="font-semibold">Tên câu lạc bộ:</span>
                                <span>{account.club_info.club_name || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Số điện thoại CLB:</span>
                                <span>{account.club_info.club_phone || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Chủ nhiệm CLB:</span>
                                <span>{account.club_info.president_name || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Số thành viên:</span>
                                <span>{account.club_info.member_count || 0} thành viên</span>
                            </div>
                            
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-md bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-semibold hover:shadow-lg transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewAccountDetailModal;