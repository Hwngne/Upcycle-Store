import React, { useState, useRef, useEffect } from "react";
import {
    FaBoxOpen,
    FaTruck,
    FaClock,
    FaChevronDown,
    FaExclamationTriangle,
    FaEye
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import StatsBoxes from "@/components/StatsBoxes";
import ChangeStatusModal from "@/components/ChangeStatusModal";
import Pagination from "@/components/Pagination";
import { getAllRewardsApi, updateRewardStatusApi } from "@/services/reward.service" // Giả sử đường dẫn đúng đến api.js
import ViewRewardModal from "@/components/ViewRewardModal";
import {toast} from "sonner";


const RewardsPage = () => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [openDropdown, setOpenDropdown] = useState(null);
    const statusFilterRef = useRef(null);
    const itemsPerPage = 10;
    
    const navigate = useNavigate();
    const location = useLocation();
    const [openView, setOpenView] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);

    // State cho dữ liệu từ API
    const [rewardsData, setRewardsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterStatus, setFilterStatus] = useState(null);

    const [editingStatusId, setEditingStatusId] = useState(null);
    const inlineStatusDropdownRef = useRef(null);

    const [isUpdating, setIsUpdating] = useState(false);


    // Map giữa status backend (EN) và hiển thị frontend (VN)
    const STATUS_MAP = {
        pending: "Chờ nhận",
        completed: "Đã phát",
        expired: "Quá hạn",
        cancelled: "Bị hủy",
    };

    // Map ngược để gửi API
    const REVERSE_STATUS_MAP = {
        "Chờ nhận": "pending",
        "Đã phát": "completed",
        "Quá hạn": "expired",
        "Bị hủy": "cancelled",
    };

    const STATUS_OPTIONS = ["Chờ nhận", "Đã phát", "Bị hủy"];
    const ALL_STATUS = ["Chờ nhận", "Đã phát", "Quá hạn", "Bị hủy"];
    const filterStatusOptions = ["Tất cả", ...ALL_STATUS];

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        id: null,
        currentStatus: "",
        newStatus: "",
    });

    const fetchRewards = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllRewardsApi();
            const data = response.data;

            const now = new Date();

            const processedData = data
                .map((item) => {
                    let displayStatus = STATUS_MAP[item.status] || "Khác";

                    if (
                        item.status === "pending" &&
                        item.expiresAt &&
                        new Date(item.expiresAt) < now
                    ) {
                        displayStatus = "Quá hạn";
                    }

                    return {
                        ...item,
                        displayStatus,
                        id: item._id,
                        user: item.account?._id || item.user,
                    };
                })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setRewardsData(processedData);
        } catch (err) {
            setError("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchRewards();
    }, []);

    const handleChangeStatus = (id, newStatus, currentStatus) => {
        if (currentStatus === "Quá hạn") return;

        setConfirmModal({
            open: true,
            id,
            currentStatus,
            newStatus,
        });
    };

    const handleConfirmChangeStatus = async () => {
        const { id, newStatus } = confirmModal;
        const apiStatus = REVERSE_STATUS_MAP[newStatus];

        const previousRewards = [...rewardsData];
        setRewardsData((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, status: apiStatus, displayStatus: newStatus }
                    : r
            )
        );

        try {
            await updateRewardStatusApi(id, apiStatus);

            toast.success(`Đã cập nhật trạng thái thành "${newStatus}"`);
            await fetchRewards();

        } catch (err) {
            setRewardsData(previousRewards);
            toast.error(
                err.response?.data?.message || "Cập nhật thất bại"
            );
        } finally {
            setConfirmModal({
                open: false,
                id: null,
                currentStatus: "",
                newStatus: "",
            });
        }
    };
    const getRewardsterName = (account) => {
        if (!account) return "N/A";

        if (account.role === "student") {
            return account.student_name || account.email;
        }

        if (account.role === "club") {
            return account.club_info?.club_name || account.email;
        }

        if (account.role === "admin") {
            return account.admin_name || account.email;
        }

        return account.email;
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (openDropdown === "status" && statusFilterRef.current && !statusFilterRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
            if (editingStatusId && inlineStatusDropdownRef.current && !inlineStatusDropdownRef.current.contains(e.target)) {
                setEditingStatusId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown, editingStatusId]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterStatus]);

    const getDisplayStatus = (item) => item.displayStatus;

    const filteredRewards = rewardsData
        .filter((r) =>
            r.giftName?.toLowerCase().includes(search.toLowerCase()) ||
            r.gift?.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.redemptionCode?.toLowerCase().includes(search.toLowerCase())
        )
        .filter((r) => (filterStatus ? getDisplayStatus(r) === filterStatus : true));

    const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
    const currentData = filteredRewards.slice(
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
        pending: "linear-gradient(90deg, #F7DFA8 0%, #D12B1E 100%)",
        delivered: "linear-gradient(90deg, #D12B1E 0%, #E5CFB5 100%)",
        overdue: "linear-gradient(90deg, #5B0704 0%, #D12B1E 100%)",
        cancelled: "linear-gradient(90deg, #808080 0%, #A9A9A9 100%)", // Thêm cho cancelled
    };

    // Hàm lấy gradient theo displayStatus
    const getGradient = (status) => {
        if (status === "Chờ nhận") return gradients.pending;
        if (status === "Đã phát") return gradients.delivered;
        if (status === "Quá hạn") return gradients.overdue;
        if (status === "Bị hủy") return gradients.cancelled;
        return gradients.pending;
    };

    // Xử lý delete (thêm API nếu cần, hiện tại giả sử chưa có, chỉ xóa local)
    const handleDelete = (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa?")) {
            setRewardsData((prev) => prev.filter((r) => r.id !== id));
            // TODO: Gọi API delete nếu backend hỗ trợ
        }
    };

    // Xử lý edit (pencil): Có thể mở modal edit đầy đủ, nhưng hiện tại chưa implement
    const handleEdit = (id) => {
        alert(`Chỉnh sửa reward ID: ${id} - Chưa implement modal edit`);
    };

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0]">
            {/* HEADER */}
            <div className="relative z-50 mb-6">
                <PageHeader
                    icon={<FaBoxOpen />}
                    title="Nhận thưởng"
                    subtitle="Quản lý danh sách nhận thưởng"
                    right={<HeaderWithAvatar />}
                />
            </div>

            {/* STATS */}
            <div className="mb-8 w-full">
                <StatsBoxes
                    items={[
                        {
                            title: "Chờ nhận",
                            value: rewardsData.filter((r) => getDisplayStatus(r) === "Chờ nhận").length,
                            icon: <FaClock />,
                        },
                        {
                            title: "Đã phát",
                            value: rewardsData.filter((r) => getDisplayStatus(r) === "Đã phát").length,
                            icon: <FaTruck />,
                        },
                        {
                            title: "Quá hạn",
                            value: rewardsData.filter((r) => getDisplayStatus(r) === "Quá hạn").length,
                            icon: <FaExclamationTriangle />,
                        },
                    ]}
                />
            </div>

            {/* MAIN SECTION */}
            <section className={`${glassGlow} p-6 w-full`}>
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                    {/* Filter Trạng thái */}
                    <div className="relative" ref={statusFilterRef}>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
                            className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm"
                        >
                            {filterStatus || "Lọc theo Trạng thái"} <FaChevronDown size={12} />
                        </button>
                        {openDropdown === "status" && (
                            <div className="absolute mt-2 w-44 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50 overflow-hidden">
                                {filterStatusOptions.map((st) => (
                                    <div
                                        key={st}
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503]"
                                        onClick={() => {
                                            setFilterStatus(st === "Tất cả" ? null : st);
                                            setOpenDropdown(null);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        {st}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="Tìm tên quà hoặc mã nhận thưởng..."
                        className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-56"
                    />
                </div>

                {/* TABLE */}
                <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-visible">
                    <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-2">
                        <thead>
                            <tr className="text-[#4B0503]/80 text-center">
                                <th className="py-2 px-3 w-[50px]">STT</th>
                                <th className="py-2 px-3 w-[220px] text-center">Tên quà</th>
                                <th className="py-2 px-3 w-[160px]">Mã nhận thưởng</th>
                                <th className="py-2 px-3 w-[140px]">Nơi nhận</th>
                                <th className="py-2 px-3 text-center">Người nhận</th>
                                <th className="py-2 px-3 w-[150px]">Trạng thái</th>
                                <th className="py-2 px-3 w-[100px]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((r, index) => {
                                const displayStatus = getDisplayStatus(r);
                                return (
                                    <tr
                                        key={r.id}
                                        className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]"
                                    >
                                        <td className="py-2 px-3 text-center">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-center break-words max-w-[220px]">
                                            {r.giftName}
                                        </td>
                                        <td className="py-2 px-3 text-center">{r.redemptionCode}</td>
                                        <td className="py-2 px-3 text-center">{r.location}</td>
                                        <td className="py-2 px-3 text-center break-words max-w-md">
                                            {getRewardsterName(r.account || r.user)}
                                        </td>

                                        {/* Trạng thái inline */}
                                        <td className="py-2 px-3 text-center relative">
                                            <div
                                                ref={editingStatusId === r.id ? inlineStatusDropdownRef : null}
                                                className="inline-block"
                                            >
                                                <span
                                                   onClick={() =>{
                                                    if(displayStatus !== "Chờ nhận") return;
                                                    setEditingStatusId(editingStatusId === r.id ? null : r.id);
                                                   }}
                                                    className={`inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md select-none
                                                            ${displayStatus === "Chờ nhận"
                                                            ? "cursor-pointer hover:brightness-110"
                                                            : "cursor-default"}
                                                    `}

                                                    style={{ background: getGradient(displayStatus) }}
                                                >
                                                    {displayStatus}
                                                    {displayStatus === "Chờ nhận" && (
                                                        <FaChevronDown className="ml-2" size={12} />
                                                    )}

                                                </span>

                                                {editingStatusId === r.id && displayStatus === "Chờ nhận" && (
                                                    <div className="absolute left-[50%] -translate-x-[50%] mt-2 w-40 bg-white rounded-xl shadow-lg z-50 overflow-hidden border border-gray-200">
                                                        {STATUS_OPTIONS.filter((st) => st !== displayStatus).map((st) => (
                                                            <div
                                                                key={st}
                                                                className="px-4 py-2 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503]"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleChangeStatus(r.id, st, displayStatus);
                                                                }}
                                                            >
                                                                {st}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="py-2 px-3 text-center">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    title="Xem chi tiết"
                                                    className="inline-flex cursor-pointer items-center -mt-1 justify-center p-2 rounded-md bg-white/30 text-[#4B0503] hover:bg-white/40 shadow-sm"
                                                    onClick={() => {
                                                        setSelectedReward(r);
                                                        setOpenView(true);
                                                    }}
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </td>


                                    </tr>
                                );
                            })}
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

            <ChangeStatusModal
                isOpen={confirmModal.open}
                currentStatus={confirmModal.currentStatus}
                newStatus={confirmModal.newStatus}
                onClose={() =>
                    setConfirmModal({ open: false, id: null, currentStatus: "", newStatus: "" })
                }
                onConfirm={handleConfirmChangeStatus} // Sửa để gọi API
            />

            <ViewRewardModal
                isOpen={openView}
                onClose={() => setOpenView(false)}
                reward={selectedReward}
            />

        </div>
    );
};

export default RewardsPage;