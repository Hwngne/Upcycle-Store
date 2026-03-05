// src/pages/WasteStationPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaRecycle, FaTags, FaMapMarkedAlt, FaChevronDown } from "react-icons/fa";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import StatsBoxes from "@/components/StatsBoxes";
import Pagination from "@/components/Pagination";
import CreateWasteStationModal from "@/components/CreateWasteStationModal";
import { getAllConfigsApi } from "@/services/wasteConfig.service";

import EditWasteStationModal from "@/components/EditWasteStationModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toast } from "sonner";

import {
    getAllWasteStationsApi,
    createWasteStationApi,
    updateWasteStationApi,
    deleteWasteStationApi,
} from "@/services/wasteStation.service";

const WasteStationPage = () => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [openDropdown, setOpenDropdown] = useState(null);
    const typeRef = useRef(null);
    const areaRef = useRef(null);

    const itemsPerPage = 10;
    const [wasteData, setWasteData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingTypeId, setEditingTypeId] = useState(null);
    const typeDropdownRef = useRef(null);

    const [filterType, setFilterType] = useState(null);
    const [filterArea, setFilterArea] = useState(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingStation, setDeletingStation] = useState(null);

    const [typeOptions, setTypeOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);

    // Fetch dữ liệu trạm thu gom
    const fetchWasteStations = async () => {
        try {
            const res = await getAllWasteStationsApi();
            setWasteData(res.data || []);
        } catch (err) {
            toast.error("Không thể tải danh sách trạm thu gom");
            setWasteData([]);
        }
    };

    // Fetch loại rác và khu vực từ cấu hình
    const fetchConfigs = async () => {
        try {
            const res = await getAllConfigsApi();
            setTypeOptions(res.data.waste_types.map(t => t.name));
            setAreaOptions(res.data.areas.map(a => a.name));
        } catch (err) {
            toast.error("Không thể tải danh sách loại rác/khu vực");
            setTypeOptions([]);
            setAreaOptions([]);
        }
    };

    // Load tất cả dữ liệu khi mount
    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchWasteStations(), fetchConfigs()]);
            setLoading(false);
        };
        loadAll();
    }, []);

    // Click outside đóng dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                (typeRef.current && !typeRef.current.contains(e.target)) &&
                (areaRef.current && !areaRef.current.contains(e.target)) &&
                (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target))
            ) {
                setOpenDropdown(null);
                setEditingTypeId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset page khi filter/search
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterType, filterArea]);

    // Filtered data
    const filteredData = wasteData
        .filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
        .filter((w) => (filterType ? w.type === filterType : true))
        .filter((w) => (filterArea ? w.area === filterArea : true));

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const glassGlow = `
    backdrop-blur-md
    bg-white/30
    rounded-2xl
    border border-white/30
    shadow-[0_0_20px_rgba(247,223,168,0.35)]
  `;

    // Handler tạo mới
    const handleCreate = async (data) => {
        try {
            await createWasteStationApi(data);
            toast.success("Thêm trạm thu gom thành công!");
            fetchWasteStations();
        } catch (err) {
            toast.error("Thêm trạm thất bại");
        }
    };

    // Handler sửa (inline loại rác)
    const handleUpdateType = async (id, newType) => {
        try {
            await updateWasteStationApi(id, { type: newType });
            setWasteData(prev =>
                prev.map(w => w._id === id ? { ...w, type: newType } : w)
            );
            toast.success("Cập nhật loại rác thành công");
        } catch (err) {
            toast.error("Cập nhật thất bại");
            fetchWasteStations();
        }
    };

    // Handler mở modal sửa
    const handleEdit = (station) => {
        setEditingStation(station);
        setIsEditModalOpen(true);
    };

    // Handler xóa
    const handleDelete = async () => {
        if (!deletingStation) return;
        try {
            await deleteWasteStationApi(deletingStation._id);
            toast.success("Xóa trạm thành công!");
            fetchWasteStations();
        } catch (err) {
            toast.error("Xóa thất bại");
        } finally {
            setIsDeleteModalOpen(false);
            setDeletingStation(null);
        }

    };
    

    const handleUpdate = async (data) => {
        await updateWasteStationApi(editingStation._id, data);
        fetchWasteStations();
    };

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0]">
            {/* HEADER */}
            <div className="relative z-50 mb-6">
                <PageHeader
                    icon={<FaRecycle />}
                    title="Danh sách Trạm thu gom rác"
                    subtitle="Quản lý trạm thu gom rác, địa chỉ và liên hệ"
                    right={<HeaderWithAvatar />}
                />
            </div>

            {/* STATISTICS */}
            <div className="mb-8 w-full">
                <StatsBoxes
                    items={[
                        { title: "Tổng trạm", value: wasteData.length, icon: <FaRecycle /> },
                        { title: "Các loại rác", value: typeOptions.length, icon: <FaTags /> },
                        { title: "Các khu vực", value: areaOptions.length, icon: <FaMapMarkedAlt /> },
                    ]}
                />
            </div>

            {/* FILTER + TABLE */}
            <section className={`${glassGlow} p-6 w-full`}>
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                    {/* Filter Type */}
                    <div className="relative" ref={typeRef}>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm"
                        >
                            {filterType || "Lọc theo loại rác"} <FaChevronDown size={12} />
                        </button>
                        {openDropdown === "type" && (
                            <div className="absolute mt-2 w-48 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50">
                                <ul className="text-[#4B0503]">
                                    <li className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer" onClick={() => { setFilterType(null); setOpenDropdown(null); }}>
                                        Tất cả
                                    </li>
                                    {typeOptions.map((type) => (
                                        <li key={type} className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer" onClick={() => { setFilterType(type); setOpenDropdown(null); }}>
                                            {type}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Filter Area */}
                    <div className="relative" ref={areaRef}>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === "area" ? null : "area")}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm"
                        >
                            {filterArea || "Lọc theo khu vực"} <FaChevronDown size={12} />
                        </button>
                        {openDropdown === "area" && (
                            <div className="absolute mt-2 w-48 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50">
                                <ul className="text-[#4B0503]">
                                    <li className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer" onClick={() => { setFilterArea(null); setOpenDropdown(null); }}>
                                        Tất cả
                                    </li>
                                    {areaOptions.map((area) => (
                                        <li key={area} className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer" onClick={() => { setFilterArea(area); setOpenDropdown(null); }}>
                                            {area}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm trạm..."
                        className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-52"
                    />

                    {/* Add Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="ml-auto flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium shadow-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D]"
                    >
                        <FaPlus /> Thêm Trạm
                    </button>
                </div>

                {/* TABLE */}
                <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-visible">

                    {loading ? (
                        <div className="text-center py-20 text-[#4B0503]/70">Đang tải...</div>
                    ) : currentData.length === 0 ? (
                        <div className="text-center py-20 text-[#4B0503]/70">Không có trạm nào</div>
                    ) : (
                        <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-3">
                            <thead>
                                <tr className="text-[#4B0503]/80 text-center">
                                    <th className="py-3 px-2">STT</th>
                                    <th className="py-3 px-2">Tên trạm</th>
                                    <th className="py-3 px-2">Loại rác</th>
                                    <th className="py-3 px-2">Khu vực</th>
                                    <th className="py-3 px-2">Địa chỉ</th>
                                    <th className="py-3 px-2">Liên hệ</th>
                                    <th className="py-3 px-2">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((station, index) => (
                                    <tr key={station._id} className="bg-white/20 hover:bg-white/30 transition-all duration-200 text-[#4B0503]">
                                        <td className="py-3 px-2 text-center">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="py-3 px-2 text-center font-medium">{station.name}</td>

                                        {/* Inline edit loại rác */}
                                        <td className="py-3 px-2 text-center relative">
                                            <div ref={editingTypeId === station._id ? typeDropdownRef : null} className="inline-block">
                                                <span
                                                    onClick={() => setEditingTypeId(editingTypeId === station._id ? null : station._id)}
                                                    className="inline-flex items-center justify-center px-4 py-1.5 text-[13px] font-semibold text-white rounded-md cursor-pointer select-none"
                                                    style={{ background: "linear-gradient(90deg, #D12B1E 0%, #E5CFB5 100%)" }}
                                                >
                                                    {station.type} <FaChevronDown className="ml-2" size={12} />
                                                </span>

                                                {editingTypeId === station._id && (
                                                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
                                                        {typeOptions.map((option) => (
                                                            <div
                                                                key={option}
                                                                className="px-4 py-2.5 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503] text-sm"
                                                                onClick={() => {
                                                                    handleUpdateType(station._id, option);
                                                                    setEditingTypeId(null);
                                                                }}
                                                            >
                                                                {option}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="py-3 px-2 text-center">{station.area}</td>
                                        <td className="py-3 px-2 text-center break-words">{station.address}</td>
                                        <td className="py-3 px-2 text-center">{station.contact || "-"}</td>
                                        <td className="py-3 px-2 text-center">
                                            <div className="flex justify-center gap-3">
                                                <HiOutlinePencil
                                                    onClick={() => handleEdit(station)}
                                                    className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                />
                                                <HiOutlineTrash
                                                    onClick={() => {
                                                        setDeletingStation(station);
                                                        setIsDeleteModalOpen(true);
                                                    }}
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

                <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            </section>

            {/* MODALS */}
            <CreateWasteStationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                typeOptions={typeOptions}
                areaOptions={areaOptions}
            />

            <EditWasteStationModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingStation(null);
                }}
                station={editingStation}
                onSuccess={handleUpdate}
                typeOptions={typeOptions}
                areaOptions={areaOptions}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName={deletingStation?.name}
                itemType="trạm thu gom"
            />
        </div>
    );
};

export default WasteStationPage;