// src/pages/ContentTopicConfigPage.jsx
import React, { useState, useEffect } from "react";
import { FaPlus, FaTags, FaClipboardList } from "react-icons/fa";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import Pagination from "@/components/Pagination";
import StatsBoxes from "@/components/StatsBoxes";
import CreateTopicModal from "@/components/CreateTopicModal";
import CreateProductTypeModal from "@/components/CreateProductTypeModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal"; // Thêm import
import { toast } from "sonner";
import { getAllContentConfigsApi, updateContentConfigApi, deleteContentConfigApi } from "@/services/contentConfig.service";

const ContentTopicConfigPage = () => {
    const [activeTab, setActiveTab] = useState("topic");

    const [topicData, setTopicData] = useState([]);
    const [productTypeData, setProductTypeData] = useState([]);

    const [searchTopic, setSearchTopic] = useState("");
    const [searchProductType, setSearchProductType] = useState("");

    const [currentPageTopic, setCurrentPageTopic] = useState(1);
    const [currentPageProductType, setCurrentPageProductType] = useState(1);

    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [isProductTypeModalOpen, setIsProductTypeModalOpen] = useState(false);

    // Modal chỉnh sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Modal xác nhận xóa
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null); // { _id, name, category }

    const [loading, setLoading] = useState(true);

    const itemsPerPage = 10;

    // Fetch dữ liệu
    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const res = await getAllContentConfigsApi();
            setTopicData(res.data.topics || []);
            setProductTypeData(res.data.product_types || []);
        } catch (err) {
            toast.error("Không thể tải cấu hình nội dung");
            setTopicData([]);
            setProductTypeData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    /* ================= FILTER + PAGINATION ================= */
    const filteredTopics = topicData.filter((item) =>
        item.name.toLowerCase().includes(searchTopic.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTopic.toLowerCase()))
    );

    const totalPagesTopic = Math.ceil(filteredTopics.length / itemsPerPage);
    const currentTopics = filteredTopics.slice(
        (currentPageTopic - 1) * itemsPerPage,
        currentPageTopic * itemsPerPage
    );

    const filteredProductTypes = productTypeData.filter((item) =>
        item.name.toLowerCase().includes(searchProductType.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchProductType.toLowerCase()))
    );

    const totalPagesProductType = Math.ceil(filteredProductTypes.length / itemsPerPage);
    const currentProductTypes = filteredProductTypes.slice(
        (currentPageProductType - 1) * itemsPerPage,
        currentPageProductType * itemsPerPage
    );

    // Hàm mở modal xóa
    const openDeleteModal = (item) => {
        setDeletingItem({
            _id: item._id,
            name: item.name,
            category: item.category,
        });
        setIsDeleteModalOpen(true);
    };

    // Hàm thực hiện xóa (gọi khi người dùng nhấn "Xóa" trong modal)
    const handleDeleteConfirm = async () => {
        if (!deletingItem) return;

        try {
            await deleteContentConfigApi(deletingItem._id);
            toast.success("Xóa thành công");
            fetchConfigs();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xóa thất bại");
        } finally {
            setIsDeleteModalOpen(false);
            setDeletingItem(null);
        }
    };

    // Hàm mở modal chỉnh sửa
    const handleEdit = (item) => {
        setEditingItem({
            _id: item._id,
            category: item.category,
            name: item.name,
            description: item.description || "",
        });
        setIsEditModalOpen(true);
    };

    // Hàm submit chỉnh sửa
    const handleUpdate = async (values) => {
        try {
            await updateContentConfigApi(editingItem._id, values);
            toast.success("Cập nhật thành công");
            setIsEditModalOpen(false);
            fetchConfigs();
        } catch (err) {
            toast.error(err.response?.data?.message || "Cập nhật thất bại");
        }
    };

    const glassGlow = `
        backdrop-blur-md
        bg-white/30
        rounded-2xl
        border border-white/30
        shadow-[0_0_20px_rgba(247,223,168,0.35)]
    `;

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 overflow-x-hidden">
            {/* HEADER */}
            <div className="relative z-50 mb-6">
                <PageHeader
                    icon={<FaPlus />}
                    title="Cấu hình Nội dung"
                    subtitle="Quản lý Chủ đề bài viết và Loại sản phẩm"
                    right={<HeaderWithAvatar />}
                />
            </div>

            {/* STATISTICS */}
            <div className="mb-8">
                <StatsBoxes
                    items={[
                        { title: "Tổng chủ đề bài viết", value: topicData.length, icon: <FaTags /> },
                        { title: "Tổng loại sản phẩm", value: productTypeData.length, icon: <FaClipboardList /> },
                    ]}
                />
            </div>

            {/* TAB SWITCH */}
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setActiveTab("topic")}
                    className={`px-6 py-2 rounded-t-lg font-semibold relative transition-all cursor-pointer ${activeTab === "topic"
                            ? "bg-white/80 text-[#4B0503]"
                            : "bg-white/30 text-[#4B0503]/70 hover:bg-white/50"
                        }`}
                >
                    Chủ đề bài viết
                    {activeTab === "topic" && (
                        <span
                            className="absolute bottom-0 left-0 w-full h-1 rounded-b-lg"
                            style={{ background: "linear-gradient(to right, #5B0704, #A71D0D, #D12B1E)" }}
                        />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("product")}
                    className={`px-6 py-2 rounded-t-lg font-semibold relative transition-all cursor-pointer ${activeTab === "product"
                            ? "bg-white/80 text-[#4B0503]"
                            : "bg-white/30 text-[#4B0503]/70 hover:bg-white/50"
                        }`}
                >
                    Loại sản phẩm
                    {activeTab === "product" && (
                        <span
                            className="absolute bottom-0 left-0 w-full h-1 rounded-b-lg"
                            style={{ background: "linear-gradient(to right, #D12B1E, #B40001, #E5CFB5)" }}
                        />
                    )}
                </button>
            </div>

            {/* TAB CONTENT */}
            <section className={`${glassGlow} p-6`}>
                {/* TAB CHỦ ĐỀ BÀI VIẾT */}
                {activeTab === "topic" && (
                    <>
                        <div className="flex gap-4 mb-6 items-center">
                            <input
                                value={searchTopic}
                                onChange={(e) => {
                                    setSearchTopic(e.target.value);
                                    setCurrentPageTopic(1);
                                }}
                                placeholder="Tìm chủ đề hoặc mô tả..."
                                className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-64"
                            />
                            <button
                                onClick={() => setIsTopicModalOpen(true)}
                                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md text-white shadow-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D]"
                            >
                                <FaPlus /> Thêm Chủ đề
                            </button>
                        </div>

                        <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-x-auto">
                            {loading ? (
                                <div className="text-center py-20 text-[#4B0503]/70">Đang tải...</div>
                            ) : currentTopics.length === 0 ? (
                                <div className="text-center py-20 text-[#4B0503]/70">Không có chủ đề nào</div>
                            ) : (
                                <table className="w-full text-sm border-separate border-spacing-y-3">
                                    <thead>
                                        <tr className="text-[#4B0503]/80 text-center">
                                            <th className="w-[60px] py-2">STT</th>
                                            <th className="py-2 text-center">Tên chủ đề</th>
                                            <th className="py-2">Mô tả</th>
                                            <th className="w-[120px] py-2">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentTopics.map((item, index) => (
                                            <tr
                                                key={item._id}
                                                className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]"
                                            >
                                                <td className="py-3 px-4 text-center">
                                                    {(currentPageTopic - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-center">{item.name}</td>
                                                <td className="py-3 px-4 text-gray-700 text-center text-sm max-w-md">
                                                    {item.description || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-center align-middle">
                                                    <div className="flex justify-center items-center gap-4 h-full">
                                                        <HiOutlinePencil
                                                            onClick={() => handleEdit({ ...item, category: "topic" })}
                                                            className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                        />
                                                        <HiOutlineTrash
                                                            onClick={() => openDeleteModal({ ...item, category: "topic" })}
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
                            currentPage={currentPageTopic}
                            totalPages={totalPagesTopic}
                            setCurrentPage={setCurrentPageTopic}
                        />
                    </>
                )}

                {/* TAB LOẠI SẢN PHẨM */}
                {activeTab === "product" && (
                    <>
                        <div className="flex gap-4 mb-6 items-center">
                            <input
                                value={searchProductType}
                                onChange={(e) => {
                                    setSearchProductType(e.target.value);
                                    setCurrentPageProductType(1);
                                }}
                                placeholder="Tìm loại sản phẩm hoặc mô tả..."
                                className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-64"
                            />
                            <button
                                onClick={() => setIsProductTypeModalOpen(true)}
                                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md text-white shadow-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D]"
                            >
                                <FaPlus /> Thêm Loại sản phẩm
                            </button>
                        </div>

                        <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-x-auto">
                            {loading ? (
                                <div className="text-center py-20 text-[#4B0503]/70">Đang tải...</div>
                            ) : currentProductTypes.length === 0 ? (
                                <div className="text-center py-20 text-[#4B0503]/70">Không có loại sản phẩm nào</div>
                            ) : (
                                <table className="w-full text-sm border-separate border-spacing-y-3">
                                    <thead>
                                        <tr className="text-[#4B0503]/80 text-center">
                                            <th className="w-[60px] py-2">STT</th>
                                            <th className="py-2 text-center">Tên loại sản phẩm</th>
                                            <th className="py-2">Mô tả</th>
                                            <th className="w-[120px] py-2">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentProductTypes.map((item, index) => (
                                            <tr
                                                key={item._id}
                                                className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]"
                                            >
                                                <td className="py-3 px-4 text-center">
                                                    {(currentPageProductType - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-center">{item.name}</td>
                                                <td className="py-3 px-4 text-gray-700 text-center text-sm max-w-md">
                                                    {item.description || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-center align-middle">
                                                    <div className="flex justify-center items-center gap-4 h-full">
                                                        <HiOutlinePencil
                                                            onClick={() => handleEdit({ ...item, category: "product_type" })}
                                                            className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                        />
                                                        <HiOutlineTrash
                                                            onClick={() => openDeleteModal({ ...item, category: "product_type" })}
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
                            currentPage={currentPageProductType}
                            totalPages={totalPagesProductType}
                            setCurrentPage={setCurrentPageProductType}
                        />
                    </>
                )}
            </section>

            {/* MODALS */}
            <CreateTopicModal
                isOpen={isTopicModalOpen}
                onClose={() => setIsTopicModalOpen(false)}
                onSubmit={fetchConfigs}
            />

            <CreateProductTypeModal
                isOpen={isProductTypeModalOpen}
                onClose={() => setIsProductTypeModalOpen(false)}
                onSubmit={fetchConfigs}
            />

            {/* Modal chỉnh sửa */}
            {isEditModalOpen && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-[#4B0503] mb-4">
                            Chỉnh sửa {editingItem.category === "topic" ? "Chủ đề" : "Loại sản phẩm"}
                        </h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                handleUpdate({
                                    name: formData.get("name"),
                                    description: formData.get("description"),
                                });
                            }}
                        >
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                                <input
                                    name="name"
                                    defaultValue={editingItem.name}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B40001]"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tùy chọn)</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingItem.description}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B40001]"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-gradient-to-r from-[#B40001] to-[#E29A7D] rounded-lg shadow-lg"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingItem(null);
                }}
                onConfirm={handleDeleteConfirm}
                itemName={deletingItem?.name ? `"${deletingItem.name}"` : undefined}
                itemType={deletingItem?.category === "topic" ? "chủ đề bài viết" : "loại sản phẩm"}
                actionText="Xóa"
            />
        </div>
    );
};

export default ContentTopicConfigPage;