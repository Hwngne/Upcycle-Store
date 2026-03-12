import React, { useState, useEffect, useRef } from "react";
import {
    FaPlus,
    FaVideo,
    FaClock,
    FaEye,
    FaChevronDown,
} from "react-icons/fa";
import {
    HiOutlinePencil,
    HiOutlineTrash,
} from "react-icons/hi";
import { MdToggleOn, MdToggleOff } from "react-icons/md";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import StatsBoxes from "@/components/StatsBoxes";
import {
    getAllVideosApi,
    updateVideoStatusApi,
    toggleVideoVisibleApi,
    deleteVideoApi,
} from "@/services/video.service";
import CreateVideoModal from "@/components/CreateVideoModal";
import ViewVideoModal from "@/components/ViewVideoModal";
import Pagination from "@/components/Pagination";
import EditVideoModal from "@/components/EditVideoModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";



/* ================= STATUS DROPDOWN ================= */
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
                className="inline-flex items-center justify-center gap-2
                px-4 py-1 text-[13px] font-semibold text-white
                rounded-md cursor-pointer select-none"
                style={{ background: gradients[status] }}
            >
                {status}
                <FaChevronDown size={12} />
            </span>

            {open && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40
                    bg-white rounded-xl shadow-lg z-50 border border-gray-200">
                    {options.map(opt => (
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

/* ================= MAIN VIDEO PAGE ================= */
const VideoPage = () => {
    const [videos, setVideos] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);

    /* ===== FILTER STATE ===== */
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterVisible, setFilterVisible] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const statusRef = useRef(null);
    const visibleRef = useRef(null);

    const [openView, setOpenView] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const [openEdit, setOpenEdit] = useState(false);
    const [editVideo, setEditVideo] = useState(null);

    const [openDelete, setOpenDelete] = useState(false);
    const [deleteVideo, setDeleteVideo] = useState(null);

    
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await getAllVideosApi();
                setVideos(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchVideos();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                (statusRef.current && !statusRef.current.contains(e.target)) &&
                (visibleRef.current && !visibleRef.current.contains(e.target))
            ) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const STATUS_LABEL = {
        published: "Đã xuất bản",
        draft: "Bản nháp",
    };

    const filteredVideos = videos
        .filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
        .filter(v => filterStatus ? v.status === filterStatus : true)
        .filter(v => filterVisible !== null ? v.visible === filterVisible : true);

    const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

    const currentData = filteredVideos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterStatus, filterVisible]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [filteredVideos.length, totalPages, currentPage]);

    const glassGlow = `
        backdrop-blur-md
        bg-white/30
        rounded-2xl
        border border-white/30
        shadow-[0_0_20px_rgba(247,223,168,0.35)]
    `;

    const totalVideos = videos.length;
    const publishedCount = videos.filter(v => v.visible).length;

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8">

            {/* HEADER */}
            <PageHeader
                icon={<FaVideo className="text-3xl" />}
                title="Quản lý Video Truyền Thông"
                subtitle="Đăng tải, kiểm soát và hiển thị video"
                right={<HeaderWithAvatar />}
            />

            {/* STATS */}
            <div className="my-8">
                <StatsBoxes
                    items={[
                        { title: "Tổng video", value: totalVideos, icon: <FaVideo /> },
                        { title: "Đang hiển thị", value: publishedCount, icon: <FaClock /> },
                    ]}
                />
            </div>

            {/* FILTER + TABLE */}
            <section className={`${glassGlow} p-6 w-full`}>

                {/* FILTER BAR – STYLE GIỐNG WasteStation */}
                <div className="flex flex-wrap gap-4 mb-6 items-center">

                    {/* Filter Status */}
                    <div className="relative" ref={statusRef}>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
                            className="flex items-center gap-2 px-4 py-2 rounded-md
                            bg-white/30 text-[#4B0503] text-sm
                            backdrop-blur-md border border-white/30 shadow-sm"
                        >
                            {filterStatus ? STATUS_LABEL[filterStatus] : "Lọc theo trạng thái"}
                            <FaChevronDown size={12} />
                        </button>

                        {openDropdown === "status" && (
                            <div className="absolute mt-2 w-48 bg-[#4B0503]/20 backdrop-blur-md
                            rounded-xl border border-white/30 shadow-lg z-50">
                                <div className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                    onClick={() => { setFilterStatus(null); setOpenDropdown(null); }}>
                                    Tất cả
                                </div>
                                <div className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                    onClick={() => { setFilterStatus("published"); setOpenDropdown(null); }}>
                                    Đã xuất bản
                                </div>
                                <div className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                    onClick={() => { setFilterStatus("draft"); setOpenDropdown(null); }}>
                                    Bản nháp
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filter Visible */}
                    <div className="relative" ref={visibleRef}>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === "visible" ? null : "visible")}
                            className="flex items-center gap-2 px-4 py-2 rounded-md
                            bg-white/30 text-[#4B0503] text-sm
                            backdrop-blur-md border border-white/30 shadow-sm"
                        >
                            {filterVisible === null
                                ? "Lọc theo hiển thị"
                                : filterVisible ? "Đang hiển thị" : "Đang ẩn"}
                            <FaChevronDown size={12} />
                        </button>

                        {openDropdown === "visible" && (
                            <div className="absolute mt-2 w-48 bg-[#4B0503]/20 backdrop-blur-md
                            rounded-xl border border-white/30 shadow-lg z-50">
                                <div className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                    onClick={() => { setFilterVisible(null); setOpenDropdown(null); }}>
                                    Tất cả
                                </div>
                                <div className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                    onClick={() => { setFilterVisible(true); setOpenDropdown(null); }}>
                                    Đang hiển thị
                                </div>
                                <div className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                    onClick={() => { setFilterVisible(false); setOpenDropdown(null); }}>
                                    Đang ẩn
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SEARCH */}
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm video..."
                        className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none
                        text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-52"
                    />

                    {/* ADD */}
                    <button
                        onClick={() => setOpenCreate(true)}
                        className="ml-auto flex items-center gap-2 px-6 py-2 rounded-md
    text-white font-medium shadow-lg
    bg-gradient-to-r from-[#B40001] to-[#E29A7D]"
                    >
                        <FaPlus /> Thêm video
                    </button>

                </div>

                {/* TABLE */}
                <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-visible">
                    <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-3">
                        <thead>
                            <tr className="text-[#4B0503]/80 text-center">
                                <th className="py-3 px-4 w-[60px]">STT</th>
                                <th className="py-3 px-4 w-[140px]">Thumbnail</th>
                                <th className="py-3 px-4 text-left">Tiêu đề</th>
                                <th className="py-3 px-4 w-[120px]">Lượt xem</th>
                                <th className="py-3 px-4 w-[160px]">Trạng thái</th>
                                <th className="py-3 px-4 w-[120px]">Hiển thị</th>
                                <th className="py-3 px-4 w-[140px]">Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((video, index) => (
                                <tr
                                    key={video._id}
                                    className="bg-white/20 hover:bg-white/30 transition rounded-xl text-[#4B0503]"
                                >
                                    <td className="py-4 px-4 text-center">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-24 h-16 object-cover rounded-md mx-auto"
                                        />
                                    </td>

                                    <td className="py-4 px-4 text-left">
                                        <p className="font-semibold">{video.title}</p>
                                        <p className="text-xs text-[#4B0503]/60 line-clamp-2">
                                            {video.description}
                                        </p>
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        {(video.views || 0).toLocaleString()}
                                    </td>

                                    {/* STATUS */}
                                    <td className="py-4 px-4 text-center">
                                        <StatusDropdown
                                            status={STATUS_LABEL[video.status]}
                                            rawStatus={video.status}
                                            onChange={async (newLabel) => {
                                                const newStatus =
                                                    newLabel === "Đã xuất bản" ? "published" : "draft";

                                                try {
                                                    const res = await updateVideoStatusApi(video._id, newStatus);

                                                    setVideos(prev =>
                                                        prev.map(v =>
                                                            v._id === video._id ? res.data : v
                                                        )
                                                    );
                                                } catch (err) {
                                                    alert("Cập nhật trạng thái thất bại");
                                                }
                                            }}
                                        />
                                    </td>

                                    {/* VISIBLE */}
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={async () => {
                                                if (video.status === "draft") {
                                                    alert("Không thể hiển thị video khi đang ở trạng thái bản nháp");
                                                    return;
                                                }

                                                try {
                                                    const res = await toggleVideoVisibleApi(video._id);

                                                    setVideos(prev =>
                                                        prev.map(v =>
                                                            v._id === video._id ? res.data : v
                                                        )
                                                    );
                                                } catch (err) {
                                                    alert("Cập nhật hiển thị thất bại");
                                                }
                                            }}
                                        >

                                            {video.status === "draft" ? (
                                                <MdToggleOff className="text-gray-300 text-[46px] cursor-not-allowed" />
                                            ) : video.visible ? (
                                                <MdToggleOn className="text-green-500 text-[46px] cursor-pointer" />
                                            ) : (
                                                <MdToggleOff className="text-gray-400 text-[46px] cursor-pointer" />
                                            )}
                                        </button>
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            <HiOutlinePencil
                                                className="text-green-600 cursor-pointer text-2xl"
                                                onClick={() => {
                                                    setEditVideo(video);
                                                    setOpenEdit(true);
                                                }}
                                            />
                                            <HiOutlineTrash
                                                className="text-red-600 cursor-pointer text-2xl"
                                                title="Xóa"
                                                onClick={() => {
                                                    setDeleteVideo(video);
                                                    setOpenDelete(true);
                                                }}
                                            />
                                            <button
                                                title="Xem video"
                                                className="inline-flex items-center justify-center p-2 rounded-md -mt-1
                                                            bg-white/30 text-[#4B0503] hover:bg-white/40 shadow-sm cursor-pointer"
                                                onClick={() => {
                                                    setSelectedVideo(video);
                                                    setOpenView(true);
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
                 <div className="mt-6">
                    <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                />
                </div>

            </section>
            <CreateVideoModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreated={(newVideo) => {
                    setVideos(prev => [newVideo, ...prev]);
                }}
            />
            <EditVideoModal
                isOpen={openEdit}
                video={editVideo}
                onClose={() => setOpenEdit(false)}
                // Truyền callback chỉ để cập nhật state, KHÔNG gọi lại API
                onSubmit={(updatedVideo) => {
                    setVideos(prev =>
                        prev.map(v => (v._id === updatedVideo._id ? updatedVideo : v))
                    );
                }}
            />

            <ViewVideoModal
                isOpen={openView}
                onClose={() => setOpenView(false)}
                video={selectedVideo}
            />

            <DeleteConfirmModal
                isOpen={openDelete}
                onClose={() => {
                    setOpenDelete(false);
                    setDeleteVideo(null);
                }}
                itemName={deleteVideo?.title}
                itemType="video"
                actionText="Xóa"
                onConfirm={async () => {
                    if (!deleteVideo) return;

                    try {
                        await deleteVideoApi(deleteVideo._id);
                        setVideos(prev =>
                            prev.filter(v => v._id !== deleteVideo._id)
                        );
                    } catch (err) {
                        alert("Xóa video thất bại");
                    }
                }}
            />


        </div>
    );
};

export default VideoPage;