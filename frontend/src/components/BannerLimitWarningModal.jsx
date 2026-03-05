import React from "react";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const BannerLimitWarningModal = ({ isOpen, onClose, position, count, date }) => {
  if (!isOpen) return null;

  const positionText = position === "home" ? "Trang chủ" : "Diễn đàn";

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
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <FaExclamationTriangle className="w-12 h-12 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-[#4B0503] mb-3">
            Đã đạt giới hạn banner
          </h3>
          <p className="text-[#4B0503]/80 text-base leading-relaxed">
            Ngày <span className="font-bold">{date}</span> tại vị trí{" "}
            <span className="font-bold text-[#B40001]">{positionText}</span> đã có{" "}
            <span className="font-bold">{count}/3</span> banner được duyệt.
          </p>
          <p className="text-sm text-red-600 mt-4 font-medium">
            Không thể duyệt thêm banner cho ngày này tại vị trí này.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-12 py-3 rounded-xl bg-[#4B0503] text-white font-bold hover:bg-[#6B0704] transition"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BannerLimitWarningModal;