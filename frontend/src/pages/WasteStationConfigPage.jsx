// src/pages/WasteConfigPage.jsx
import React, { useState, useEffect } from "react";
import { FaPlus, FaTags, FaMapMarkerAlt } from "react-icons/fa";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import Pagination from "@/components/Pagination";
import StatsBoxes from "@/components/StatsBoxes";

import CreateAreaModal from "@/components/CreateAreaModal";
import CreateWasteModal from "@/components/CreateWasteModal";
import EditWasteConfigModal from "@/components/EditWasteConfigModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal"; // ← THÊM IMPORT NÀY

import { toast } from "sonner";

import {
    getAllConfigsApi,
    createConfigApi,
    updateConfigApi,
    deleteConfigApi
} from "@/services/wasteConfig.service";

const WasteConfigPage = () => {
    const [activeTab, setActiveTab] = useState("type");

    const [typeData, setTypeData] = useState([]);
    const [areaData, setAreaData] = useState([]);

    const [searchType, setSearchType] = useState("");
    const [searchArea, setSearchArea] = useState("");

    const [currentPageType, setCurrentPageType] = useState(1);
    const [currentPageArea, setCurrentPageArea] = useState(1);

    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // THÊM STATE CHO DELETE MODAL
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);

    const [loading, setLoading] = useState(true);

    const itemsPerPage = 10;

    // Fetch dữ liệu từ backend
    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const res = await getAllConfigsApi();
            setTypeData(res.data.waste_types || []);
            setAreaData(res.data.areas || []);
        } catch (err) {
            toast.error("Không thể tải cấu hình hệ thống");
            setTypeData([]);
            setAreaData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    /* ================= FILTER + PAGINATION ================= */
    const filteredTypes = typeData.filter((item) =>
        item.name.toLowerCase().includes(searchType.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchType.toLowerCase()))
    );
    const totalPagesType = Math.ceil(filteredTypes.length / itemsPerPage);
    const currentTypes = filteredTypes.slice(
        (currentPageType - 1) * itemsPerPage,
        currentPageType * itemsPerPage
    );

    const filteredAreas = areaData.filter((item) =>
        item.name.toLowerCase().includes(searchArea.toLowerCase())
    );
    const totalPagesArea = Math.ceil(filteredAreas.length / itemsPerPage);
    const currentAreas = filteredAreas.slice(
        (currentPageArea - 1) * itemsPerPage,
        currentPageArea * itemsPerPage
    );

    const glassGlow = `
    backdrop-blur-md
    bg-white/30
    rounded-2xl
    border border-white/30
    shadow-[0_0_20px_rgba(247,223,168,0.35)]
  `;

    /* ================= HANDLERS ================= */
    const handleAddType = async ({ name, description = "" }) => {
        if (!name.trim()) {
            toast.error("Vui lòng nhập tên loại rác!");
            return;
        }

        try {
            await createConfigApi({
                category: "waste_type",
                name: name.trim(),
                description: description.trim(),
            });
            toast.success("Thêm loại rác thành công!");
            fetchConfigs();
            setIsTypeModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Thêm loại rác thất bại");
        }
    };

    const handleAddArea = async ({ name }) => {
        if (!name.trim()) {
            toast.error("Vui lòng nhập tên khu vực!");
            return;
        }

        try {
            await createConfigApi({
                category: "area",
                name: name.trim(),
            });
            toast.success("Thêm khu vực thành công!");
            fetchConfigs();
            setIsAreaModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Thêm khu vực thất bại");
        }
    };

    // MỞ MODAL XÁC NHẬN XÓA
    const openDeleteModal = (item) => {
        setDeletingItem(item);
        setIsDeleteModalOpen(true);
    };

    // XỬ LÝ XÓA SAU KHI XÁC NHẬN
    const handleDeleteConfirm = async () => {
        if (!deletingItem) return;

        try {
            await deleteConfigApi(deletingItem._id);
            toast.success(`Xóa ${deletingItem.category === "waste_type" ? "loại rác" : "khu vực"} thành công!`);
            fetchConfigs();
        } catch (err) {
            toast.error("Xóa thất bại");
        } finally {
            setIsDeleteModalOpen(false);
            setDeletingItem(null);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (data) => {
        try {
            await updateConfigApi(editingItem._id, data);
            toast.success("Cập nhật thành công!");
            fetchConfigs();
        } catch (err) {
            toast.error(err.response?.data?.message || "Cập nhật thất bại");
        }
    };

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 overflow-x-hidden">
            {/* HEADER */}
            <div className="relative z-50 mb-6">
                <PageHeader
                    icon={<FaPlus />}
                    title="Cấu hình Loại rác & Khu vực"
                    subtitle="Quản lý danh sách loại rác và khu vực thu gom"
                    right={<HeaderWithAvatar />}
                />
            </div>

            {/* STATISTICS */}
            <div className="mb-8">
                <StatsBoxes
                    items={[
                        { title: "Tổng loại rác", value: typeData.length, icon: <FaTags /> },
                        { title: "Tổng khu vực", value: areaData.length, icon: <FaMapMarkerAlt /> },
                    ]}
                />
            </div>

            {/* TAB SWITCH */}
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setActiveTab("type")}
                    className={`px-6 py-2 rounded-t-lg font-semibold relative transition-all cursor-pointer ${activeTab === "type"
                        ? "bg-white/80 text-[#4B0503]"
                        : "bg-white/30 text-[#4B0503]/70 hover:bg-white/50"
                        }`}
                >
                    Loại rác
                    {activeTab === "type" && (
                        <span
                            className="absolute bottom-0 left-0 w-full h-1 rounded-b-lg"
                            style={{ background: "linear-gradient(to right, #5B0704, #A71D0D, #D12B1E)" }}
                        />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("area")}
                    className={`px-6 py-2 rounded-t-lg font-semibold relative transition-all cursor-pointer ${activeTab === "area"
                        ? "bg-white/80 text-[#4B0503]"
                        : "bg-white/30 text-[#4B0503]/70 hover:bg-white/50"
                        }`}
                >
                    Khu vực
                    {activeTab === "area" && (
                        <span
                            className="absolute bottom-0 left-0 w-full h-1 rounded-b-lg"
                            style={{ background: "linear-gradient(to right, #D12B1E, #B40001, #E5CFB5)" }}
                        />
                    )}
                </button>
            </div>

            {/* TAB CONTENT */}
            <section className={`${glassGlow} p-6`}>
                {/* TAB LOẠI RÁC */}
                {activeTab === "type" && (
                    <>
                        <div className="flex gap-4 mb-6 items-center">
                            <input
                                value={searchType}
                                onChange={(e) => {
                                    setSearchType(e.target.value);
                                    setCurrentPageType(1);
                                }}
                                placeholder="Tìm loại rác hoặc mô tả..."
                                className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-64"
                            />
                            <button
                                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md text-white shadow-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D]"
                                onClick={() => setIsTypeModalOpen(true)}
                            >
                                <FaPlus /> Thêm Loại rác
                            </button>
                        </div>

                        <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-x-auto">
                            {loading ? (
                                <div className="text-center py-20 text-[#4B0503]/70">Đang tải...</div>
                            ) : currentTypes.length === 0 ? (
                                <div className="text-center py-20 text-[#4B0503]/70">Không có loại rác nào</div>
                            ) : (
                                <table className="w-full text-sm border-separate border-spacing-y-3">
                                    <thead>
                                        <tr className="text-[#4B0503]/80 text-center">
                                            <th className="w-[60px] py-2">STT</th>
                                            <th className="py-2 text-center">Tên loại rác</th>
                                            <th className="py-2">Mô tả</th>
                                            <th className="w-[120px] py-2">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentTypes.map((item, index) => (
                                            <tr
                                                key={item._id}
                                                className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]"
                                            >
                                                <td className="py-3 px-4 text-center">
                                                    {(currentPageType - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-center">{item.name}</td>
                                                <td className="py-3 px-4 text-gray-700 text-center text-sm max-w-md">
                                                    {item.description || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-center align-middle">
                                                    <div className="flex justify-center items-center gap-4 h-full">
                                                        <HiOutlinePencil
                                                            onClick={() => handleEdit(item)}
                                                            className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                        />
                                                        <HiOutlineTrash
                                                            onClick={() => openDeleteModal(item)}
                                                            className="text-red-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <Pagination
                            currentPage={currentPageType}
                            totalPages={totalPagesType}
                            setCurrentPage={setCurrentPageType}
                        />
                    </>
                )}

                {/* TAB KHU VỰC */}
                {activeTab === "area" && (
                    <>
                        <div className="flex gap-4 mb-6 items-center">
                            <input
                                value={searchArea}
                                onChange={(e) => {
                                    setSearchArea(e.target.value);
                                    setCurrentPageArea(1);
                                }}
                                placeholder="Tìm khu vực..."
                                className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-64"
                            />
                            <button
                                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md text-white shadow-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D]"
                                onClick={() => setIsAreaModalOpen(true)}
                            >
                                <FaPlus /> Thêm Khu vực
                            </button>
                        </div>

                        <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-x-auto">
                            {loading ? (
                                <div className="text-center py-20 text-[#4B0503]/70">Đang tải...</div>
                            ) : currentAreas.length === 0 ? (
                                <div className="text-center py-20 text-[#4B0503]/70">Không có khu vực nào</div>
                            ) : (
                                <table className="w-full text-sm border-separate border-spacing-y-3">
                                    <thead>
                                        <tr className="text-[#4B0503]/80 text-center">
                                            <th className="w-[60px] py-2">STT</th>
                                            <th className="py-2">Tên khu vực</th>
                                            <th className="w-[120px] py-2">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentAreas.map((item, index) => (
                                            <tr
                                                key={item._id}
                                                className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]"
                                            >
                                                <td className="py-3 px-4 text-center">
                                                    {(currentPageArea - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="py-3 px-4 text-center font-medium">{item.name}</td>
                                                <td className="py-3 px-4 text-center align-middle">
                                                    <div className="flex justify-center items-center gap-4 h-full">
                                                        <HiOutlinePencil
                                                            onClick={() => handleEdit(item)}
                                                            className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                        />
                                                        <HiOutlineTrash
                                                            onClick={() => openDeleteModal(item)}
                                                            className="text-red-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <Pagination
                            currentPage={currentPageArea}
                            totalPages={totalPagesArea}
                            setCurrentPage={setCurrentPageArea}
                        />
                    </>
                )}
            </section>

            {/* MODALS */}
            <CreateWasteModal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                onSubmit={handleAddType}
            />

            <CreateAreaModal
                isOpen={isAreaModalOpen}
                onClose={() => setIsAreaModalOpen(false)}
                onSubmit={handleAddArea}
            />

            <EditWasteConfigModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                }}
                item={editingItem}
                onSuccess={handleUpdate}
            />

            {/* THÊM MODAL XÁC NHẬN XÓA */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingItem(null);
                }}
                onConfirm={handleDeleteConfirm}
                itemName={deletingItem?.name}
                itemType={deletingItem?.category === "waste_type" ? "loại rác" : "khu vực"}
                actionText="Xóa"
            />
        </div>
    );
};

export default WasteConfigPage; 