import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaPlus,
    FaNewspaper,
    FaClock,
    FaChevronDown,
    FaEye,
} from "react-icons/fa";
import {
    HiOutlinePencil,
    HiOutlineTrash,
} from "react-icons/hi";
import { MdToggleOn, MdToggleOff } from "react-icons/md";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import StatsBoxes from "@/components/StatsBoxes";
import Pagination from "@/components/Pagination";
import CreateArticleModal from "@/components/CreateArticleModel";
import ViewArticleModal from "@/components/ViewArticleModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import EditArticleModal from "@/components/EditArticleModal";
import { getArticlesApi, createArticleApi, updateArticleApi, deleteArticleApi } from "@/services/article.service";

/* ================= STATUS DROPDOWN ================= */
// const StatusDropdown = ({ status, rawStatus, onChange}) => {
//     const [open, setOpen] = useState(false);
//     const ref = useRef(null);

//     const gradients = {
//         "Đã xuất bản": "linear-gradient(90deg, #5B0704 0%, #A71D0D 100%)",
//         "Bản nháp": "linear-gradient(90deg, #F7DFA8 0%, #D12B1E 100%)",
//     };

//     const DISPLAY_TYPE_GRADIENT = {
//         home: "linear-gradient(90deg, #5B0704 0%, #A71D0D 100%)",
//         hunt: "linear-gradient(90deg, #F7DFA8 0%, #D12B1E 100%)",
//     };

//     if (rawStatus === "published") {
//         return (
//             <span
//                 className="inline-flex px-4 py-1 text-[13px] font-semibold text-white rounded-md"
//                 style={{ background: gradients[status] }}
//             >
//                 {status}
//             </span>
//         );
//     }

//     const options = ["Đã xuất bản", "Bản nháp"];


//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (ref.current && !ref.current.contains(e.target)) {
//                 setOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     return (
//         <div className="relative inline-block text-center" ref={ref}>
//             <span
//                 onClick={() => setOpen(!open)}
//                 className="inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md cursor-pointer select-none transition-all"
//                 style={{ background: gradients[status] }}
//             >
//                 {status} <FaChevronDown className="ml-2" size={12} />
//             </span>

//             {open && (
//                 <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white rounded-xl shadow-lg z-50 border border-gray-200 overflow-hidden">
//                     {options.map((opt) => (
//                         <div
//                             key={opt}
//                             className="px-4 py-2 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503] transition"
//                             onClick={() => {
//                                 onChange(opt);
//                                 setOpen(false);
//                             }}
//                         >
//                             {opt}
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };
const StatusDropdown = ({ status, rawStatus, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const gradients = {
        "Đã xuất bản": "linear-gradient(90deg, #5B0704 0%, #A71D0D 100%)",
        "Bản nháp": "linear-gradient(90deg, #F7DFA8 0%, #D12B1E 100%)",
    };

    const options = ["Đã xuất bản", "Bản nháp"];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ SAU hook mới condition render
    if (rawStatus === "published") {
        return (
            <span
                className="inline-flex px-4 py-1 text-[13px] font-semibold text-white rounded-md"
                style={{ background: gradients[status] }}
            >
                {status}
            </span>
        );
    }

    return (
        <div className="relative inline-block text-center" ref={ref}>
            <span
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md cursor-pointer select-none transition-all"
                style={{ background: gradients[status] }}
            >
                {status} <FaChevronDown className="ml-2" size={12} />
            </span>

            {open && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white rounded-xl shadow-lg z-50 border border-gray-200 overflow-hidden">
                    {options.map((opt) => (
                        <div
                            key={opt}
                            className="px-4 py-2 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503]"
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
/* ================= FILTER DROPDOWN ================= */
const FilterDropdown = ({ label, value, setValue, options, allLabel = "Tất cả" }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm hover:bg-white/40 transition"
            >
                {value || label} <FaChevronDown size={12} />
            </button>

            {open && (
                <div className="absolute mt-2 w-56 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50 overflow-hidden">
                    <ul className="text-[#4B0503]">
                        <li
                            className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                            onClick={() => {
                                setValue(null);
                                setOpen(false);
                            }}
                        >
                            {allLabel}
                        </li>
                        {options.map((opt) => (
                            <li
                                key={typeof opt === "object" ? opt.value : opt}
                                className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                                onClick={() => {
                                    setValue(typeof opt === "object" ? opt.value : opt);
                                    setOpen(false);
                                }}
                            >
                                {typeof opt === "object" ? opt.label : opt}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

/* ================= MAIN ARTICLES PAGE ================= */
const ArticlesPage = () => {
    
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterVisible, setFilterVisible] = useState(null);
    const [articles, setArticles] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const itemsPerPage = 10;

    const statusOptions = [
        { label: "Đã xuất bản", value: "published" },
        { label: "Bản nháp", value: "draft" },
    ];

    const visibleOptions = [
        { label: "Đang hiển thị", value: true },
        { label: "Đang ẩn", value: false },
    ];

    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState(null);
    const glassGlow = `
        backdrop-blur-md
        bg-white/30
        rounded-2xl
        border border-white/30
        shadow-[0_0_20px_rgba(247,223,168,0.35)]
    `;
    const STATUS_LABEL = {
        published: "Đã xuất bản",
        draft: "Bản nháp",
    };
    const DISPLAY_TYPE_LABEL = {
        home: "Trang chủ",
        hunt: "Săn điểm",
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [articleToEdit, setArticleToEdit] = useState(null);

    // Lọc dữ liệu
    const filteredData = articles
        //.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
        .filter((a) =>
            (a.title || "").toLowerCase().includes(search.toLowerCase())
        )
        .filter((a) => (filterStatus === null ? true : a.status === filterStatus))
        .filter((a) => (filterVisible === null ? true : a.visible === filterVisible));

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const location = useLocation();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await getArticlesApi();
                setArticles(res.data.data);
            } catch (err) {
                console.error("Lỗi lấy bài báo", err);
            }
        };
        fetchArticles();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterStatus, filterVisible]);

    const handleDelete = async () => {
        if (!articleToDelete) return;

        try {
            await deleteArticleApi(articleToDelete._id);
            setArticles((prev) =>
                prev.filter((a) => a._id !== articleToDelete._id)
            );
        } catch (err) {
            console.error(err);
            alert("Xóa bài báo thất bại!");
        } finally {
            setArticleToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };


    const totalArticles = articles.length;
    const publishedCount = articles.filter(
        (a) => a.status === "published"
    ).length;


    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0]">
            {/* HEADER */}
            <div className="relative z-50 mb-6">
                <PageHeader
                    icon={<FaNewspaper className="text-3xl" />}
                    title="Quản lý Bài báo"
                    subtitle="Tạo, chỉnh sửa và quản lý các bài viết nội dung"
                    right={<HeaderWithAvatar />}
                />
            </div>

            {/* STATISTICS */}
            <div className="mb-8 w-full">
                <StatsBoxes
                    items={[
                        { title: "Tổng bài báo", value: totalArticles, icon: <FaNewspaper /> },
                        { title: "Đã xuất bản", value: publishedCount, icon: <FaClock /> },
                    ]}
                />
            </div>

            {/* MAIN CONTENT */}
            <section className={`${glassGlow} p-6 w-full`}>
                {/* FILTER + SEARCH + ADD BUTTON */}
                <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4 items-center">
                        <FilterDropdown
                            label="Lọc theo Trạng thái"
                            value={
                                filterStatus
                                ? STATUS_LABEL[filterStatus]
                                : null
                            }
                            setValue={setFilterStatus}
                            options={statusOptions}
                            />

                        <FilterDropdown
                            label="Hiển thị"
                            value={
                                filterVisible === null
                                    ? null
                                    : filterVisible
                                        ? "Đang hiển thị"
                                        : "Đang ẩn"
                            }
                            setValue={setFilterVisible}
                            options={visibleOptions}
                            allLabel="Tất cả"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm tiêu đề bài báo..."
                            className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-72"
                        />
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition cursor-pointer"
                        style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                    >
                        <FaPlus />
                        Tạo bài báo mới
                    </button>
                </div>

                {/* TABLE */}
                <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-visible">
                    <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-3">
                        <thead>
                            <tr className="text-[#4B0503]/80 text-center">
                                <th className="py-3 px-4 w-[60px]">STT</th>
                                <th className="py-3 px-4 w-[120px]">Ảnh</th>
                                <th className="py-3 px-4 text-left">Tiêu đề</th>
                                <th className="py-3 px-4 w-[150px]">Loại bài viết</th>
                                <th className="py-3 px-4 w-[130px]">Quiz</th>
                                <th className="py-3 px-4 w-[160px]">Trạng thái</th>
                                <th className="py-3 px-4 w-[100px]">Hiển thị</th>
                                <th className="py-3 px-4 w-[140px]">Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((article, index) => (
                                <tr
                                    key={article._id}
                                    className="bg-white/20 hover:bg-white/30 transition rounded-xl text-[#4B0503]"
                                >
                                    <td className="py-4 px-4 text-center">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        {article.thumbnail ? (
                                            <img
                                                src={article.thumbnail}
                                                alt={article.title}
                                                className="w-20 h-14 object-cover rounded-md mx-auto"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">Không có</span>
                                        )}
                                    </td>

                                    <td className="py-4 px-4 font-semibold text-left max-w-sm break-words">
                                        {article.title}
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        <span
                                            className="inline-block p-[1.5px] rounded-lg"
                                            style={{
                                                background:
                                                    article.displayType === "home"
                                                        // Trang chủ – đỏ nhấn
                                                        ? "linear-gradient(90deg, #E5CFB5 0%, #D12B1E 100%)"
                                                        // Săn điểm – sáng, nhẹ
                                                        : "linear-gradient(90deg, #F7DFA8 0%, #E5CFB5 100%)",
                                            }}
                                        >
                                            <span
                                                className="inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-medium"
                                                style={{
                                                    background:
                                                        article.displayType === "home"
                                                            ? "rgba(255,255,255,0.85)"
                                                            : "rgba(255,255,255,0.78)",
                                                    color:
                                                        article.displayType === "home"
                                                            ? "#8B1E0F"
                                                            : "#8A1A14",
                                                }}
                                            >
                                                {DISPLAY_TYPE_LABEL[article.displayType]}
                                            </span>
                                        </span>
                                    </td>


                                    <td className="py-4 px-4 text-center">
                                        {article.quiz ? (
                                            <Link
                                                to={`/quizzes/${article.quiz._id}`}
                                                state={{ from: location.pathname }}
                                                className="text-blue-600 hover:underline text-sm font-medium"
                                                title="Xem chi tiết quiz"
                                            >
                                                {article.quiz.title}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-500 text-sm">— Không có —</span>
                                        )}
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        <StatusDropdown
                                            status={STATUS_LABEL[article.status]}
                                            rawStatus={article.status}
                                            onChange={async (newLabel) => {
                                                const apiStatus =
                                                    newLabel === "Đã xuất bản" ? "published" : "draft";

                                                const res = await updateArticleApi(article._id, { status: apiStatus });
                                                const updatedArticle = res.data.data;

                                                setArticles(prev =>
                                                    prev.map(a =>
                                                    a._id === updatedArticle._id ? updatedArticle : a
                                                    )
                                                );
                                                }}
                                        />

                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={async () => {
                                                if (article.status === "draft") {
                                                    alert("Không thể hiển thị bài báo khi đang ở trạng thái bản nháp");
                                                    return;
                                                }

                                                const newVisible = !article.visible;

                                                const res = await updateArticleApi(article._id, {
                                                    visible: newVisible,
                                                });

                                                const updatedArticle = res.data.data;

                                                setArticles(prev =>
                                                    prev.map(a =>
                                                        a._id === article._id
                                                            ? { ...a, visible: updatedArticle.visible }
                                                            : a
                                                    )
                                                );
                                            }}


                                        >
                                            {article.status === "draft" ? (
                                                <MdToggleOff className="text-gray-300 text-[46px] cursor-not-allowed" />
                                            ) : article.visible ? (
                                                <MdToggleOn className="text-green-500 text-[46px] cursor-pointer" />
                                            ) : (
                                                <MdToggleOff className="text-gray-400 text-[46px] cursor-pointer" />
                                            )}

                                        </button>
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            {article.status !== "published" ? (
                                                <HiOutlinePencil
                                                    className="text-green-600 cursor-pointer text-2xl"
                                                    title="Chỉnh sửa"
                                                    onClick={() => {
                                                        setArticleToEdit(article);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                />
                                            ) : (
                                                <HiOutlinePencil
                                                    className="text-gray-300 cursor-not-allowed text-2xl"
                                                    title="Bài báo đã xuất bản không thể chỉnh sửa"
                                                />
                                            )}

                                            <HiOutlineTrash
                                                className="text-red-600 cursor-pointer text-2xl"
                                                title="Xóa"
                                                onClick={() => {
                                                    setArticleToDelete(article);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            />
                                            
                                            <button
                                                title="Xem chi tiết"
                                                className="inline-flex cursor-pointer items-center -mt-1 justify-center p-2 rounded-md bg-white/30 text-[#4B053] hover:bg-white/40 shadow-sm"
                                                onClick={() => {
                                                    setSelectedArticle(article);
                                                    setIsViewModalOpen(true);
                                                }}
                                            >
                                                <FaEye />
                                            </button>
                                            
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

                {/* PAGINATION */}
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            </section>

            {/* MODAL TẠO BÀI BÁO */}
            <CreateArticleModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={async (formData) => {
                    try {
                        const res = await createArticleApi(formData);
                        console.log("Tạo bài báo thành công:", res.data); // log để kiểm tra
                        // Thêm bài mới vào đầu danh sách (nếu API trả về đúng data)
                        if (res.data && res.data.data) {
                            setArticles((prev) => [res.data.data, ...prev]);
                        } else {
                            // Nếu API trả khác cấu trúc, reload toàn bộ
                            const refresh = await getArticlesApi();
                            setArticles(refresh.data.data);
                        }
                        setIsCreateModalOpen(false);
                    } catch (err) {
                        console.error("Lỗi khi tạo bài báo:", err);
                        // Log chi tiết hơn để biết lý do
                        if (err.response) {
                            console.log("Response lỗi từ server:", err.response.data);
                            alert("Tạo bài báo thất bại: " + (err.response.data?.message || "Lỗi không xác định"));
                        } else if (err.request) {
                            console.log("Không nhận được response từ server:", err.request);
                            alert("Không kết nối được server. Kiểm tra backend có chạy không?");
                        } else {
                            console.log("Lỗi khác:", err.message);
                            alert("Lỗi: " + err.message);
                        }
                    }
                }}
            />

            <EditArticleModal
                isOpen={isEditModalOpen}
                article={articleToEdit}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setArticleToEdit(null);
                }}
                onSubmit={async (id, formData) => {
                    const res = await updateArticleApi(id, formData);
                    const updated = res.data.data;

                    setArticles(prev =>
                        prev.map(a =>
                            a._id === updated._id ? updated : a
                        )
                    );

                    setIsEditModalOpen(false);
                }}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setArticleToDelete(null);
                }}
                onConfirm={handleDelete}
                itemName={articleToDelete?.title}
                itemType="bài báo"
                actionText="Xóa"
            />

            <ViewArticleModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                article={selectedArticle}
            />
        </div>
    );
};

export default ArticlesPage;