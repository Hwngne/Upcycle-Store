// Frontend: EditActivityConfigModal.jsx

import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";

const popularIcons = [
    "Trophy", "Star", "Coins", "Gift", "Medal", "Award", "Gem", "Crown",
    "Zap", "Flame", "Heart", "ThumbsUp", "Rocket", "Target", "Badge",
    "Sparkles", "PartyPopper", "Lightbulb", "BookOpen", "GraduationCap",
    "Users", "Calendar", "ShoppingCart", "MessageCircle", "Image", "Video",
    "CheckCircle", "Clock", "DollarSign", "TrendingUp", "HelpCircle"
];

const EditActivityConfigModal = ({ isOpen, onClose, onSubmit, activityType, activity }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        hunted_point: 0,
        iconName: "Trophy",
    });

    const [searchIcon, setSearchIcon] = useState("");

    useEffect(() => {
        if (activity) {
            setFormData({
                title: activity.name, // 🔥 FIX
                hunted_point: activity.hunted_point,
                description: activity.description || "",
                iconName: activity.iconName || "Trophy",
            });

        }
    }, [activity]);


    if (!isOpen || !activity) return null;

    const handleSubmit = () => {
        const points = Number(formData.hunted_point);

        // Bảo vệ: nếu NaN hoặc < 0 thì báo lỗi
        if (isNaN(points) || points < 0) {
            alert("Vui lòng nhập số điểm hợp lệ (≥ 0)");
            return;
        }

        onSubmit({
            _id: activity._id,
            hunted_point: formData.hunted_point,
            description: formData.description,
            iconName: formData.iconName,
        });

    };

    const SelectedIcon = LucideIcons[formData.iconName] || LucideIcons.Trophy;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Modal */}
            <div
                className="relative z-10 w-[520px] max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#4B0503]">
                        Chỉnh sửa cấu hình điểm thưởng
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Title (locked) */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Tên hoạt động
                        </label>
                        <div className="w-full rounded-md border bg-gray-100 px-3 py-2 text-gray-600 cursor-not-allowed">
                            {formData.title}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Mô tả chi tiết
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={4}
                            className="w-full rounded-md border px-3 py-2 outline-none resize-none focus:border-[#B40001]"
                        />
                    </div>

                    {/* Points */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Điểm thưởng
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.hunted_point}
                            onChange={(e) => {
                                const val = e.target.value;
                                // Cho phép rỗng tạm thời, nhưng không cho NaN khi submit
                                setFormData({
                                    ...formData,
                                    hunted_point: val === "" ? "" : Math.max(0, Number(val)),
                                });
                            }}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                        />
                    </div>

                    {/* Icon picker */}
                    <div>
                        <label className="block text-sm mb-2 text-[#4B0503]">
                            Icon
                        </label>

                        <div className="flex items-center gap-3 mb-3 p-3 border rounded-lg bg-gray-50">
                            <SelectedIcon className="text-2xl text-[#B40001]" />
                            <span className="font-medium text-[#4B0503]">
                                {formData.iconName}
                            </span>
                        </div>

                        <input
                            placeholder="Tìm icon..."
                            value={searchIcon}
                            onChange={(e) => setSearchIcon(e.target.value)}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001] mb-3"
                        />

                        <div className="grid grid-cols-6 gap-3 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                            {popularIcons
                                .filter(icon =>
                                    icon.toLowerCase().includes(searchIcon.toLowerCase())
                                )
                                .map(icon => {
                                    const Icon = LucideIcons[icon];
                                    return (
                                        <button
                                            key={icon}
                                            onClick={() =>
                                                setFormData({ ...formData, iconName: icon })
                                            }
                                            className={`p-3 rounded-lg transition-all ${formData.iconName === icon
                                                ? "bg-[#B40001] text-white shadow-md"
                                                : "bg-white border hover:bg-gray-200"
                                                }`}
                                        >
                                            <Icon className="text-xl mx-auto" />
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md text-white"
                        style={{
                            background:
                                "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                        }}
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditActivityConfigModal;