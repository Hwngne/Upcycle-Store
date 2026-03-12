import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaChevronDown,
  FaCalendarAlt,
  FaBullhorn,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import StatsBoxes from "@/components/StatsBoxes";
import Pagination from "@/components/Pagination";
import CalendarView from "@/components/CalendarView";
import GanttTimeline from "@/components/GanttTimeline";
import PromotionConfirmModal from "@/components/PromotionConfirmModal";
import BannerLimitWarningModal from "@/components/BannerLimitWarningModal";
import { getPromotions, updatePromotionStatus } from "@/services/eventrequest.service";

// ================= DATE UTILS =================

const parseDateFromVN = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;

  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (!day || !month || !year) return null;

    return new Date(year, month - 1, day);
  }

  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
};

const formatDateVN = (dateStr) => {
  const d = parseDateFromVN(dateStr);
  if (!d) return "Chưa xác định";

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* ================= STATUS MAPPING ================= */
const statusMap = {
  pending: "Chờ duyệt",
  active: "Đã duyệt",
  approved: "Đang chạy",
  rejected: "Từ chối",
  none: "Không đăng ký",
};

const options = ["Duyệt", "Từ chối"];

const reverseStatusMap = {
  "Chấp nhận": "active",
  "Từ chối": "rejected",
};

/* ================= STATUS DROPDOWN ================= */
const StatusDropdown = ({ status, onSelect, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const gradients = {
    "Chờ duyệt": "linear-gradient(90deg, #F7DFA8 0%, #D12B1E 100%)",
    "Đã duyệt": "linear-gradient(90deg, #D12B1E 0%, #E5CFB5 100%)",
    "Đang chạy": "linear-gradient(90deg, #065F46 0%, #16A34A 100%)",
    "Từ chối": "linear-gradient(90deg, #5B0704 0%, #D12B1E 100%)",
  };

  const options = ["Chấp nhận", "Từ chối"];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative text-center" ref={ref}>
      <span
        onClick={() => !disabled && setOpen(!open)}
        className={`inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md select-none ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        style={{ background: gradients[status] || gradients["Từ chối"] }}
      >
        {status}
        {!disabled && <FaChevronDown className="ml-2" size={12} />}
      </span>

      {open && !disabled && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white rounded-xl shadow-lg z-50 overflow-hidden border border-gray-200">
          {options.map((opt) => (
            <div
              key={opt}
              className="px-4 py-2 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503]"
              onClick={() => {
                onSelect(opt);
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
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm cursor-pointer"
      >
        {value || label} <FaChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute mt-2 w-56 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50 overflow-hidden">
          <ul className="text-[#4B0503]">
            <li
              className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
              onClick={() => {
                setValue(null);
                setOpen(false);
              }}
            >
              {allLabel}
            </li>
            {options.map((opt) => (
              <li
                key={opt}
                className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                onClick={() => {
                  setValue(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ================= MAIN PAGE ================= */
const EventPromotePage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterClub, setFilterClub] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [viewTab, setViewTab] = useState("table");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [limitWarningOpen, setLimitWarningOpen] = useState(false);
  const [warningInfo, setWarningInfo] = useState({ position: "", count: 0, date: "" });

  const clubOptions = [...new Set(eventsData.map((e) => e.club))];
  const statusOptions = [
    "Chờ duyệt",
    "Đã duyệt",
    "Đang chạy",
    "Từ chối",
  ];

  const glassGlow = `
    backdrop-blur-md bg-white/30 rounded-2xl border border-white/30
    shadow-[0_0_20px_rgba(247,223,168,0.35)]
  `;

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const filter = searchParams.get("filterStatus");
    if (filter === "Chờ duyệt") {
      setActiveTab("pending");
      setFilterStatus("Chờ duyệt");
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const res = await getPromotions();

        const mapped = res.data
  .filter(
    (p) =>
      p.status === "approved" &&
      p.promotionStatus &&
      p.promotionStatus !== "none"
  )
  .map((p) => {
            const locations = p.promotionLocations || [];

            return {
              id: p._id,
              name: p.name,
              club: p.createdBy?.club_info?.club_name || "Không rõ",
              promotionStartDate: formatDateVN(p.promotionStartDate),
              promotionEndDate: formatDateVN(p.promotionEndDate),
              forum: locations.includes("forum"),
              homepage: locations.includes("home"),
              rawPromotionStatus: p.promotionStatus,
              promotionStatusLabel: statusMap[p.promotionStatus],
              eventStatus: p.status,
            };
          });

        setEventsData(mapped);
      } catch (err) {
        console.error("Lỗi tải danh sách quảng bá:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const handleSelectStatus = (eventId, newStatusLabel) => {
    const event = eventsData.find((e) => e.id === eventId);
    if (!event) return;

    if (event.promotionStatusLabel === "Từ chối") return;

    setSelectedEvent(event);
    setSelectedStatus(newStatusLabel);
    setModalOpen(true);
  };

  const confirmChangeStatus = async () => {
    if (!selectedEvent || !selectedStatus) return;

    if (selectedStatus === "Chấp nhận") {
      const targetDateStr = selectedEvent.promotionStartDate;
      if (!targetDateStr || targetDateStr === "—") {
        alert("Sự kiện chưa có ngày quảng bá hợp lệ.");
        setModalOpen(false);
        return;
      }

      const targetDate = parseDateFromVN(targetDateStr);
      if (!targetDate) {
        alert("Ngày quảng bá không hợp lệ.");
        setModalOpen(false);
        return;
      }
      const homeCount = eventsData.filter((e) => {
        if (e.rawPromotionStatus !== "active" && e.rawPromotionStatus !== "approved") return false;
        if (!e.homepage) return false;

        const startStr = e.promotionStartDate;
        const endStr = e.promotionEndDate;
        if (!startStr || !endStr) return false;

        const eventStart = parseDateFromVN(startStr);
        const eventEnd = parseDateFromVN(endStr);

        if (!eventStart || !eventEnd) return false;

        return targetDate >= eventStart && targetDate <= eventEnd;
      }).length;

      const forumCount = eventsData.filter((e) => {
        if (e.rawPromotionStatus !== "active" && e.rawPromotionStatus !== "approved") return false;
        if (!e.forum) return false;

        const startStr = e.promotionStartDate;
        const endStr = e.promotionEndDate;
        if (!startStr || !endStr) return false;

        const eventStart = parseDateFromVN(startStr);
        const eventEnd = parseDateFromVN(endStr);

        if (!eventStart || !eventEnd) return false;

        return targetDate >= eventStart && targetDate <= eventEnd;
      }).length;

      const homeLimitReached = selectedEvent.homepage && homeCount >= 3;
      const forumLimitReached = selectedEvent.forum && forumCount >= 3;

      if (homeLimitReached || forumLimitReached) {
        const pos = homeLimitReached ? "home" : "forum";
        const count = homeLimitReached ? homeCount : forumCount;
        setWarningInfo({ position: pos, count, date: targetDateStr });
        setLimitWarningOpen(true);
        setModalOpen(false);
        return;
      }
    }

    const newBackendStatus = reverseStatusMap[selectedStatus];
    if (!newBackendStatus) return;

    try {
      const res = await updatePromotionStatus(selectedEvent.id, newBackendStatus);
      const backendStatus = res.data.promotionStatus;

      setEventsData((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? {
                ...e,
                rawPromotionStatus: backendStatus,
                promotionStatusLabel: statusMap[backendStatus],
              }
            : e
        )
      );

      if (selectedStatus === "Chấp nhận") {
        toast.success("Đã chấp nhận quảng bá");
      } else if (selectedStatus === "Từ chối") {
        toast.success("Đã từ chối quảng bá");
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái quảng bá:", err);
      toast.error(err.response?.data?.message || "Không thể cập nhật trạng thái quảng bá. Vui lòng thử lại.");
    } finally {
      setModalOpen(false);
      setSelectedEvent(null);
      setSelectedStatus(null);
    }
  };

  // Tính toán stats 
  const pendingPromotions = eventsData.filter(
    (e) => e.rawPromotionStatus === "pending"
  );

  const acceptedPromotions = eventsData.filter((e) =>
    ["active", "approved"].includes(e.rawPromotionStatus)
  );

  const calendarEvents = acceptedPromotions
    .filter(
      (e) => e.promotionStartDate !== "—" && e.promotionEndDate !== "—"
    )
    .map((e) => {
      return {
        ...e,
        title: e.name,
        start: parseDateFromVN(e.promotionStartDate),
        end: parseDateFromVN(e.promotionEndDate),
      };
    });

  const statsItems = (() => {
    if (activeTab === "pending") {
      return [
        { title: "Tổng yêu cầu", value: eventsData.length, icon: <FaCalendarAlt /> },
        //{ title: "Tổng yêu cầu", value: pendingPromotions.length, icon: <FaCalendarAlt /> },
        {
          title: "Chờ duyệt",
          value: eventsData.filter((e) => e.rawPromotionStatus === "pending").length,
          icon: <FaExclamationTriangle />,
        },
        {
          title: "Từ chối",
          value: eventsData.filter((e) => e.rawPromotionStatus === "rejected").length,
          icon: <FaBullhorn />,
        },
      ];
    }

    return [
      { title: "Đã chấp nhận", value: acceptedPromotions.length, icon: <FaCheckCircle /> },
      {
        title: "Hiển thị Forum",
        value: acceptedPromotions.filter((e) => e.forum).length,
        icon: <FaBullhorn />,
      },
      {
        title: "Hiển thị Trang chủ",
        value: acceptedPromotions.filter((e) => e.homepage).length,
        icon: <FaCalendarAlt />,
      },
    ];
  })();

  const dataToShow = activeTab === "pending"
    ? eventsData
    : acceptedPromotions;

  //const dataToShow = activeTab === "pending" ? pendingPromotions : acceptedPromotions;

  const filteredData = dataToShow
    .filter(
      (e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.club.toLowerCase().includes(search.toLowerCase())
    )
    .filter((e) => (filterClub ? e.club === filterClub : true))
    .filter((e) =>
      activeTab === "pending" && filterStatus
        ? statusMap[e.rawPromotionStatus] === filterStatus
        : true
    );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterClub, filterStatus, activeTab]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
  }
  return (
    <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0]">
      {/* HEADER */}
      <div className="relative z-50 mb-6">
        <PageHeader
          icon={<FaBullhorn />}
          title="Duyệt đăng ký Quảng bá sự kiện"
          subtitle="Quản lý và duyệt các yêu cầu quảng bá sự kiện từ câu lạc bộ"
          right={<HeaderWithAvatar />}
        />
      </div>

      <div className="mb-8 w-full">
        <StatsBoxes items={statsItems} />
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-6 border-b border-white/20">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-8 py-3 font-semibold text-base transition-all rounded-t-xl relative overflow-hidden ${
            activeTab === "pending"
              ? "bg-white/85 text-[#4B0503] shadow-md"
              : "bg-white/30 text-[#4B0503]/70 hover:bg-white/50"
          }`}
        >
          Đăng ký quảng bá
          {activeTab === "pending" && (
            <span
              className="absolute bottom-0 left-0 w-full h-1.5"
              style={{ background: "linear-gradient(to right, #F7DFA8, #D12B1E, #B40001)" }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={`px-8 py-3 font-semibold text-base transition-all rounded-t-xl relative overflow-hidden ${
            activeTab === "approved"
              ? "bg-white/85 text-[#4B0503] shadow-md"
              : "bg-white/30 text-[#4B0503]/70 hover:bg-white/50"
          }`}
        >
          Đã chấp nhận
          {activeTab === "approved" && (
            <span
              className="absolute bottom-0 left-0 w-full h-1.5"
              style={{ background: "linear-gradient(to right, #5B0704, #A71D0D, #D12B1E)" }}
            />
          )}
        </button>
      </div>

      {/* VIEW SWITCH chỉ cho tab approved */}
      {activeTab === "approved" && (
        <div className="flex gap-3 mb-6">
          {["table", "calendar", "timeline"].map((v) => (
            <button
              key={v}
              onClick={() => setViewTab(v)}
              className={`px-6 py-2 rounded-lg font-semibold ${
                viewTab === v ? "bg-white text-[#4B0503]" : "bg-white/30 text-[#4B0503]/70"
              }`}
            >
              {v === "table" ? "Danh sách" : v === "calendar" ? "Lịch" : "Timeline"}
            </button>
          ))}
        </div>
      )}

      {/* MAIN CONTENT */}
      <section className={`${glassGlow} p-6 w-full`}>
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {activeTab === "pending" && (
              <FilterDropdown
                label="Lọc theo Trạng thái"
                value={filterStatus}
                setValue={setFilterStatus}
                options={statusOptions}
                allLabel="Tất cả trạng thái"
              />
            )}

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sự kiện hoặc câu lạc bộ..."
              className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-72"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-visible">
          {activeTab === "approved" && viewTab === "calendar" && (
            <CalendarView events={calendarEvents} />
          )}

          {activeTab === "approved" && viewTab === "timeline" && (
            <GanttTimeline events={calendarEvents} />
          )}

          {(viewTab === "table" || activeTab === "pending") && (
            <>
              {currentData.length === 0 ? (
                <div className="text-center py-16 text-[#4B0503]/70 text-xl font-medium flex flex-col items-center gap-4">
                  <FaBullhorn size={48} className="text-[#D12B1E]/40" />
                  Không có đăng ký quảng bá nào
                </div>
              ) : (
                <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-2">
                  <thead>
                    <tr className="text-[#4B0503]/80 text-center">
                      <th className="px-4 py-3 text-center w-[60px]">STT</th>
                      <th className="px-4 py-3 text-left w-[200px]">Tên sự kiện</th>
                      <th className="px-4 py-3 text-center w-[180px]">Câu lạc bộ</th>
                      <th className="px-4 py-3 text-center w-[140px]">Bắt đầu quảng bá</th>
                      <th className="px-4 py-3 text-center w-[140px]">Kết thúc quảng bá</th>
                      <th className="px-4 py-3 text-center w-[120px]">Diễn đàn</th>
                      <th className="px-4 py-3 text-center w-[120px]">Trang chủ</th>
                      <th className="px-4 py-3 text-center w-[180px]">
                        {activeTab === "approved" ? "Thời gian banner" : "Trạng thái"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((event, index) => (
                      <tr
                        key={event.id}
                        className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]"
                      >
                        <td className="px-4 py-3 text-center font-medium">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-left break-words">{event.name}</td>
                        <td className="px-4 py-3 text-center">{event.club}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-white border border-[#D12B1E]/30">
                            <FaCalendarAlt size={11} className="text-[#A71D0D]" />
                            {event.promotionStartDate}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-white border border-[#D12B1E]/20">
                            <FaCalendarAlt size={11} className="text-[#D12B1E]" />
                            {event.promotionEndDate}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {event.forum ? (
                            <span title="Hiển thị Diễn đàn" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 border border-red-200">
                              <FaBullhorn className="text-[#A71D0D]" size={14} />
                            </span>
                          ) : (
                            <span className="text-[#4B0503]/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {event.homepage ? (
                            <span title="Hiển thị Trang chủ" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 border border-red-200">
                              <FaCalendarAlt className="text-[#D12B1E]" size={14} />
                            </span>
                          ) : (
                            <span className="text-[#4B0503]/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {activeTab === "approved" ? (
                            <div
                              className="inline-flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-[#D12B1E]/20 shadow-sm min-w-[120px]"
                            >
                              <div
                                className="text-lg font-bold bg-clip-text text-transparent"
                                style={{ backgroundImage: "linear-gradient(90deg, #5B0704, #A71D0D, #D12B1E)" }}
                              >
                                {(() => {
                                  const start = parseDateFromVN(event.promotionStartDate);
                                  const end = parseDateFromVN(event.promotionEndDate);

                                  if (!start || !end) return "—";

                                  return Math.ceil((end - start) / 86400000) + 1;
                                })()} ngày
                              </div>
                              <div className="text-[11px] mt-1 text-[#4B0503]/60 whitespace-nowrap">
                                {event.promotionStartDate} – {event.promotionEndDate}
                              </div>
                            </div>
                          ) : (
                            <StatusDropdown
                              status={event.promotionStatusLabel}
                              onSelect={(newStatus) => handleSelectStatus(event.id, newStatus)}
                              disabled={event.rawPromotionStatus !== "pending"}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </section>

      {/* MODAL XÁC NHẬN DUYỆT */}
      <PromotionConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmChangeStatus}
        statusLabel={selectedStatus}
        eventName={selectedEvent?.name || "sự kiện này"}
      />

      {/* MODAL CẢNH BÁO GIỚI HẠN BANNER */}
      <BannerLimitWarningModal
        isOpen={limitWarningOpen}
        onClose={() => setLimitWarningOpen(false)}
        position={warningInfo.position}
        count={warningInfo.count}
        date={warningInfo.date}
      />
    </div>
  );
};

export default EventPromotePage;