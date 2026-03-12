import React from "react";
import {
    FaTimes,
    FaEye,
    FaCalendarAlt,
    FaVideo,
} from "react-icons/fa";

const STATUS_LABEL = {
    draft: "Bản nháp",
    published: "Đã xuất bản",
};

const ViewVideoModal = ({ isOpen, onClose, video }) => {
    if (!isOpen || !video) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Modal */}
            <div
                className="relative z-10 w-full max-w-5xl max-h-[90vh]
                overflow-y-auto rounded-xl bg-white p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#4B0503]">
                        Chi tiết video
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-3xl text-[#4B0503]/70 hover:text-[#B40001]"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6">
                    {/* VIDEO PLAYER */}
                    <div className="w-full rounded-xl overflow-hidden shadow-md bg-black">
                        <video
                            src={video.videoUrl}
                            controls
                            className="w-full h-[420px] object-contain bg-black"
                        />
                    </div>

                    {/* TITLE + META */}
                    <div>
                        <h2 className="text-2xl font-bold text-[#4B0503] mb-2">
                            {video.title}
                        </h2>

                        <div className="flex flex-wrap gap-6 text-sm text-[#4B0503]/70">
                            <div className="flex items-center gap-2">
                                <FaCalendarAlt className="mt-0.25" />
                                <span>
                                    Ngày tạo:{" "}
                                    {video.createdAt
                                        ? new Date(video.createdAt).toLocaleString("vi-VN")
                                        : "--"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <FaEye className="mt-0.5" />
                                <span>
                                    Lượt xem: {(video.views || 0).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <FaVideo className="mt-0.5"/>
                                <span>
                                    Trạng thái:{" "}
                                    <b>{STATUS_LABEL[video.status]}</b>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <h4 className="text-lg font-semibold text-[#4B0503] mb-3">
                            Mô tả video
                        </h4>
                        <div className="whitespace-pre-wrap text-[#4B0503]/90">
                            {video.description || (
                                <p className="italic text-[#4B0503]/50">
                                    Không có mô tả
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg bg-gray-200
                        text-[#4B0503] font-medium hover:bg-gray-300"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewVideoModal;
