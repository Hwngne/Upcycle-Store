import React, { useState, useRef, useEffect } from "react";
import {
  FaChevronDown,
  FaCalendarCheck,
  FaGift,
  FaMoneyBillWave,
  FaEye,
  FaCalendarAlt,
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import Pagination from "@/components/Pagination";
import StatsBoxes from "@/components/StatsBoxes";
import ViewEventModal from "@/components/ViewEventModal";
import { getEventRequests, updateEventStatus } from "@/services/eventrequest.service";
import { toast } from "sonner";

const EventReviewPage = () => {
  const [data, setData] = useState([]);
  const formatDate = (date) => {
    if (!date) return "Chưa xác định";
    const d = new Date(date);
    return isNaN(d)
      ? "Chưa xác định"
      : d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const filter = searchParams.get("filterStatus");
    if (filter && ["Chờ duyệt", "Chấp nhận", "Từ chối"].includes(filter)) {
      setFilterStatus(filter);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const mapEventRequestToUI = (item) => {
    const norm = item._normalized || {};

    const price =
      typeof norm.price === "number" && norm.price > 0 ? norm.price : 0;

    const isPaid = Boolean(norm.isPaid && price > 0);

    const priceText = !isPaid
      ? "Miễn phí"
      : `${price.toLocaleString("vi-VN")} VNĐ`;

    return {
      id: item._id,
      name: item.name,
      topic: item.topic,

      club:
        item.createdBy?.club_info?.club_name ||
        item.createdBy?.name ||
        item.createdBy?.email?.split("@")[0] ||
        "CLB không xác định",

      description: item.description,

      price: priceText,
      isPaid,

      location: item.location,

      date: formatDate(norm.date),
      rawDate: norm.date || null,

      status:
        item.status === "approved"
          ? "Chấp nhận"
          : item.status === "rejected"
          ? "Từ chối"
          : "Chờ duyệt",

      contactName: item.contactName,
      contactEmail: item.contactEmail,
      contactPhone: item.contactPhone,
      formLink: item.formLink,

      imageUrl: item.bannerUrl || "",
    };
  };


  
  const [filterClub, setFilterClub] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [search, setSearch] = useState("");

  // Dropdown control
  const [openDropdown, setOpenDropdown] = useState(null);
  const clubRef = useRef(null);
  const statusRef = useRef(null);

  // Inline edit status
  const [editingStatusId, setEditingStatusId] = useState(null);

  // Pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const clubOptions = [...new Set(data.map((e) => e.club))];
  const statusOptions = ["Chấp nhận", "Từ chối"];

  const filteredData = data
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    .filter((e) => (filterClub ? e.club === filterClub : true))
    .filter((e) => (filterStatus ? e.status === filterStatus : true));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApprove = async (eventId) => {
    try {
      await updateEventStatus(eventId, "approved");
      toast.success("Đã duyệt sự kiện");
      fetchEvents();
    } catch (err) {
      toast.error("Duyệt sự kiện thất bại");
    }
  };

  const handleReject = async (eventId) => {
    try {
      await updateEventStatus(eventId, "rejected");
      toast.success("Đã từ chối sự kiện");
    } catch (err) {
      toast.error("Từ chối sự kiện thất bại");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        statusRef.current &&
        !statusRef.current.contains(e.target)
      ) {
        setOpenDropdown(null);
        setEditingStatusId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const fetchEvents = async () => {
  try {
    const res = await getEventRequests();
    let list = Array.isArray(res.data) ? res.data : [];
    const eventOnly = list.map(mapEventRequestToUI);
    setData(eventOnly);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách sự kiện", err);
  }
};

useEffect(() => {
  fetchEvents();
}, []);


  const glassGlow = `
    backdrop-blur-md
    bg-white/30
    rounded-2xl
    border border-white/30
    shadow-[0_0_20px_rgba(247,223,168,0.35)]
  `;

  const uiStatusToApi = (uiStatus) => {
    if (uiStatus === "Chấp nhận") return "approved";
    if (uiStatus === "Từ chối") return "rejected";
    return "pending";
  };

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
          title="Duyệt Nội dung Sự kiện"
          subtitle="Quản lý và duyệt các sự kiện được gửi lên hệ thống"
          right={<HeaderWithAvatar />}
        />
      </div>

      {/* STATISTICS */}
      <div className="mb-8 w-full">
        <StatsBoxes
          items={[
            { title: "Tổng sự kiện", value: data.length, icon: <FaCalendarCheck /> },
            { title: "Sự kiện miễn phí", value: data.filter((e) => !e.isPaid).length },
            { title: "Sự kiện có phí", value: data.filter((e) => e.isPaid).length }
          ]}
        />
      </div>

      {/* FILTER + SEARCH */}
      <section className={`${glassGlow} p-6 w-full`}>
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          {/* STATUS FILTER */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm"
            >
              {filterStatus || "Lọc theo Trạng thái"} <FaChevronDown size={12} />
            </button>
            {openDropdown === "status" && (
              <div className="absolute mt-2 w-40 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg overflow-hidden z-50">
                <ul className="text-[#4B0503]">
                  <li
                    className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                    onClick={() => {
                      setFilterStatus(null);
                      setOpenDropdown(null);
                    }}
                  >
                    Tất cả
                  </li>
                  {statusOptions.map((status) => (
                    <li
                      key={status}
                      className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                      onClick={() => {
                        setFilterStatus(status);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                    >
                      {status}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm sự kiện..."
            className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-56"
          />
        </div>

        {/* TABLE */}
        <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4">
          <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-2">
            <thead>
              <tr className="text-[#4B0503]/80 text-center">
                <th className="py-2 px-3 w-[50px]">STT</th>
                <th className="py-2 px-3 w-[200px]">Tên sự kiện</th>
                <th className="py-2 px-3 w-[150px]">Chủ đề</th>
                <th className="py-2 px-3 w-[150px]">Câu lạc bộ</th>
                <th className="py-2 px-3 w-[150px]">Giá vé (VNĐ)</th>
                <th className="py-2 px-3 w-[140px]">Địa điểm</th>
                <th className="py-2 px-3 w-[160px]">Ngày tổ chức</th>
                <th className="py-2 px-3 w-[200px]">Trạng thái</th>
                <th className="py-2 px-3 w-[80px]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((event, index) => {
                const isLocked = event.status !== "Chờ duyệt";
                return (
                  <tr
                  key={event.id}
                  className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]"
                >
                  <td className="py-2 px-3 text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold max-w-[210px]">
                    <div
                      className="truncate"
                      title={event.name}
                    >
                      {event.name}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">{event.topic}</td>
                  <td className="py-2 px-3 text-center font-semibold">{event.club}</td>
                  <td className="py-2 px-3 text-center">
                    {event.price === "Miễn phí" ? (
                      <span
                        className="
                          inline-flex items-center
                          px-3 py-1
                          rounded-md
                          text-xs font-semibold
                          bg-[#F7DFA8]/45
                          text-[#6B3A0A]
                          border border-[#F7DFA8]/70
                          shadow-sm
                        "
                      >
                        Miễn phí
                      </span>
                    ) : (
                      <span className="text-sm text-[#4B0503]/70 whitespace-nowrap">
                        {event.price}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">{event.location}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="
                        inline-flex items-center gap-2
                        px-3 py-1
                        rounded-md
                        text-xs font-medium
                        bg-white
                        border border-[#D12B1E]/20
                      "
                    >
                      <FaCalendarAlt size={11} className="text-[#D12B1E]" />
                      {event.date}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center relative">
                                        <span
                      onClick={() => {
                        if (isLocked) return;
                        setEditingStatusId(
                          editingStatusId === event.id ? null : event.id
                        );
                      }}
                      className={`inline-flex items-center justify-center px-4 py-1
                        text-[13px] font-semibold text-white rounded-md select-none
                        ${isLocked ? "cursor-default" : "cursor-pointer"}
                      `}
                      style={{
                        background:
                          event.status === "Chấp nhận"
                            ? gradients.primary
                            : event.status === "Từ chối"
                            ? gradients.secondary
                            : gradients.accent,
                      }}
                    >
                      {event.status}
                      {!isLocked && <FaChevronDown className="ml-2" size={12} />}
                    </span>

                    {editingStatusId === event.id && (
                      <div className="absolute left-[50%] -translate-x-[50%] mt-2 w-36 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                        {statusOptions.map((option) => (
                          <div
                            key={option}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="px-4 py-2 hover:bg-[#F7DFA8]/40 cursor-pointer text-[#4B0503]"
                            onClick={async () => {
                            const apiStatus = uiStatusToApi(option);

                            if (option === event.status) {
                              setEditingStatusId(null);
                              return;
                            }

                            setEditingStatusId(null);

                            try {
                              await updateEventStatus(event.id, apiStatus);
                              toast.success("Đã cập nhật trạng thái");
                              fetchEvents();
                            } catch (err) {
                              toast.error(
                                err.response?.data?.message || "Cập nhật thất bại"
                              );
                            }
                          }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      className="inline-flex items-center cursor-pointer justify-center p-2 rounded-md bg-white/30 text-[#4B0503] hover:bg-white/40 shadow-sm"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsModalOpen(true);
                      }}
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
                )
              }

                
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
            <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* PAGINATION */}
        
      </section>

      <ViewEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};

export default EventReviewPage;