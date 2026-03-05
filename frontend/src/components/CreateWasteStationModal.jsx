// src/components/CreateWasteStationModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const CreateWasteStationModal = ({
    isOpen,
    onClose,
    onSubmit,
    typeOptions = [],
    areaOptions = []
}) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        area: "",
        address: "",
        contact: "",
    });
    const [typeOpen, setTypeOpen] = useState(false);
    const [areaOpen, setAreaOpen] = useState(false);

    const modalRef = useRef(null);  // ← Ref cho toàn bộ modal
    const typeRef = useRef(null);
    const areaRef = useRef(null);

    // Reset form khi mở/đóng
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: "", type: "", area: "", address: "", contact: "" });
            setTypeOpen(false);
            setAreaOpen(false);
        }
    }, [isOpen]);

    // Đóng dropdown khi click ra ngoài modal
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setTypeOpen(false);
                setAreaOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) return toast.error("Vui lòng nhập tên trạm");
        if (!formData.type) return toast.error("Vui lòng chọn loại rác");
        if (!formData.area) return toast.error("Vui lòng chọn khu vực");
        if (!formData.address.trim()) return toast.error("Vui lòng nhập địa chỉ");

        onSubmit(formData);
        onClose();
    };

    // Đóng dropdown khi focus input khác
    const handleInputFocus = () => {
        setTypeOpen(false);
        setAreaOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div
                ref={modalRef} // ← Gắn ref vào modal
                className="relative z-10 w-[420px] max-h-[90vh] rounded-xl bg-white p-6 shadow-lg overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#4B0503]">Thêm Trạm thu gom rác</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Tên trạm */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">Tên Trạm thu gom rác</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                            placeholder="Nhập tên trạm"
                        />
                    </div>

                    {/* Loại rác */}
                    <div className="relative" ref={typeRef}>
                        <label className="block text-sm mb-1 text-[#4B0503]">Loại rác tiếp nhận</label>
                        <div
                            className="w-full rounded-md border px-3 py-2 cursor-pointer flex justify-between items-center bg-white"
                            onClick={() => {
                                setTypeOpen(!typeOpen);
                                setAreaOpen(false);
                            }}
                        >
                            <span className={formData.type ? "" : "text-gray-500"}>
                                {formData.type || "Chọn loại rác trạm tiếp nhận xử lý"}
                            </span>
                            <svg
                                className={`w-4 h-4 ml-2 transition-transform duration-200 ${typeOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        {typeOpen && (
                            <div className="absolute mt-1 w-full bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50 max-h-60 overflow-y-auto">
                                <ul className="text-[#4B0503]">
                                    {typeOptions.map((type) => (
                                        <li
                                            key={type}
                                            className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                                            onClick={() => {
                                                setFormData((prev) => ({ ...prev, type }));
                                                setTypeOpen(false);
                                            }}
                                        >
                                            {type}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Khu vực */}
                    <div className="relative" ref={areaRef}>
                        <label className="block text-sm mb-1 text-[#4B0503]">Khu vực</label>
                        <div
                            className="w-full rounded-md border px-3 py-2 cursor-pointer flex justify-between items-center bg-white"
                            onClick={() => {
                                setAreaOpen(!areaOpen);
                                setTypeOpen(false);
                            }}
                        >
                            <span className={formData.area ? "" : "text-gray-500"}>
                                {formData.area || "Chọn khu vực của trạm thu gom rác"}
                            </span>
                            <svg
                                className={`w-4 h-4 ml-2 transition-transform duration-200 ${areaOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        {areaOpen && (
                            <div className="absolute mt-1 w-full bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50 max-h-60 overflow-y-auto">
                                <ul className="text-[#4B0503]">
                                    {areaOptions.map((area) => (
                                        <li
                                            key={area}
                                            className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                                            onClick={() => {
                                                setFormData((prev) => ({ ...prev, area }));
                                                setAreaOpen(false);
                                            }}
                                        >
                                            {area}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Địa chỉ */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">Địa chỉ</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                            placeholder="Nhập địa chỉ chi tiết"
                        />
                    </div>

                    {/* Liên hệ */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">Liên hệ (tùy chọn)</label>
                        <input
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                            placeholder="Số điện thoại hoặc email"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border cursor-pointer text-gray-600 hover:bg-gray-100"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md text-white cursor-pointer font-medium shadow-lg hover:shadow-xl transition"
                        style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateWasteStationModal;