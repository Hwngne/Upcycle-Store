// src/pages/GiftsPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaPlus, FaGift, FaBox, FaExclamationTriangle, FaChevronDown } from "react-icons/fa";
import { MdToggleOn, MdToggleOff } from "react-icons/md";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import StatsBoxes from "@/components/StatsBoxes";
import CreateGiftModal from "@/components/CreateGiftModal";
import Pagination from "@/components/Pagination";
import NumberInputWithButtons from "@/components/NumberInputWithButtons";
import EditGiftModal from "@/components/EditGiftModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { deleteGiftApi } from "@/services/reward.service.js";
import { toast } from "sonner";
import {
    getAllGiftsApi,
    createGiftApi,
    updateGiftApi,
} from "@/services/reward.service.js";

const GiftsPage = () => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deletingGift, setDeletingGift] = useState(null);

    const stockRef = useRef(null);
    const visibleRef = useRef(null);

    const itemsPerPage = 10;
    const [giftsData, setGiftsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingStockId, setEditingStockId] = useState(null);
    const stockDropdownRef = useRef(null);

    const [openEditModal, setOpenEditModal] = useState(false);
    const [editingGift, setEditingGift] = useState(null);

    const stockOptions = ["Còn hàng", "Sắp hết hàng", "Hết hàng"];
    const stockFilterOptions = ["Còn hàng", "Sắp hết hàng", "Hết hàng"];

    const [filterStock, setFilterStock] = useState(null);
    const [filterVisible, setFilterVisible] = useState(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);

    const [searchParams] = useSearchParams();
    // ===== FETCH GIFTS TỪ API THẬT =====
    const fetchGifts = async () => {
        try {
            setLoading(true);
            const res = await getAllGiftsApi();
            setGiftsData(res.data);
        } catch (err) {
            toast.error("Không thể tải danh sách quà tặng");
        } finally {
            setLoading(false);
        }
    };

    const handleEditGift = async (id, formData) => {
        try {
            const res = await updateGiftApi(id, formData);

            const updatedGift = res.data.data; // 🔥 QUAN TRỌNG

            setGiftsData(prev =>
                prev.map(g =>
                    g._id === id ? updatedGift : g
                )
            );

            toast.success("Cập nhật quà thành công!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Cập nhật thất bại");
            fetchGifts();
        }
    };

    const handleDeleteGift = async () => {
        if (!deletingGift) return;

        try {
            await deleteGiftApi(deletingGift._id);

            setGiftsData(prev =>
                prev.filter(g => g._id !== deletingGift._id)
            );

            toast.success("Xóa quà thành công!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Xóa quà thất bại");
        } finally {
            setOpenDeleteModal(false);
            setDeletingGift(null);
        }
    };


    useEffect(() => {
        fetchGifts();
    }, []);
    useEffect(() => {
    const filter = searchParams.get("filterStock");
    if (filter && stockFilterOptions.includes(filter)) {
        setFilterStock(filter);
        setCurrentPage(1);
    }
    }, [searchParams]);

    // Click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (openDropdown === "stock" && stockRef.current && !stockRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
            if (openDropdown === "visible" && visibleRef.current && !visibleRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }

            if (editingStockId && stockDropdownRef.current && !stockDropdownRef.current.contains(e.target)) {
                setEditingStockId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown, editingStockId]);

    // Reset page khi filter/search
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterStock, filterVisible]);

    // Filtered data
    const filteredGifts = giftsData
        .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
        .filter((g) => {
            const stockStatus = g.quantity === 0 ? "Hết hàng" : g.quantity <= 20 ? "Sắp hết hàng" : "Còn hàng";
            return filterStock ? stockStatus === filterStock : true;
        })
        .filter((g) => (filterVisible !== null ? g.visible === filterVisible : true));

    const totalPages = Math.ceil(filteredGifts.length / itemsPerPage);
    const currentData = filteredGifts.slice(
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

    const gradients = {
        stock: "linear-gradient(90deg, #D12B1E 0%, #E5CFB5 100%)",
        lowStock: "linear-gradient(90deg, #F7DFA8 0%, #D12B1E 100%)",
        outOfStock: "linear-gradient(90deg, #5B0704 0%, #D12B1E 100%)",
    };

    // ===== TẠO QUÀ MỚI =====
    const handleCreateGift = async (formData) => {
        try {
            const res = await createGiftApi(formData);
            setGiftsData(prev => [...prev, res.data.data]); // Thêm vào cuối danh sách
            toast.success("Tạo quà thành công!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Tạo quà thất bại");
        } finally {
            setOpenCreateModal(false);
        }
    };

    // ===== CẬP NHẬT SỐ LƯỢNG TRỰC TIẾP TRÊN TABLE =====
    const handleUpdateQuantity = async (id, newQuantity) => {
        const oldGift = giftsData.find(g => g._id === id);

        // Optimistic update
        setGiftsData(prev => prev.map(g =>
            g._id === id ? { ...g, quantity: newQuantity } : g
        ));

        try {
            const formData = new FormData();
            formData.append("quantity", newQuantity);
            await updateGiftApi(id, formData);
            toast.success("Cập nhật số lượng thành công!");
        } catch (err) {
            // Rollback
            setGiftsData(prev => prev.map(g =>
                g._id === id ? { ...g, quantity: oldGift.quantity } : g
            ));
            toast.error("Cập nhật số lượng thất bại");
        }
    };

    // ===== TOGGLE HIỂN THỊ =====
    const handleToggleVisible = async (id, currentVisible) => {
        setGiftsData(prev => prev.map(g =>
            g._id === id ? { ...g, visible: !currentVisible } : g
        ));

        try {
            const formData = new FormData();
            formData.append("visible", !currentVisible);
            await updateGiftApi(id, formData);
            toast.success(!currentVisible ? "Đã hiển thị quà cho người dùng" : "Đã ẩn quà khỏi người dùng");
        } catch (err) {
            setGiftsData(prev => prev.map(g =>
                g._id === id ? { ...g, visible: currentVisible } : g
            ));
            toast.error("Cập nhật hiển thị thất bại");
        }
    };

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0]">
            {/* HEADER */}
            <div className="relative z-50 mb-6">
                <PageHeader
                    icon={<FaGift />}
                    title="Quà tặng"
                    subtitle="Quản lý danh sách quà tặng và tồn kho"
                    right={<HeaderWithAvatar />}
                />
            </div>

            {/* STATISTICS */}
            <div className="mb-8 w-full">
                <StatsBoxes
                    items={[
                        { title: "Loại quà", value: giftsData.length, icon: <FaGift /> },
                        { title: "Tồn kho", value: giftsData.reduce((sum, g) => sum + g.quantity, 0), icon: <FaBox /> },
                        { title: "Sắp hết quà", value: giftsData.filter((g) => g.quantity <= 20 && g.quantity > 0).length, icon: <FaExclamationTriangle /> },
                    ]}
                />
            </div>

            {/* FILTER + CREATE */}
            <section className={`${glassGlow} p-6 w-full`}>
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                    {/* Stock Filter */}
                    <div className="relative" ref={stockRef}>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === "stock" ? null : "stock")}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm"
                        >
                            {filterStock || "Lọc theo Hàng tồn"} <FaChevronDown size={12} />
                        </button>
                        {openDropdown === "stock" && (
                            <div className="absolute mt-2 w-44 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50 overflow-hidden">
                                <ul className="text-[#4B0503]">
                                    <li
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                        onClick={() => { setFilterStock(null); setOpenDropdown(null); setCurrentPage(1); }}
                                    >
                                        Tất cả
                                    </li>
                                    {stockFilterOptions.map((option) => (
                                        <li
                                            key={option}
                                            className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                            onClick={() => { setFilterStock(option); setOpenDropdown(null); setCurrentPage(1); }}
                                        >
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Visibility Filter */}
                    <div className="relative" ref={visibleRef}>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === "visible" ? null : "visible")}
                            className="flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm"
                        >
                            {filterVisible === null ? "Lọc theo Hiển thị" : filterVisible ? "Hiện" : "Ẩn"} <FaChevronDown size={12} />
                        </button>
                        {openDropdown === "visible" && (
                            <div className="absolute mt-2 w-44 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50 overflow-hidden">
                                <ul className="text-[#4B0503]">
                                    <li
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                        onClick={() => { setFilterVisible(null); setOpenDropdown(null); setCurrentPage(1); }}
                                    >
                                        Tất cả
                                    </li>
                                    <li
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                        onClick={() => { setFilterVisible(true); setOpenDropdown(null); setCurrentPage(1); }}
                                    >
                                        Hiện
                                    </li>
                                    <li
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                        onClick={() => { setFilterVisible(false); setOpenDropdown(null); setCurrentPage(1); }}
                                    >
                                        Ẩn
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="Tìm quà tặng..."
                        className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-56"
                    />

                    {/* Create button */}
                    <button
                        onClick={() => setOpenCreateModal(true)}
                        className="ml-auto flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md text-white shadow-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D]"
                    >
                        <FaPlus /> Thêm quà
                    </button>
                </div>

                {/* TABLE */}
                <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-visible">
                    {loading ? (
                        <div className="text-center py-20 text-[#4B0503]/70 text-lg font-medium">
                            Đang tải danh sách quà tặng...
                        </div>
                    ) : currentData.length === 0 ? (
                        <div className="text-center py-20 text-[#4B0503]/70 text-lg">
                            Không có quà tặng nào phù hợp với bộ lọc
                        </div>
                    ) : (
                        <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-2">
                            <thead>
                                <tr className="text-[#4B0503]/80 text-center">
                                    <th className="py-2 px-3 w-[50px]">STT</th>
                                    <th className="py-2 px-3 w-[150px] text-center">Tên quà</th>
                                    <th className="py-2 px-3 w-[140px]">Nơi nhận</th>
                                    <th className="py-2 px-3 w-[120px]">Số lượng</th>
                                    <th className="py-2 px-3 w-[120px]">Hình ảnh</th>
                                    <th className="py-2 px-3 w-[100px]">Điểm</th>
                                    <th className="py-2 px-3 w-[170px]">Hàng tồn</th>
                                    <th className="py-2 px-3 w-[100px]">Hiển thị</th>
                                    <th className="py-2 px-3 w-[100px]">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((gift, index) => {
                                    const stockStatus = gift.quantity === 0 ? "Hết hàng" :
                                        gift.quantity <= 20 ? "Sắp hết hàng" : "Còn hàng";

                                    return (
                                        <tr
                                            key={gift._id}
                                            className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]"
                                        >
                                            <td className="py-2 px-3 text-center">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="py-2 px-3 font-semibold text-center break-words max-w-[220px]">
                                                {gift.name}
                                            </td>
                                            <td className="py-2 px-3 text-center">{gift.location}</td>

                                            {/* SỬA SỐ LƯỢNG TRỰC TIẾP */}
                                            <td className="py-2 px-3 text-center">
                                                <NumberInputWithButtons
                                                    //key={gift._id + "-" + gift.quantity}
                                                    value={gift.quantity}
                                                    min={0}
                                                    onChange={(newValue) => handleUpdateQuantity(gift._id, newValue)}
                                                />
                                            </td>

                                            <td className="py-2 px-3 text-center">
                                                <img
                                                    src={gift.imageUrl}
                                                    alt={gift.name}
                                                    className="w-12 h-12 object-cover rounded-md mx-auto"
                                                />
                                            </td>

                                            <td className="py-2 px-3 text-center">{gift.point}</td>

                                            {/* TRẠNG THÁI HÀNG TỒN - TỰ ĐỘNG THEO SỐ LƯỢNG */}
                                            <td className="py-2 px-3 text-center relative">
                                                <div
                                                    ref={editingStockId === gift._id ? stockDropdownRef : null}
                                                    className="inline-block"
                                                >
                                                    <span
                                                        onClick={() => setEditingStockId(editingStockId === gift._id ? null : gift._id)}
                                                        className="inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md cursor-pointer select-none"
                                                        style={{
                                                            background: stockStatus === "Còn hàng" ? gradients.stock :
                                                                stockStatus === "Sắp hết hàng" ? gradients.lowStock : gradients.outOfStock,
                                                        }}
                                                    >
                                                        {stockStatus} <FaChevronDown className="ml-2" size={12} />
                                                    </span>

                                                    {editingStockId === gift._id && (
                                                        <div className="absolute left-[50%] -translate-x-[50%] mt-2 w-40 bg-white rounded-xl shadow-lg z-50 overflow-hidden border border-gray-200">
                                                            {stockOptions.map((option) => (
                                                                <div
                                                                    key={option}
                                                                    className="px-4 py-2 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503]"
                                                                    onClick={() => {
                                                                        let newQuantity = gift.quantity;
                                                                        if (option === "Còn hàng") newQuantity = Math.max(gift.quantity, 21);
                                                                        else if (option === "Sắp hết hàng") newQuantity = Math.min(Math.max(gift.quantity, 1), 20);
                                                                        else newQuantity = 0;
                                                                        handleUpdateQuantity(gift._id, newQuantity);
                                                                        setEditingStockId(null);
                                                                    }}
                                                                >
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-2 px-3 text-center">
                                                <button
                                                    className="flex justify-center w-full"
                                                    title={gift.visible ? "Hiển thị" : "Ẩn quà"}
                                                    onClick={() => handleToggleVisible(gift._id, gift.visible)}
                                                >
                                                    {gift.visible ? (
                                                        <MdToggleOn className="text-green-500 cursor-pointer text-[50px] hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <MdToggleOff className="text-gray-400 cursor-pointer text-[50px] hover:scale-110 transition-transform" />
                                                    )}
                                                </button>
                                            </td>

                                            <td className="py-2 px-3 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <HiOutlinePencil
                                                        onClick={() => {
                                                            setEditingGift(gift);
                                                            setOpenEditModal(true);
                                                        }}
                                                        className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                    />
                                                    <HiOutlineTrash
                                                        className="text-red-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                        onClick={() => {
                                                            setDeletingGift(gift);
                                                            setOpenDeleteModal(true);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PAGINATION */}
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            </section>

            <CreateGiftModal
                isOpen={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onSubmit={handleCreateGift}
            />

            <EditGiftModal
                isOpen={openEditModal}
                onClose={() => {
                    setOpenEditModal(false);
                    setEditingGift(null);
                }}
                gift={editingGift}
                onUpdateSuccess={handleEditGift}
            />

            <DeleteConfirmModal
                isOpen={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false);
                    setDeletingGift(null);
                }}
                onConfirm={handleDeleteGift}
                itemName={deletingGift?.name}
                itemType="quà tặng"
                actionText="Xóa quà tặng"
            />
        </div>
    );
};

export default GiftsPage;