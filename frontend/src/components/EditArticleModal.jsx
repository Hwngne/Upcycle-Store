import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaUpload, FaChevronDown } from "react-icons/fa";
import { getQuizzesApi } from "@/services/quiz.service";

const STATUS_CONFIG = {
    draft: {
        label: "Bản nháp",
        gradient: "linear-gradient(90deg, #F7DFA8 0%, #D12B1E 100%)",
    },
    published: {
        label: "Đã xuất bản",
        gradient: "linear-gradient(90deg, #5B0704 0%, #A71D0D 100%)",
    },
};

const EditArticleModal = ({ isOpen, onClose, article, onSubmit }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [displayType, setDisplayType] = useState("home");
    const [status, setStatus] = useState("draft");
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [quizId, setQuizId] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isPublished = article?.status === "published";

    const displayRef = useRef(null);
    const statusRef = useRef(null);
    const quizRef = useRef(null);
    const [displayOpen, setDisplayOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [quizOpen, setQuizOpen] = useState(false);

    useEffect(() => {
        if (displayType === "hunt") {
            setQuizId("");
            setQuizOpen(false);
        }
    }, [displayType]);


    useEffect(() => {
        if (!isOpen) return;

        const fetchQuizzes = async () => {
            try {
                const res = await getQuizzesApi();
                console.log("Danh sách quiz nhận được từ API:", res.data.data);
                setQuizzes(res.data.data || []);
            } catch (err) {
                console.error("Lỗi lấy danh sách quiz", err);
            }
        };

        fetchQuizzes();
    }, [isOpen]);

    // Close dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (displayRef.current && !displayRef.current.contains(e.target)) setDisplayOpen(false);
            if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
            if (quizRef.current && !quizRef.current.contains(e.target)) setQuizOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen || !article) return;

        setTitle(article.title || "");
        setContent(article.content || "");
        setDisplayType(article.displayType || "home");
        setStatus(article.status || "draft");
        setAuthorName(article.authorName || "");
        setQuizId(article.quiz?._id || "");
        setThumbnailPreview(article.thumbnail || "");
        setThumbnailFile(null);
    }, [isOpen, article]);


    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) return alert("Vui lòng nhập tiêu đề bài báo!");
        if (!displayType) return alert("Vui lòng chọn loại hiển thị!");
        if (!status) return alert("Vui lòng chọn trạng thái bài báo!");

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("content", content.trim());
        formData.append("displayType", displayType);
        formData.append("status", status);
        formData.append("authorName", authorName.trim());

        if (thumbnailFile) formData.append("image", thumbnailFile);
        if (quizId) formData.append("quizId", quizId);

        try {
            await onSubmit(article._id, formData);
            //await onSubmit(formData);
            onClose();
        } catch (err) {
            console.error("Lỗi tạo bài báo:", err);
            alert("Tạo bài báo thất bại! Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) return alert("Ảnh thumbnail không được lớn hơn 5MB!");

        const reader = new FileReader();
        reader.onloadend = () => {
            setThumbnailFile(file);
            setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };
    // Component Dropdown chung (đồng bộ style cho tất cả)
    const CustomDropdown = ({
        refProp,
        open,
        setOpen,
        value,
        onChange,
        options,
        placeholder,
        label,
        isGradient = false,
        disabled = false,
    }) => {
        const selectedOption = options.find(opt => opt.value === value);

        return (
            <div className="relative" ref={refProp}>
                <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                    {label} {label.includes("*") && <span className="text-red-500">*</span>}
                </label>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setOpen(!open)}
                    className={`w-full px-4 py-3 rounded-md border flex justify-between items-center
        ${disabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "hover:border-[#B40001] text-[#4B0503]"
                        }
    `}
                >

                    <span className={value ? "" : "text-gray-400"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <FaChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                    <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-xl">
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className="px-4 py-3 cursor-pointer hover:bg-[#F7DFA8]/30"
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
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
                    <h3 className="text-xl font-bold text-[#4B0503]">Chỉnh sửa bài báo</h3>
                    <button
                        onClick={onClose}
                        className="text-3xl text-[#4B0503]/70 hover:text-[#B40001] transition-colors"
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tiêu đề */}
                    <div>
                        <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                            Tiêu đề bài báo <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border outline-none focus:border-[#B40001] transition-all duration-200"
                            placeholder="Nhập tiêu đề bài báo..."
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    {/* Loại hiển thị */}
                    <CustomDropdown
                        refProp={displayRef}
                        open={displayOpen}
                        setOpen={setDisplayOpen}
                        value={displayType}
                        onChange={setDisplayType}
                        options={[
                            { value: "home", label: "Trang chủ (Home)" },
                            { value: "hunt", label: "Săn điểm (Hunt)" },
                        ]}
                        placeholder="Chọn loại hiển thị"
                        label="Loại hiển thị"
                    />

                    {/* Gán Quiz */}
                    <CustomDropdown
                        refProp={quizRef}
                        open={quizOpen}
                        setOpen={setQuizOpen}
                        value={quizId}
                        onChange={setQuizId}
                        options={quizzes.map(q => ({ value: q._id, label: q.title }))}
                        disabled={displayType === "hunt"}
                        placeholder={
                            displayType === "hunt"
                                ? "Săn điểm không hỗ trợ Quiz"
                                : "— Không gán quiz —"
                        }
                        label="Gán bài Quiz (không bắt buộc)"
                    />

                    {isPublished ? (
                        <div>
                            <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                                Trạng thái
                            </label>

                            <span
                                className="inline-flex px-4 py-2 text-sm font-semibold text-white rounded-md"
                                style={{ background: STATUS_CONFIG.published.gradient }}
                            >
                                {STATUS_CONFIG.published.label}
                            </span>

                            <p className="mt-1 text-xs text-gray-500">
                                Bài viết đã xuất bản, không thể thay đổi trạng thái
                            </p>
                        </div>
                    ) : (
                        <CustomDropdown
                            refProp={statusRef}
                            open={statusOpen}
                            setOpen={setStatusOpen}
                            value={status}
                            onChange={setStatus}
                            options={Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
                                value: key,
                                label: cfg.label,
                            }))}
                            placeholder="Chọn trạng thái"
                            label="Trạng thái"
                        />
                    )}

                    {/* Tên tác giả */}
                    <div>
                        <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                            Tên tác giả <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border outline-none focus:border-[#B40001] transition-all duration-200"
                            placeholder="VD: Ban biên tập, Admin, Nguyễn Văn A"
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                            Ảnh thumbnail (tùy chọn)
                        </label>
                        {thumbnailPreview ? (
                            <div className="relative rounded-lg overflow-hidden shadow-md">
                                <img
                                    src={thumbnailPreview}
                                    alt="Preview thumbnail"
                                    className="w-full max-h-96 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setThumbnailFile(null);
                                        setThumbnailPreview("");
                                    }}
                                    className="absolute top-3 right-3 bg-red-500/90 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 transition"
                                    disabled={isSubmitting}
                                >
                                    <FaTimes size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#B40001] hover:bg-red-50/30 transition-all duration-200">
                                <FaUpload className="text-4xl text-[#B40001] mb-3" />
                                <span className="text-sm text-gray-600 font-medium">
                                    Nhấp để tải ảnh (JPG, PNG – tối đa 5MB)
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={isSubmitting}
                                />
                            </label>
                        )}
                    </div>

                    {/* Nội dung */}
                    <div>
                        <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                            Nội dung bài báo (tùy chọn)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={10}
                            className="w-full px-4 py-3 rounded-md border outline-none focus:border-[#B40001] transition-all duration-200 resize-y min-h-[140px]"
                            placeholder="Viết nội dung bài báo tại đây..."
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Nút hành động */}
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition disabled:opacity-70"
                            style={{
                                background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                            }}
                        >
                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditArticleModal;