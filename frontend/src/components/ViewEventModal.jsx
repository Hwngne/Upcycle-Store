import React from "react";

const formatDate = (date) => {
    if (!date) return "Chưa xác định";
    const d = new Date(date);
    return isNaN(d)
        ? "Chưa xác định"
        : d.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
          });
};

const ViewEventModalTwoColumnsCompact = ({ isOpen, onClose, event }) => {
    if (!isOpen || !event) return null;

    const fieldLabelClass =
        "block text-sm mb-1 text-[#4B0503] font-medium flex items-center";
    const requiredMark = <span className="text-red-600 ml-1">*</span>;
    const inputClass =
        "w-full rounded-md border px-3 py-2 bg-gray-50 text-gray-800 outline-none shadow-sm";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/40" />

            <div
                className="relative z-10 rounded-xl bg-white p-6 shadow-lg"
                style={{ width: 720, maxHeight: "90vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#4B0503]">
                        Thông tin sự kiện
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="flex gap-6">
                    {/* Left Column */}
                    <div className="flex-1 overflow-hidden">
                        <div className="space-y-3 pr-2">
                            <div>
                                <label className={fieldLabelClass}>
                                    Tên sự kiện {requiredMark}
                                </label>
                                <input
                                    className={inputClass}
                                    value={event.name || ""}
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className={fieldLabelClass}>
                                    Chủ đề {requiredMark}
                                </label>
                                <input
                                    className={inputClass}
                                    value={event.topic || ""}
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className={fieldLabelClass}>
                                    Mô tả sự kiện {requiredMark}
                                </label>
                                <textarea
                                    className={`${inputClass} resize-none h-14`}
                                    value={event.description || ""}
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className={fieldLabelClass}>
                                    Tiền vé {requiredMark}
                                </label>
                                {!event.isPaid ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#F7DFA8]/45 text-[#6B3A0A] border border-[#F7DFA8]/70 shadow-sm whitespace-nowrap">
                                        Miễn phí
                                    </span>
                                ) : (
                                    <span className="text-sm font-medium text-[#4B0503]/80 whitespace-nowrap">
                                        {event.price}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className={fieldLabelClass}>
                                    Địa điểm {requiredMark}
                                </label>
                                <input
                                    className={inputClass}
                                    value={event.location || ""}
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className={fieldLabelClass}>
                                    Ngày tổ chức {requiredMark}
                                </label>
                                <input
                                    className={inputClass}
                                    value={formatDate(event.rawDate)}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px mx-4 bg-gray-300" />

                    {/* Right Column */}
                    <div className="flex-1 overflow-hidden">
                        <div className="space-y-4 pl-2">
                            <div>
                                <h4 className="text-[#4B0503] font-semibold mb-3">
                                    Thông tin liên lạc
                                </h4>

                                <div className="space-y-3">
                                    <div>
                                        <label className={fieldLabelClass}>
                                            Người phụ trách
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={event.contactName || ""}
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className={fieldLabelClass}>
                                            Email
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={event.contactEmail || ""}
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className={fieldLabelClass}>
                                            Số điện thoại
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={event.contactPhone || ""}
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className={fieldLabelClass}>
                                            Form đăng ký
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={event.formLink || ""}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[#4B0503] font-semibold mb-3">
                                    Thông tin bổ sung
                                </h4>

                                {event.imageUrl && (
                                    <img
                                        src={event.imageUrl}
                                        alt="Hình sự kiện"
                                        className="max-w-full rounded-md mb-3"
                                    />
                                )}

                                {event.attachmentUrl && (
                                    <a
                                        href={event.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block text-[#4B0503] underline hover:text-[#B40001]"
                                    >
                                        Xem file đính kèm
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border cursor-pointer text-gray-600 hover:bg-gray-100"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewEventModalTwoColumnsCompact;
