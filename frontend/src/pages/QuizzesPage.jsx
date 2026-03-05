import React, { useState, useEffect, useRef } from "react";
import  {useLocation} from "react-router-dom";
import {
    FaPlus,
    FaQuestionCircle,
    FaClock,
    FaChevronDown,
    FaEye
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
import { Link, useNavigate } from "react-router-dom";
import { getQuizzesApi, deleteQuizApi, updateQuizStatusApi, updateQuizVisibleApi} from "@/services/quiz.service";
import { QUIZ_STATUS } from "@/constants/quizStatus";
import { QUIZ_STATUS_OPTIONS } from "@/constants/quizStatus";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import {toast} from "sonner";
/* ================= STATUS DROPDOWN ================= */
const StatusDropdown = ({ status, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const options = Object.keys(QUIZ_STATUS);
    
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-center" ref={ref}>
            {/* <span
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md cursor-pointer select-none transition-all"
                style={{ background: gradients[status] }}
            >
                {STATUS_LABEL[status]} <FaChevronDown className="ml-2" size={12} />
            </span> */}

            <span
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md cursor-pointer select-none transition-all"
                style={{ background: QUIZ_STATUS[status].color }}
            >
                {QUIZ_STATUS[status].label}
                <FaChevronDown className="ml-2" size={12} />
            </span>


            {open && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white rounded-xl shadow-lg z-50 border border-gray-200 overflow-hidden">
                    {options.map((opt) => (
                        <div
                            key={opt}
                            className="px-4 py-2 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503] transition"
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                        >
                            {QUIZ_STATUS[opt].label}
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

/* ================= MAIN QUIZZES PAGE ================= */
const QuizzesPage = () => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState(null);        
    const [filterVisible, setFilterVisible] = useState(null);      
    const [quizzes, setQuizzes] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const itemsPerPage = 10;

    const visibleOptions = [
        { label: "Đang hiển thị", value: true },
        { label: "Đang ẩn", value: false },
    ];

    const glassGlow = `
        backdrop-blur-md
        bg-white/30
        rounded-2xl
        border border-white/30
        shadow-[0_0_20px_rgba(247,223,168,0.35)]
    `;

    // Lọc dữ liệu - logic rõ ràng, dễ đọc
    const filteredData = quizzes
        .filter((q) => q.title.toLowerCase().includes(search.toLowerCase()))
        .filter((q)=> filterStatus === null ? true : q.status === filterStatus)
        .filter((q) => (filterVisible === null ? true : q.visible === filterVisible));

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    // useEffect(() => {
    //     const fetchQuizzes = async () => {
    //         const res = await getQuizzesApi();
    //         setQuizzes(res.data.data || []);
    //     };
    //     fetchQuizzes();
    // }, []);
    useEffect(() => {
    const fetchQuizzes = async () => {
        try {
            const res = await getQuizzesApi();
            setQuizzes(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải danh sách quiz");
        }
    };
    fetchQuizzes();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterStatus, filterVisible]);

    const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
        await deleteQuizApi(deleteTarget.id);

        setQuizzes((prev) =>
            prev.filter((q) => q.id !== deleteTarget.id)
        );

        toast.success(`Đã xóa bài quiz "${deleteTarget.title}"`);
    } catch (err) {
        console.error(err);
        toast.error("Xóa bài quiz thất bại");
    } finally {
        setDeleteTarget(null);
    }
};
    const totalQuizzes = quizzes.length;
    const publishedCount = quizzes.filter((q) => q.status === "published").length;

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0]">
            {/* HEADER */}
            <div className="relative z-50 mb-6">
                <PageHeader
                    icon={<FaQuestionCircle className="text-3xl" />}
                    title="Quản lý Bài Quiz"
                    subtitle="Tạo, chỉnh sửa và quản lý các bài trắc nghiệm kiến thức"
                    right={<HeaderWithAvatar />}
                />
            </div>

            {/* STATISTICS */}
            <div className="mb-8 w-full">
                <StatsBoxes
                    items={[
                        { title: "Tổng bài quiz", value: totalQuizzes, icon: <FaQuestionCircle /> },
                        { title: "Đã xuất bản", value: publishedCount, icon: <FaClock /> },
                    ]}
                />
            </div>

            {/* MAIN CONTENT */}
            <section className={`${glassGlow} p-6 w-full`}>
                {/* FILTER + SEARCH + ADD BUTTON */}
                <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* <FilterDropdown
                            label="Lọc theo Trạng thái"
                            value={
                                filterStatus
                                ? QUIZ_STATUS[filterStatus].label
                                :null
                            }
                            setValue={setFilterStatus}
                            options={statusOptions}
                            allLabel="Tất cả trạng thái"
                        /> */}

                        <FilterDropdown
                            label="Lọc theo Trạng thái"
                            value={filterStatus ? QUIZ_STATUS[filterStatus].label : null}
                            setValue={setFilterStatus}
                            options={QUIZ_STATUS_OPTIONS}
                            allLabel="Tất cả trạng thái"
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
                            setValue={setFilterVisible}  // Truyền trực tiếp boolean
                            options={visibleOptions}
                            allLabel="Tất cả"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm tiêu đề bài quiz..."
                            className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-72"
                        />
                    </div>

                    {/* <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition cursor-pointer"
                        style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                    >
                        <FaPlus />
                        Tạo bài quiz mới
                    </button> */}
                    <Link
                        to="/quizzes/create"
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition"
                        style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                    >
                        <FaPlus />
                        Tạo bài quiz mới
                    </Link>
                </div>

                {/* TABLE */}
                <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-visible">
                    <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-3">
                        <thead>
                            <tr className="text-[#4B0503]/80 text-center">
                                <th className="py-3 px-4 w-[60px]">STT</th>
                                <th className="py-3 px-4 text-left">Tiêu đề bài quiz</th>
                                <th className="py-3 px-4 w-[130px]">Số câu hỏi</th>
                                <th className="py-3 px-4 w-[160px]">Trạng thái</th>
                                <th className="py-3 px-4 w-[110px]">Hiển thị</th>
                                <th className="py-3 px-4 w-[130px]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((quiz, index) => (
                                <tr
                                    key={quiz.id}
                                    className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]"
                                >
                                    <td className="py-4 px-4 text-center">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="py-4 px-4 font-semibold text-left break-words max-w-md">
                                        {quiz.title}
                                    </td>
                                    <td className="py-4 px-4 text-center">{quiz.questions} câu</td>
                                
                                    <td className="py-4 px-4 text-center">
                                        {quiz.status === "published" ? (
                                            <span
                                                className="inline-flex px-4 py-1 text-[13px] font-semibold text-white rounded-md"
                                                style={{ background: QUIZ_STATUS[quiz.status].color }}
                                            >
                                                {QUIZ_STATUS[quiz.status].label}
                                            </span>
                                        ) : (
                                            <StatusDropdown
                                            status={quiz.status}
                                            onChange={async (newStatus) => {
                                                try {
                                                    const res = await updateQuizStatusApi(quiz.id, newStatus);
                                                    const updatedQuiz = res.data;

                                                    setQuizzes((prev) =>
                                                        prev.map((q) =>
                                                            q.id === quiz.id
                                                                ? {
                                                                    ...q,
                                                                    status: updatedQuiz.status,
                                                                    visible: updatedQuiz.visible,
                                                                }
                                                                : q
                                                        )
                                                    );

                                                    toast.success(
                                                        `${QUIZ_STATUS[newStatus].label} thành công`
                                                    );
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error("Cập nhật trạng thái thất bại");
                                                }
                                            }}
                                        />
                                        )}
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        <button
                                            className={`flex justify-center w-full ${quiz.status === "draft" ? "cursor-not-allowed opacity-50" : ""
                                                }`}
                                            title={
                                                quiz.status === "draft"
                                                    ? "Quiz ở trạng thái bản nháp, không thể hiển thị"
                                                    : quiz.visible
                                                        ? "Đang hiển thị"
                                                        : "Đang ẩn"
                                            }
                                            disabled={quiz.status === "draft"}
                                            onClick={async () => {
    if (quiz.status === "draft") return;

    try {
        await updateQuizVisibleApi(quiz.id);

        setQuizzes((prev) =>
            prev.map((q) =>
                q.id === quiz.id
                    ? { ...q, visible: !q.visible }
                    : q
            )
        );

        toast.success(
            quiz.visible
                ? "Đã ẩn bài quiz"
                : "Đã hiển thị bài quiz"
        );
    } catch (err) {
        console.error(err);
        toast.error("Thay đổi trạng thái hiển thị thất bại");
    }
}}
                                        >
                                            {quiz.status === "draft" ? (
                                                <MdToggleOff className="text-gray-400 text-[50px]" />
                                            ) : quiz.visible ? (
                                                <MdToggleOn className="text-green-500 text-[50px] cursor-pointer hover:scale-110 transition" />
                                            ) : (
                                                <MdToggleOff className="text-gray-400 text-[50px] cursor-pointer hover:scale-110 transition" />
                                            )}
                                        </button>
                                    </td>


                                    <td className="py-2 px-3 text-center">
                                        <div className="flex justify-center gap-3">
                                            <HiOutlinePencil
                                                title="Chỉnh sửa"
                                                className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                                            />
                                            <HiOutlineTrash
                                                title="Xóa"
                                                className="text-red-600 cursor-pointer hover:scale-110 transition text-2xl"
                                                onClick={() => setDeleteTarget(quiz)}
                                            />

                                            <button
                                                title="Xem chi tiết"
                                                className="inline-flex cursor-pointer items-center -mt-1 justify-center p-2 rounded-md bg-white/30 text-[#4B0503] hover:bg-white/40 shadow-sm"
                                                onClick={() =>
                                                    navigate(`/quizzes/${quiz.id}`, {
                                                        state: { from: location.pathname },
                                                    })
                                                }
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

            {/* MODAL */}

            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                itemName={deleteTarget?.title}
                itemType="bài quiz"
                actionText="Xóa"
            />

        </div>
    );
};

export default QuizzesPage;