import React from "react";
import {
    FaTimes,
    FaEye,
    FaCalendarAlt,
    FaUser,
    FaTag,
    FaListUl,
} from "react-icons/fa";

const STATUS_LABEL = {
    draft: "Bản nháp",
    published: "Đã xuất bản",
};

const DISPLAY_LABEL = {
    home: "Trang chủ",
    hunt: "Săn điểm",
};

const ViewArticleModal = ({ isOpen, onClose, article }) => {
    if (!isOpen || !article) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/40" />

            <div
                className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#4B0503]">
                        Chi tiết bài báo
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-3xl text-[#4B0503]/70 hover:text-[#B40001] transition"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Thumbnail */}
                    {article.thumbnail ? (
                        <img
                            src={article.thumbnail}
                            alt="Thumbnail"
                            className="w-full h-96 object-cover rounded-xl shadow-md"
                        />
                    ) : (
                        <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                            Không có ảnh thumbnail
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <h2 className="text-2xl font-bold text-[#4B0503] mb-2">
                            {article.title}
                        </h2>

                        <div className="flex flex-wrap gap-6 text-sm text-[#4B0503]/70">
                            <div className="flex items-center gap-2">
                                <FaUser />
                                <span>Tác giả: {article.authorName || "Admin"}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <FaCalendarAlt />
                                <span>
                                    Ngày tạo:{" "}
                                    {article.createdAt
                                        ? new Date(article.createdAt).toLocaleString("vi-VN")
                                        : "--"}
                                </span>
                            </div>

                            {typeof article.views === "number" && (
                                <div className="flex items-center gap-2">
                                    <FaEye />
                                    <span>
                                        Lượt xem: {article.views.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-[#4B0503]/60">Trạng thái</p>
                            <p
                                className="text-lg font-semibold mt-1"
                                style={{
                                    color:
                                        article.status === "published"
                                            ? "#059669"
                                            : "#d97706",
                                }}
                            >
                                {STATUS_LABEL[article.status] || article.status}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-[#4B0503]/60">
                                Loại hiển thị
                            </p>
                            <p className="text-lg font-semibold mt-1 text-[#4B0503]">
                                {DISPLAY_LABEL[article.displayType] ||
                                    article.displayType}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-[#4B0503]/60">
                                Quiz gán
                            </p>
                            <p className="text-sm font-medium mt-1 text-[#4B0503]">
                                {article.quiz?.title || "Không gán quiz"}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-[#4B0503]/60">ID bài báo</p>

                            <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="text-sm font-mono text-[#4B0503]/80">
                                    #{article._id.slice(0, 6)}…{article._id.slice(-4)}
                                </span>

                                <button
                                    onClick={() => navigator.clipboard.writeText(article._id)}
                                    className="text-xs text-[#B40001] hover:underline"
                                    title="Sao chép ID"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>


                    </div>

                    {/* Content */}
                    <div>
                        <h4 className="text-lg font-semibold text-[#4B0503] mb-3">
                            Nội dung bài báo
                        </h4>
                        <div className="prose max-w-none whitespace-pre-wrap text-[#4B0503]/90">
                            {article.content ? (
                                article.content
                            ) : (
                                <p className="italic text-[#4B0503]/50">
                                    Không có nội dung (bài báo đang ở trạng thái
                                    nháp hoặc chưa hoàn thiện).
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg bg-gray-200 text-[#4B0503] font-medium hover:bg-gray-300 transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewArticleModal;
