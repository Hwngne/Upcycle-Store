import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const PromotionConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  statusLabel,      // "Chấp nhận" hoặc "Từ chối"
  eventName = "sự kiện này", // Tên sự kiện để hiển thị trong modal
}) => {
  if (!isOpen) return null;

  const isApprove = statusLabel === "Chấp nhận";
  const actionText = isApprove ? "Chấp nhận" : "Từ chối";
  const gradient = isApprove
    ? "linear-gradient(90deg, #006400 0%, #228B22 100%)"
    : "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)";
  const iconBg = isApprove ? "#228B22/20" : "#B40001/20";
  const iconColor = isApprove ? "#228B22" : "#B40001";

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
          <div 
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: iconBg }}
          >
            {isApprove ? (
              <FaCheckCircle className="w-12 h-12" style={{ color: iconColor }} />
            ) : (
              <FaExclamationTriangle className="w-12 h-12" style={{ color: iconColor }} />
            )}
          </div>
          <h3 className="text-2xl font-bold text-[#4B0503] mb-3">
            Xác nhận {actionText.toLowerCase()}
          </h3>
          <p className="text-[#4B0503]/80 text-base leading-relaxed">
            Bạn có chắc chắn muốn <span className="font-semibold">{actionText.toLowerCase()}</span>{" "}
            quảng bá sự kiện{" "}
            <span className="font-bold text-[#B40001]">{eventName}</span>?
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
            style={{ background: gradient }}
          >
            {actionText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PromotionConfirmModal;