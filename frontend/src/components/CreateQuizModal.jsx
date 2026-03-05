import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const CreateQuizModal = ({ isOpen, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        title: "",
        questions: 5,
        points: 10,
        status: "Bản nháp",
        visible: true,
    });

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!form.title.trim()) {
            alert("Vui lòng nhập tiêu đề bài quiz");
            return;
        }

        onSubmit({
            ...form,
            id: Date.now(),
            createdAt: new Date().toLocaleDateString("vi-VN"),
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl bg-white/90 backdrop-blur-md shadow-xl p-6 relative">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#4B0503]">
                        Tạo bài quiz mới
                    </h2>
                    <FaTimes
                        className="cursor-pointer text-gray-500 hover:text-red-600"
                        onClick={onClose}
                    />
                </div>

                {/* BODY */}
                <div className="space-y-4 text-sm text-[#4B0503]">
                    <div>
                        <label className="font-semibold">Tiêu đề bài quiz</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            className="mt-1 w-full px-4 py-2 rounded-md bg-white/70 border border-gray-200 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">Số câu hỏi</label>
                            <input
                                type="number"
                                min={1}
                                value={form.questions}
                                onChange={(e) =>
                                    handleChange("questions", Number(e.target.value))
                                }
                                className="mt-1 w-full px-4 py-2 rounded-md bg-white/70 border border-gray-200"
                            />
                        </div>

                        <div>
                            <label className="font-semibold">Điểm thưởng</label>
                            <input
                                type="number"
                                min={0}
                                value={form.points}
                                onChange={(e) =>
                                    handleChange("points", Number(e.target.value))
                                }
                                className="mt-1 w-full px-4 py-2 rounded-md bg-white/70 border border-gray-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">Trạng thái</label>
                            <select
                                value={form.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className="mt-1 w-full px-4 py-2 rounded-md bg-white/70 border border-gray-200"
                            >
                                <option>Bản nháp</option>
                                <option>Đã xuất bản</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-semibold">Hiển thị</label>
                            <select
                                value={form.visible}
                                onChange={(e) =>
                                    handleChange("visible", e.target.value === "true")
                                }
                                className="mt-1 w-full px-4 py-2 rounded-md bg-white/70 border border-gray-200"
                            >
                                <option value="true">Hiển thị</option>
                                <option value="false">Ẩn</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    <button
                        className="px-5 py-2 rounded-md text-white font-semibold shadow-md"
                        style={{
                            background:
                                "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                        }}
                        onClick={handleSubmit}
                    >
                        Tạo quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateQuizModal;
