import React, { useState, useRef, useEffect } from "react";
import {
    FaChevronDown,
    FaCalendarCheck,
    FaGift,
    FaMoneyBillWave,
    FaClipboardCheck
    
} from "react-icons/fa";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import Pagination from "@/components/Pagination";
import StatsBoxes from "@/components/StatsBoxes";
import FilterDropdown from "@/components/FilterDropdown";

/* ================= MOCK DATA ================= */
const mockKnowledgePosts = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    title: `Bài viết kiến thức ${i + 1}`,
    topic: i % 4 === 0 ? "Môi trường" : i % 4 === 1 ? "Kiến thức" : i % 4 === 2 ? "Sức khỏe" : "Công nghệ",
    content: `Nội dung mẫu cho bài viết kiến thức số ${i + 1}. Đây là phần tóm tắt hoặc trích dẫn nội dung bài viết.`,
    attachment: i % 3 === 0 ? `knowledge-${i + 1}.pdf` : i % 3 === 1 ? `image-${i + 1}.jpg` : "",
    status: i % 3 === 0 ? "Chờ duyệt" : i % 3 === 1 ? "Chấp nhận" : "Từ chối",
}));

const mockProductPosts = Array.from({ length: 10 }).map((_, i) => ({
    id: 100 + i + 1,
    type: i % 2 === 0 ? "Sản phẩm xanh" : "Dịch vụ xanh",
    name: `Sản phẩm ${i + 1}`,
    description: `Mô tả ngắn gọn về sản phẩm thân thiện với môi trường số ${i + 1}.`,
    pricing: i % 2 === 0 ? "Có phí" : "Miễn phí",
    attachment: `product-${i + 1}.png`,
    status: i % 3 === 0 ? "Chờ duyệt" : i % 3 === 1 ? "Chấp nhận" : "Từ chối",
}));

const ContentManagementPage = () => {
    const [activeTab, setActiveTab] = useState("knowledge");

    const [knowledgeData, setKnowledgeData] = useState(mockKnowledgePosts);
    const [productData, setProductData] = useState(mockProductPosts);

    const [filterTopic, setFilterTopic] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [search, setSearch] = useState("");

    const [openDropdown, setOpenDropdown] = useState(null);
    const topicRef = useRef(null);
    const typeRef = useRef(null);
    const statusRef = useRef(null);

    const [editingStatusId, setEditingStatusId] = useState(null);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const topicOptions = [...new Set(knowledgeData.map(e => e.topic))];
    const typeOptions = [...new Set(productData.map(e => e.type))];
    const statusOptions = ["Chấp nhận", "Từ chối", "Chờ duyệt"];

    const rawData = activeTab === "knowledge" ? knowledgeData : productData;
    const setRawData = activeTab === "knowledge" ? setKnowledgeData : setProductData;

    const filteredData = rawData
        .filter(item => {
            const searchText = activeTab === "knowledge" ? item.title : item.name;
            return searchText.toLowerCase().includes(search.toLowerCase());
        })
        .filter(item => {
            if (activeTab === "knowledge") return filterTopic ? item.topic === filterTopic : true;
            return filterType ? item.type === filterType : true;
        });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    /* ====== FIX CLICK OUTSIDE ====== */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (editingStatusId && statusRef.current && !statusRef.current.contains(e.target)) {
                setEditingStatusId(null);
            }
            if (openDropdown && !topicRef.current?.contains(e.target) && !typeRef.current?.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [editingStatusId, openDropdown]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, search, filterTopic, filterType]);

    const knowledgeCount = knowledgeData.length;
    const productCount = productData.length;
    const pendingCount =
        knowledgeData.filter(e => e.status === "Chờ duyệt").length +
        productData.filter(e => e.status === "Chờ duyệt").length;

    const glassGlow = `
        backdrop-blur-md
        bg-white/30
        rounded-2xl
        border border-white/30
        shadow-[0_0_20px_rgba(247,223,168,0.35)]
    `;

    const gradients = {
        primary: "linear-gradient(to right, #5B0704 0%, #A71D0D 50%, #D12B1E 100%)",
        secondary: "linear-gradient(to right, #D12B1E 0%, #B40001 50%, #E5CFB5 100%)",
        accent: "linear-gradient(to right, #B40001 0%, #E29A7D 50%, #F5E0C3 100%)",
    };

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0]">
            {/* HEADER */}
            <div className="relative z-50 mb-6">
                <PageHeader
                    icon={<FaClipboardCheck />}
                    title="Quản lý bài viết"
                    subtitle="Quản lý và duyệt bài viết kiến thức & sản phẩm"
                    right={<HeaderWithAvatar />}
                />
            </div>

            {/* STATISTICS */}
            <div className="mb-8 w-full">
                <StatsBoxes
                    items={[
                        { title: "Bài viết Kiến thức", value: knowledgeCount, icon: <FaCalendarCheck /> },
                        { title: "Bài viết Sản phẩm", value: productCount, icon: <FaGift /> },
                        { title: "Chờ duyệt", value: pendingCount, icon: <FaMoneyBillWave /> },
                    ]}
                />
            </div>

            {/* TABS */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => { setActiveTab("knowledge"); setFilterTopic(null); setFilterType(null); setSearch(""); }}
                    className={`px-6 py-3 rounded-t-xl font-semibold relative cursor-pointer transition-all ${activeTab === "knowledge"
                        ? "bg-white/80 text-[#4B0503]"
                        : "bg-white/30 text-[#4B0503]/70"
                        }`}
                >
                    Bài viết Kiến thức
                    {activeTab === "knowledge" && (
                        <span
                            className="absolute bottom-0 left-0 w-full h-1 rounded-t-none"
                            style={{ background: gradients.primary }}
                        />
                    )}
                </button>
                <button
                    onClick={() => { setActiveTab("product"); setFilterTopic(null); setFilterType(null); setSearch(""); }}
                    className={`px-6 py-3 rounded-t-xl font-semibold relative cursor-pointer transition-all ${activeTab === "product"
                        ? "bg-white/80 text-[#4B0503]"
                        : "bg-white/30 text-[#4B0503]/70"
                        }`}
                >
                    Bài viết Sản phẩm
                    {activeTab === "product" && (
                        <span
                            className="absolute bottom-0 left-0 w-full h-1 rounded-t-none"
                            style={{ background: gradients.secondary }}
                        />
                    )}
                </button>
            </div>

            {/* FILTER + SEARCH */}
            <section className={`${glassGlow} p-6 w-full mb-6`}>
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                    {/* FILTER */}
                    {activeTab === "knowledge" ? (
                        <FilterDropdown
                            label="Lọc theo Chủ đề"
                            options={topicOptions}
                            value={filterTopic}
                            onChange={(val) => { setFilterTopic(val); setCurrentPage(1); }}
                        />
                    ) : (
                        <FilterDropdown
                            label="Lọc theo Loại sản phẩm"
                            options={typeOptions}
                            value={filterType}
                            onChange={(val) => { setFilterType(val); setCurrentPage(1); }}
                        />
                    )}
                    

                    {/* SEARCH */}
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder={activeTab === "knowledge" ? "Tìm kiếm bài viết..." : "Tìm kiếm sản phẩm..."}
                        className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-56"
                    />
                </div>

                {/* TABLE */}
                <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4">
                    <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-2">
                        <thead>
                            <tr className="text-[#4B0503]/80 text-center">
                                <th className="py-2 px-3 w-[50px]">STT</th>
                                {activeTab === "knowledge" ? (
                                    <>
                                        <th className="py-2 px-3 w-[220px] text-left">Tiêu đề</th>
                                        <th className="py-2 px-3 w-[160px]">Chủ đề</th>
                                        <th className="py-2 px-3 text-left">Nội dung tóm tắt</th>
                                        <th className="py-2 px-3 w-[160px]">File đính kèm</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="py-2 px-3 w-[160px]">Loại sản phẩm</th>
                                        <th className="py-2 px-3 w-[200px] text-left">Tên sản phẩm</th>
                                        <th className="py-2 px-3 text-left">Mô tả</th>
                                        <th className="py-2 px-3 w-[120px]">Hình thức</th>
                                        <th className="py-2 px-3 w-[160px]">File đính kèm</th>
                                    </>
                                )}
                                <th className="py-2 px-3 w-[150px]">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item, index) => (
                                <tr key={item.id} className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]">
                                    <td className="py-2 px-3 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    {activeTab === "knowledge" ? (
                                        <>
                                            <td className="py-2 px-3 font-semibold text-left">{item.title}</td>
                                            <td className="py-2 px-3 text-center">{item.topic}</td>
                                            <td className="py-2 px-3 text-left break-words">{item.content}</td>
                                            <td className="py-2 px-3 text-center">{item.attachment || "-"}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-2 px-3 text-center">{item.type}</td>
                                            <td className="py-2 px-3 font-semibold text-left">{item.name}</td>
                                            <td className="py-2 px-3 text-left break-words">{item.description}</td>
                                            <td className="py-2 px-3 text-center">{item.pricing}</td>
                                            <td className="py-2 px-3 text-center">{item.attachment}</td>
                                        </>
                                    )}

                                    {/* Trạng thái */}
                                    <td className="py-2 px-3 text-center relative">
                                        <div ref={statusRef}>
                                            <span
                                                onClick={() => setEditingStatusId(editingStatusId === item.id ? null : item.id)}
                                                className="inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md cursor-pointer select-none"
                                                style={{
                                                    background:
                                                        item.status === "Chấp nhận"
                                                            ? gradients.primary
                                                            : item.status === "Từ chối"
                                                                ? gradients.secondary
                                                                : gradients.accent,
                                                }}
                                            >
                                                {item.status} <FaChevronDown className="ml-2" size={12} />
                                            </span>
                                            {editingStatusId === item.id && (
                                                <div className="absolute left-[50%] -translate-x-[50%] mt-2 w-36 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                                                    {statusOptions.map(option => (
                                                        <div
                                                            key={option}
                                                            className="px-4 py-2 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503]"
                                                            onClick={() => {
                                                                setRawData(prev => prev.map(e => e.id === item.id ? { ...e, status: option } : e));
                                                                setEditingStatusId(null);
                                                            }}
                                                        >
                                                            {option}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
        </div>
    );
};

export default ContentManagementPage;
