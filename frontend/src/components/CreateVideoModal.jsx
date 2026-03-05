// src/components/CreateVideoModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FaTimes, FaUpload } from "react-icons/fa";
import { createVideoApi } from "@/services/video.service";

const CreateVideoModal = ({ open, onClose, onCreated }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "draft",
    });
    const [videoFile, setVideoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false); // Thêm state cho dropdown trạng thái

    const modalRef = useRef(null);
    const fileInputRef = useRef(null);
    const statusRef = useRef(null); // Ref cho dropdown status

    // Reset form khi đóng modal
    useEffect(() => {
        if (!open) {
            setFormData({ title: "", description: "", status: "draft" });
            setVideoFile(null);
            setLoading(false);
            setStatusOpen(false);
        }
    }, [open]);

    // Đóng modal khi click ngoài (backdrop)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
            // Đóng dropdown status nếu click ra ngoài
            if (statusRef.current && !statusRef.current.contains(e.target)) {
                setStatusOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) return toast.error("Vui lòng nhập tiêu đề video");
        if (!videoFile) return toast.error("Vui lòng chọn file video");
        if (!["draft", "published"].includes(formData.status)) {
            return toast.error("Trạng thái không hợp lệ");
        }

        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("status", formData.status);
        formDataToSend.append("video", videoFile);

        try {
            setLoading(true);
            const res = await createVideoApi(formDataToSend);
            toast.success("Tạo video thành công!");
            onCreated(res.data);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Tạo video thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm chọn trạng thái
    const selectStatus = (value) => {
        setFormData((prev) => ({ ...prev, status: value }));
        setStatusOpen(false);
    };

    // Hiển thị text trạng thái
    const getStatusDisplay = () => {
        if (formData.status === "draft") return "Bản nháp";
        if (formData.status === "published") return "Đã xuất bản";
        return "Chọn trạng thái";
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Modal content */}
            <div
                ref={modalRef}
                className="relative z-10 w-[520px] max-h-[90vh] rounded-xl bg-white p-6 shadow-lg overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#4B0503]">Thêm Video Mới</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Form fields */}
                <div className="space-y-5">
                    {/* Tiêu đề */}
                    <div>
                        <label className="block text-sm mb-1.5 text-[#4B0503] font-medium">
                            Tiêu đề video <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-[#B40001] transition"
                            placeholder="Nhập tiêu đề video"
                        />
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm mb-1.5 text-[#4B0503] font-medium">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-[#B40001] transition resize-none"
                            placeholder="Mô tả ngắn gọn về video (tùy chọn)"
                        />
                    </div>

                    {/* Trạng thái - Custom Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <label className="block text-sm mb-1.5 text-[#4B0503] font-medium">
                            Trạng thái <span className="text-red-500">*</span>
                        </label>
                        <div
                            className="w-full rounded-md border px-4 py-2.5 cursor-pointer flex justify-between items-center bg-white"
                            onClick={() => setStatusOpen(!statusOpen)}
                        >
                            <span className={formData.status ? "text-[#4B0503]" : "text-gray-500"}>
                                {getStatusDisplay()}
                            </span>
                            <svg
                                className={`w-4 h-4 ml-2 transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {statusOpen && (
                            <div className="absolute mt-1 w-full bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50 max-h-60 overflow-y-auto">
                                <ul className="text-[#4B0503]">
                                    <li
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                                        onClick={() => selectStatus("draft")}
                                    >
                                        Bản nháp
                                    </li>
                                    <li
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                                        onClick={() => selectStatus("published")}
                                    >
                                        Đã xuất bản
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Upload video */}
                    <div>
                        <label className="block text-sm mb-1.5 text-[#4B0503] font-medium">
                            Video upload <span className="text-red-500">*</span>
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition
                                ${videoFile ? "border-[#B40001] bg-[#B40001]/5" : "border-gray-300 hover:border-[#B40001]/50 hover:bg-gray-50"}`}
                        >
                            <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600">
                                {videoFile ? (
                                    <span className="font-medium text-[#B40001]">{videoFile.name}</span>
                                ) : (
                                    "Nhấn hoặc kéo thả video vào đây"
                                )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {videoFile ? "Đã chọn" : "MP4, MOV, WebM • Tối đa 500MB"}
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-md text-white font-medium shadow-lg hover:shadow-xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                        }}
                    >
                        {loading ? "Đang tạo..." : "Tạo video"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateVideoModal;