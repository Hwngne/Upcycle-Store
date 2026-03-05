// src/components/EditWasteStationModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";

const EditWasteStationModal = ({ isOpen, onClose, station, onSuccess, typeOptions = [], areaOptions = [] }) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        area: "",
        address: "",
        contact: "",
    });

    const [typeOpen, setTypeOpen] = useState(false);
    const [areaOpen, setAreaOpen] = useState(false);

    const typeRef = useRef(null);
    const areaRef = useRef(null);

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen && station) {
            setFormData({
                name: station.name || "",
                type: station.type || "",
                area: station.area || "",
                address: station.address || "",
                contact: station.contact || "",
            });
        }
    }, [isOpen, station]);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false);
            if (areaRef.current && !areaRef.current.contains(e.target)) setAreaOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.type || !formData.area || !formData.address.trim()) {
            toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
            return;
        }

        try {
            await onSuccess(formData);
            toast.success("Cập nhật trạm thu gom thành công!");
            onClose();
        } catch (err) {
            toast.error("Cập nhật thất bại");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div
                className="relative z-10 w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-md p-8 shadow-2xl border border-white/30"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold text-[#4B0503] mb-6 text-center">
                    Chỉnh sửa trạm thu gom
                </h3>

                <div className="space-y-5">
                    {/* Tên trạm */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Tên trạm</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                            placeholder="Nhập tên trạm"
                        />
                    </div>

                    {/* Loại rác */}
                    <div className="relative" ref={typeRef}>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Loại rác tiếp nhận</label>
                        <div
                            onClick={() => { setTypeOpen(!typeOpen); setAreaOpen(false); }}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 flex justify-between items-center cursor-pointer bg-white"
                        >
                            <span>{formData.type || "Chọn loại rác"}</span>
                            <FaChevronDown className={`w-5 h-5 transition-transform ${typeOpen ? "rotate-180" : ""}`} />
                        </div>
                        {typeOpen && (
                            <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                                {typeOptions.map((option) => (
                                    <div
                                        key={option}
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, type: option }));
                                            setTypeOpen(false);
                                        }}
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Khu vực */}
                    <div className="relative" ref={areaRef}>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Khu vực</label>
                        <div
                            onClick={() => { setAreaOpen(!areaOpen); setTypeOpen(false); }}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 flex justify-between items-center cursor-pointer bg-white"
                        >
                            <span>{formData.area || "Chọn khu vực"}</span>
                            <FaChevronDown className={`w-5 h-5 transition-transform ${areaOpen ? "rotate-180" : ""}`} />
                        </div>
                        {areaOpen && (
                            <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                                {areaOptions.map((option) => (
                                    <div
                                        key={option}
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, area: option }));
                                            setAreaOpen(false);
                                        }}
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Địa chỉ */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Địa chỉ</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                            placeholder="Nhập địa chỉ"
                        />
                    </div>

                    {/* Liên hệ */}
                    <div>
                        <label className="block text-sm font-medium text-[#4B0503]/80 mb-1">Liên hệ (tùy chọn)</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#B40001] outline-none"
                            placeholder="Số điện thoại hoặc email"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-semibold transition"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditWasteStationModal;