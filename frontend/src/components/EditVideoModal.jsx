import React, { useEffect, useState, useRef } from "react";
import { FaTimes, FaUpload, FaSave, FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";
import { updateVideoApi } from "@/services/video.service";

const STATUS_OPTIONS = [
    { value: "draft", label: "Bản nháp" },
    { value: "published", label: "Đã xuất bản" },
];

const EditVideoModal = ({ isOpen, onClose, video, onSubmit }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("draft");
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState("");
    const [loading, setLoading] = useState(false);
    // State cho CustomDropdown trạng thái
    const [statusOpen, setStatusOpen] = useState(false);
    const statusRef = useRef(null);
    const isPublished = video?.status === "published";

    // Component CustomDropdown
    const CustomDropdown = ({
        refProp,
        open,
        setOpen,
        value,
        onChange,
        options,
        placeholder,
        label,
        disabled = false,
    }) => {
        const selectedOption = options.find((opt) => opt.value === value);

        return (
            <div className="relative" ref={refProp}>
                <label className="block text-sm mb-1.5 font-medium text-[#4B0503]">
                    {label}
                </label>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setOpen(!open)}
                    className={`w-full px-5 py-3 rounded-lg border border-gray-300 flex justify-between items-center transition-all duration-200
            ${disabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "hover:border-[#B40001] focus:border-[#B40001] focus:ring-2 focus:ring-[#B40001]/30 bg-white text-[#4B0503]"
                        }`}
                >
                    <span className={value ? "font-medium" : "text-gray-400"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <FaChevronDown
                        className={`text-lg transition-transform duration-200 ${open ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {open && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className="px-5 py-3 cursor-pointer hover:bg-[#F7DFA8]/30 active:bg-[#F7DFA8]/50 transition-colors text-[#4B0503]"
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        if (!isOpen || !video) return;

        setTitle(video.title || "");
        setDescription(video.description || "");
        setStatus(video.status || "draft");
        setVideoFile(null);
        setVideoPreview(video.videoUrl || "");
        setStatusOpen(false);
    }, [isOpen, video]);

    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            toast.error("Video không được lớn hơn 100MB");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoPreview(previewUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("description", description.trim());
            formData.append("status", status);
            if (videoFile) {
                formData.append("video", videoFile);
            }

            const res = await updateVideoApi(video._id, formData);

            toast.success("Cập nhật video thành công!");

            // Truyền trực tiếp dữ liệu mới về cha
            onSubmit(res.data);   // ← quan trọng: truyền res.data (object video đã update)

            onClose();
        } catch (err) {
            console.error("Update error:", err);
            const msg = err.response?.data?.message || "Cập nhật thất bại";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !video) return null;

    const handleStatusChange = (newStatus) => {
        // Nếu video đã xuất bản mà cố đổi về draft
        if (video.status === "published" && newStatus === "draft") {
            toast.error("Video đã xuất bản không thể chuyển về bản nháp");
            return;
        }

        setStatus(newStatus);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#4B0503]">Chỉnh sửa video</h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-3xl text-[#4B0503]/70 hover:text-[#B40001]"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* VIDEO PREVIEW */}
                    {videoPreview && (
                        <div className="relative rounded-xl overflow-hidden bg-black shadow-md">
                            <video
                                src={videoPreview}
                                controls
                                className="w-full h-[360px] object-contain bg-black"
                            />
                            {videoFile && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setVideoFile(null);
                                        setVideoPreview(video.videoUrl || "");
                                    }}
                                    className="absolute top-3 right-3 bg-red-500/90 text-white p-2.5 rounded-full hover:bg-red-600"
                                    disabled={loading}
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    )}

                    {/* TITLE */}
                    <div>
                        <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border outline-none focus:border-[#B40001]"
                            placeholder="Nhập tiêu đề video..."
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* UPLOAD VIDEO */}
                    <div>
                        <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                            Video mới (tùy chọn – để trống nếu không thay đổi)
                        </label>
                        <label
                            className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#B40001] hover:bg-red-50/30 transition-all duration-200"
                        >
                            <FaUpload className="text-4xl text-[#B40001] mb-3" />
                            <span className="text-sm text-gray-600 font-medium">
                                {videoFile ? videoFile.name : "Nhấp để tải video mới"}
                            </span>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="hidden"
                                disabled={loading}
                            />
                        </label>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                            Mô tả
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border outline-none focus:border-[#B40001] resize-y"
                            placeholder="Mô tả video (không bắt buộc)"
                            disabled={loading}
                        />
                    </div>

                    {/* STATUS - Custom Dropdown */}
                    <CustomDropdown
                        refProp={statusRef}
                        open={statusOpen}
                        setOpen={setStatusOpen}
                        value={status}
                        onChange={handleStatusChange}
                        options={STATUS_OPTIONS}
                        placeholder="Chọn trạng thái"
                        label="Trạng thái"
                        disabled={loading || isPublished}
                    />
                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 text-white rounded-lg font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
                            style={{
                                background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                            }}
                        >
                            <FaSave />
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVideoModal;