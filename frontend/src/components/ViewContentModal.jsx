import React from "react";

const ViewContentModal = ({ isOpen, onClose, data, type }) => {
    if (!isOpen || !data) return null;

    const fieldLabel = "text-sm text-[#4B0503] font-medium mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />

            <div
                className="relative bg-white rounded-xl p-6 shadow-lg w-[720px]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#4B0503]">
                        {type === "knowledge"
                            ? "Chi tiết bài viết"
                            : "Chi tiết sản phẩm"}
                    </h3>
                    <button onClick={onClose} className="text-xl">×</button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {type === "knowledge" ? (
                        <>
                            <div>
                                <label className={fieldLabel}>Chủ đề</label>
                                <input className="w-full bg-gray-100 px-3 py-2 rounded-md" value={data.topic} readOnly />
                            </div>
                            <div>
                                <label className={fieldLabel}>Tiêu đề</label>
                                <input className="w-full bg-gray-100 px-3 py-2 rounded-md" value={data.title} readOnly />
                            </div>
                            <div className="col-span-2">
                                <label className={fieldLabel}>Nội dung</label>
                                <textarea className="w-full bg-gray-100 px-3 py-2 rounded-md h-24" value={data.content} readOnly />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className={fieldLabel}>Loại sản phẩm</label>
                                <input className="w-full bg-gray-100 px-3 py-2 rounded-md" value={data.category} readOnly />
                            </div>
                            <div>
                                <label className={fieldLabel}>Tên sản phẩm</label>
                                <input className="w-full bg-gray-100 px-3 py-2 rounded-md" value={data.name} readOnly />
                            </div>
                            <div className="col-span-2">
                                <label className={fieldLabel}>Mô tả</label>
                                <textarea className="w-full bg-gray-100 px-3 py-2 rounded-md h-24" value={data.description} readOnly />
                            </div>
                        </>
                    )}

                    <div className="col-span-2">
                        <label className={fieldLabel}>Đính kèm</label>
                        {data.attachments.length ? (
                            <p>📎 Có file / ảnh đính kèm</p>
                        ) : (
                            <p className="italic text-gray-500">Không có</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border hover:bg-gray-100"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewContentModal;
