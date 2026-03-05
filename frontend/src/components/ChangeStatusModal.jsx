// src/components/ChangeStatusModal.jsx
import React from "react";

const ChangeStatusModal = ({ isOpen, currentStatus, newStatus, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Modal */}
            <div
                className="relative z-10 w-[400px] rounded-xl bg-white p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#4B0503]">Xác nhận đổi trạng thái</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="mb-6 text-[#4B0503]">
                    <p>
                        Bạn có chắc chắn muốn đổi trạng thái từ{" "}
                        <span className="font-semibold">{currentStatus}</span> sang{" "}
                        <span className="font-semibold">{newStatus}</span> không?
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border cursor-pointer text-gray-600 hover:bg-gray-100"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md text-white cursor-pointer"
                        style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeStatusModal;
