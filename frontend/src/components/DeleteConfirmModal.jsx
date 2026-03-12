// src/components/DeleteConfirmModal.jsx
import React from "react";
import { motion } from "framer-motion";

const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,        // Tên của đối tượng đang xóa (ví dụ: tên quà, tên tài khoản, tên CLB...)
    itemType = "mục này", // Loại đối tượng (mặc định "mục này" nếu không truyền)
    actionText = "Xóa",   // Text trên nút xác nhận (mặc định "Xóa")
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 w-[420px] rounded-2xl bg-white/95 backdrop-blur-md p-8 shadow-2xl border border-white/30"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <svg
                            className="w-12 h-12 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-[#4B0503] mb-3">
                        Xác nhận {actionText.toLowerCase()}
                    </h3>
                    <p className="text-[#4B0503]/80 text-base leading-relaxed">
                        Bạn có chắc chắn muốn <span className="font-semibold">{actionText.toLowerCase()}</span>{" "}
                        <span className="font-bold text-[#B40001]">{itemName || itemType}</span>?
                    </p>
                    <p className="text-sm text-red-600 mt-4 font-medium">
                        Hành động này <span className="underline">không thể hoàn tác</span>!
                    </p>
                </div>

                <div className="flex justify-center gap-6">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition"
                        style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                    >
                        {actionText}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default DeleteConfirmModal;