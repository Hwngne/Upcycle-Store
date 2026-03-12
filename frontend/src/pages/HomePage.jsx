// src/pages/admin/Homepage.jsx
import React, { useState, useEffect} from "react";
import { motion } from "framer-motion";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import StatsBoxes from "@/components/StatsBoxes";
import GaugeProgress from "@/components/GaugeProgress";
import AccountRoleStats from "@/components/AccountRoleStats";
import StatBoxDashboard from "@/components/StatBoxDashboard";
import {
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  BookOpen,
  Award,
  Gift,
  Trophy,
  Calendar,
  Megaphone,
  Smile,        
  ShieldCheck, 
} from "lucide-react";
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import { getChartDataApi, getLeaderboardApi } from "@/services/account.service";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";
import EventRequestChart from "@/components/EventRequestChart";
import { getActivityHistoriesApi } from "@/services/activityHistory.service";
import { getEventStats , getUpcomingApprovedEventApi} from "@/services/eventrequest.service";
import { getUrgentOverviewApi, getAccountOverviewApi, getAccountPieStatsApi } from "@/services/admin.service";
import { useNavigate } from "react-router";

const glassGlowClass = `
  backdrop-blur-md
  rounded-2xl
  shadow-[0_0_20px_rgba(247,223,168,0.45),0_0_40px_rgba(247,223,168,0.25)]
  hover:shadow-[0_0_40px_rgba(247,223,168,0.75),0_0_80px_rgba(247,223,168,0.45)]
  transition-all duration-300
`;

// Helper functions
const ACTION_LABEL = {
  ACCOUNT_UPDATE: "đã cập nhật",
  ACCOUNT_CREATE: "đã tạo",
  ACCOUNT_DELETE: "đã xóa",
  ACCOUNT_LOCK: "đã khóa",
  ACCOUNT_UNLOCK: "đã mở khóa",
  PROFILE_UPDATE: "đã cập nhật hồ sơ",
  GIFT_HIDE: "đã ẩn",
  GIFT_SHOW: "đã hiển thị",
  GIFT_UPDATE: "đã cập nhật",
  GIFT_CREATE: "đã tạo quà",
  GIFT_DELETE: "đã xóa",
  GIFT_EXCHANGE: "đã phát",
  REWARD_COMPLETED: "đã phát quà",
  REWARD_CANCELLED: "đã hủy yêu cầu đổi quà",
  REWARD_EXPIRED: "đã đánh dấu quá hạn",
};

const getDisplayName = (user) => {
  if (!user) return "Ẩn danh";
  switch (user.role) {
    case "student":
      return user.student_name || "Sinh viên";
    case "admin":
      return user.admin_name || "Admin";
    case "club":
      return user.club_info?.club_name || "Câu lạc bộ";
    default:
      return user.name || user.email || "Người dùng";
  }
};

const getAvatarUrl = (user) => {
  return user?.avatar || "";
};


const formatDateVN = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return "Không xác định";

  // Nếu format dạng dd/mm/yyyy
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return dateStr;

    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];

    return `${day}/${month}/${year}`;
  }

  if (dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  return dateStr;
};
const Homepage = () => {
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const statsItems = [
    { icon: <Users className="text-3xl" />, title: "Tổng tài khoản", value: "1,248" },
    { icon: <BookOpen className="text-3xl" />, title: "Sinh viên", value: "987" },
    { icon: <Award className="text-3xl" />, title: "Điểm đã trao", value: "45,320" },
    { icon: <Gift className="text-3xl" />, title: "Quà chờ duyệt", value: "18" },
  ];

  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(activityLogs.length / itemsPerPage);
  const paginatedLogs = activityLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [topUsers, setTopUsers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  const [urgentData, setUrgentData] = useState(null);
  const [urgentLoading, setUrgentLoading] = useState(true);

  const [accountOverview, setAccountOverview] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);

  const [accountPieStats, setAccountPieStats] = useState(null);
  const [pieLoading, setPieLoading] = useState(true);
  
  // ===== Event Stats =====
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [eventData, setEventData] = useState([]);
  const [eventLoading, setEventLoading] = useState(true);
  
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  const navigate = useNavigate();
  
  const active = accountPieStats?.statusStats?.active || 0;
  const locked = accountPieStats?.statusStats?.locked || 0;
  const totalAccounts = active + locked;

  const activePercent =
    totalAccounts > 0
      ? Math.round((active / totalAccounts) * 100)
      : 0;
    const studentPercent =
      accountOverview && accountOverview.totalAccounts > 0
        ? Math.round(
            (accountOverview.totalStudents / accountOverview.totalAccounts) * 100
          )
        : 0;

  const fetchLeaderboard = async () => {
    try {
      const res = await getLeaderboardApi();
      setTopUsers(res.data || []);
    } catch (error) {
      toast.error("Không tải được bảng xếp hạng");
    }
  };

  const fetchActivityHistories = async () => {
    try {
      setActivityLoading(true);
      const res = await getActivityHistoriesApi();
      setActivityLogs(res.data || []);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Không tải được lịch sử hoạt động");
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const res = await getChartDataApi(30, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      // Format ngày tháng tiếng Việt ngay từ đây
      const formattedData = (res.data || []).map(item => ({
        ...item,
        date: formatDateVN(item.date)
      }));
      setChartData(formattedData);
    } catch (error) {
      toast.error("Không tải được dữ liệu biểu đồ");
    } finally {
      setChartLoading(false);
    }
  };

  const fetchUrgentOverview = async () =>{
    try {
      setUrgentLoading(true);
      const res = await getUrgentOverviewApi();
      setUrgentData(res.data);
    } catch (error) {
      toast.error("Không tải được dữ liệu cần xử lý");
    }finally{
      setUrgentLoading(false);
    }
  };

  const fetchAccountOverview = async () => {
    try {
      setAccountLoading(true);
      const res = await getAccountOverviewApi();
      setAccountOverview(res.data);
    } catch (error) {
      toast.error("Không tải được thống kê tài khoản");
    } finally {
      setAccountLoading(false);
    }
  };

  const fetchAccountPieStats = async () => {
    try {
      setPieLoading(true);
      const res = await getAccountPieStatsApi();
      setAccountPieStats(res.data);
    } catch (error) {
      toast.error("Không tải được dữ liệu tỷ lệ role");
    } finally {
      setPieLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      setUpcomingLoading(true);
      const res = await getUpcomingApprovedEventApi();
      setUpcomingEvents(res.data || []);
    } catch (error) {
      toast.error("Không tải được sự kiện sắp diễn ra");
    } finally {
      setUpcomingLoading(false);
    }
  };

  const fetchEventStats = async (month, year) => {
    try {
      setEventLoading(true);

      const res = await getEventStats(month, year);

      // API trả về { month, year, data }
      setEventData(res.data?.data || []);


    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thống kê sự kiện");
    } finally {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    fetchEventStats(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  

  useEffect(() => {
    const init = async () => {
      setLeaderboardLoading(true);
      await Promise.all([
        fetchLeaderboard(),
        fetchActivityHistories(),
        fetchChartData(),
        fetchUrgentOverview(),
        fetchAccountOverview(),
        fetchAccountPieStats(),
        fetchUpcomingEvents(),
      ]);
      setLeaderboardLoading(false);
    };
    init();
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-[#fff0] overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl z-0 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-[#F7DFA8]/30 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 left-1/4 w-[520px] h-[520px] bg-[#F7DFA8]/20 rounded-full blur-3xl z-0" />

      {/* Nội dung chính */}
      <div className="relative z-10 p-6 md:p-8 lg:p-10">
        {/* Header + StatsBoxes */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${glassGlowClass} p-8 mb-10`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#4B0503]">Trang chủ</h1>
              <p className="text-[#4B0503]/70 mt-1">Tổng quan hệ thống VanLang Green</p>
            </div>
            <HeaderWithAvatar />
          </div>

          <StatBoxDashboard />
          {accountLoading || pieLoading ? (
            <div className="text-center py-8 text-[#4B0503]/70 animate-pulse">
              Đang tải thống kê tài khoản...
            </div>
          ) : accountPieStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">             
              <GaugeProgress
                title="Tài khoản hoạt động"
                subtitle="Active vs Locked"
                value={activePercent}
                unit="%"
                icon={AlertCircle}
                roleStats={accountPieStats?.roleStatsActive}
              />
              <AccountRoleStats overview={accountPieStats} />
            </div>
          ) : null}
        </motion.section>

        {/* Grid chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biểu đồ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${glassGlowClass} p-6 md:p-8`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#4B0503] flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-[#BE0000]" />
                  Thống kê 30 ngày gần nhất
                </h2>
                <span className="text-sm text-[#4B0503]/70">Cập nhật: {new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yêu cầu đổi quà */}
                <div className={`${glassGlowClass} p-6`}>
                  <h3 className="font-semibold mb-4 text-[#D12B1E]">
                    Yêu cầu đổi quà
                  </h3>
                  <div className="h-72">
                    {chartLoading ? (
                      <div className="flex items-center justify-center h-full">
                        Đang tải...
                      </div>
                    ) : chartData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-[#4B0503]/60">
                        Chưa có dữ liệu
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient
                              id="rewardGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop offset="0%" stopColor="#F7DFA8" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#D12B1E" stopOpacity={0.2} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="rewardsRequested"
                            name="Yêu cầu đổi quà"
                            stroke="#d84b37"
                            strokeWidth={3}
                            fill="url(#rewardGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Bài viết xuất bản */}
                <div className={`${glassGlowClass} p-6`}>
                  <h3 className="font-semibold mb-4 text-[#4B0503]">
                    Bài viết xuất bản
                  </h3>
                  <div className="h-72">
                    {chartLoading ? (
                      <div className="flex items-center justify-center h-full">
                        Đang tải...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="articlesPublished"
                            name="Bài viết đã xuất bản"
                            fill="#BE0000"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Sự kiện yêu cầu tổ chức */}
                <div className="md:col-span-2">
                  <EventRequestChart
                    data={eventData}
                    loading={eventLoading}
                    glassGlowClass={glassGlowClass}
                  />
                </div>
                
              </div>
            </motion.div>
            {/* Hoạt động gần đây */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className={`${glassGlowClass} bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-[#4B0503] flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#BE0000]" />
                  Hoạt động gần đây
                </h2>
                <button className="text-sm font-medium text-[#BE0000] hover:text-[#BE0000]/80 transition-colors underline-offset-4 hover:underline">
                  Xem tất cả
                </button>
              </div>

              <div className="space-y-4">
                {activityLoading && (
                  <p className="text-sm text-[#4B0503]/60">
                    Đang tải hoạt động...
                  </p>
                )}

                {!activityLoading && paginatedLogs.map((log, idx) => (
                  <div
                    key={log._id}
                    className="group flex items-start gap-4 p-5 rounded-xl bg-white/15 hover:bg-white/30 
                              border border-[#F7DFA8]/20 hover:border-[#F7DFA8]/40 
                              transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F7DFA8]/40 flex items-center justify-center 
                                    text-[#4B0503] font-medium text-lg shrink-0 ring-1 ring-[#F7DFA8]/30">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#4B0503] leading-relaxed">
                        <span className="font-semibold">
                          {getDisplayName(log.actor)}
                        </span>{" "}
                        <span className="text-[#BE0000] font-medium">
                          {ACTION_LABEL[log.action] || log.action}
                        </span>{" "}
                        {log.description}
                      </p>
                      <p className="mt-1.5 text-sm text-[#4B0503]/60">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}

                {!activityLoading && activityLogs.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-[#4B0503]/60 italic">
                      Chưa có hoạt động nào
                    </p>
                  </div>
                )}
              </div>

              {!activityLoading && totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Cột phải */}
          <div className="space-y-6">
            {/* Cần xử lý ngay */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className={`${glassGlowClass} p-6 md:p-8`}
            >
              <h2 className="text-xl font-semibold text-[#4B0503] mb-6 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-[#F7DFA8]" />
                Cần xử lý ngay
              </h2>

              {urgentLoading ? (
                <div className="text-center py-8 text-[#4B0503]/60 animate-pulse">
                  Đang tải nhiệm vụ khẩn cấp...
                </div>
              ) : !urgentData || (
                urgentData.lowStockGifts === 0 &&
                urgentData.pendingEventRequestsNearDate === 0 &&
                urgentData.pendingPromotionNearDate === 0
              ) ? (
                <div className="text-center py-10 text-[#4B0503]/50 bg-white/10 rounded-xl border border-white/20">
                  <p className="text-lg font-medium">Không có nhiệm vụ gấp nào</p>
                  <p className="text-sm mt-2 opacity-70">Hệ thống đang ổn định!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* 1. Quà sắp hết – liệt kê từng món */}
                  {urgentData.lowStockGifts > 0 && urgentData.details.gifts.map((gift) => {
                    const isViewed = localStorage.getItem(`viewed_gift_${gift._id}`) === 'true';
                    return (
                      <div
                        key={gift._id}
                        onClick={() => {
                          navigate(`/gifts?filterStock=Sắp hết hàng`);
                          localStorage.setItem(`viewed_gift_${gift._id}`, 'true');
                        }}
                        className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-4
                          ${isViewed 
                            ? 'bg-white/20 border border-white/30 hover:bg-white/30' 
                            : 'bg-red-50/80 border border-red-200/80 hover:bg-red-100/80 shadow-sm'}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-red-100/70 flex items-center justify-center shrink-0">
                          <Gift className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#4B0503]">
                            {gift.name}
                          </p>
                          <p className="text-sm text-[#4B0503]/80">
                            Còn {gift.quantity} cái (≤ 5)
                          </p>
                        </div>
                        {!isViewed && (
                          <span className="text-xs font-medium px-2 py-1 bg-red-500/20 text-red-700 rounded-full">
                            Chưa xem
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* 2. Sự kiện chờ duyệt gần ngày – liệt kê từng sự kiện */}
                  {urgentData.pendingEventRequestsNearDate > 0 && urgentData.details.events.map((event) => {
                    const isViewed = localStorage.getItem(`viewed_event_${event._id}`) === 'true';
                    return (
                      <div
                        key={event._id}
                        onClick={() => {
                          navigate(`/events/review?filterStatus=Chờ duyệt`);
                          localStorage.setItem(`viewed_event_${event._id}`, 'true');
                        }}
                        className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-4
                          ${isViewed 
                            ? 'bg-white/20 border border-white/30 hover:bg-white/30' 
                            : 'bg-amber-50/80 border border-amber-200/80 hover:bg-amber-100/80 shadow-sm'}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-amber-100/70 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#4B0503]">
                            {event.name}
                          </p>
                          <p className="text-sm text-[#4B0503]/80">
                            Ngày: {formatDateVN(event.date)} (cần duyệt gấp)
                          </p>
                        </div>
                        {!isViewed && (
                          <span className="text-xs font-medium px-2 py-1 bg-amber-500/20 text-amber-700 rounded-full">
                            Chưa xử lý
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* 3. Quảng bá chờ duyệt gần ngày – liệt kê từng cái */}
                  {urgentData.pendingPromotionNearDate > 0 && urgentData.details.promotions.map((promo) => {
                    const isViewed = localStorage.getItem(`viewed_promo_${promo._id}`) === 'true';
                    return (
                      <div
                        key={promo._id}
                        onClick={() => {
                          navigate(`/events/promote?filterStatus=Chờ duyệt`);
                          localStorage.setItem(`viewed_promo_${promo._id}`, 'true');
                        }}
                        className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-4
                          ${isViewed 
                            ? 'bg-white/20 border border-white/30 hover:bg-white/30' 
                            : 'bg-rose-50/80 border border-rose-200/80 hover:bg-rose-100/80 shadow-sm'}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-rose-100/70 flex items-center justify-center shrink-0">
                          <Megaphone className="w-5 h-5 text-rose-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#4B0503]">
                            {promo.name}
                          </p>
                          <p className="text-sm text-[#4B0503]/80">
                            Bắt đầu: {formatDateVN(promo.promotionStartDate)}
                          </p>
                        </div>
                        {!isViewed && (
                          <span className="text-xs font-medium px-2 py-1 bg-rose-500/20 text-rose-700 rounded-full">
                            Chưa duyệt
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Tổng quan nhanh */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className={`${glassGlowClass} p-6`}
            >
              <h3 className="text-lg font-semibold text-[#4B0503] mb-4">Tổng quan nhanh</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#BE0000]">124</p>
                  <p className="text-sm text-[#4B0503]/70">Quiz hoàn thành</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#BE0000]">87</p>
                  <p className="text-sm text-[#4B0503]/70">Video đã xem</p>
                </div>
              </div>
            </motion.div>

            {/* Bảng xếp hạng */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className={`${glassGlowClass} p-5 md:p-6`}
            >
              <div className="flex items-center gap-2.5 mb-10">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-bold text-[#4B0503]">
                  Bảng xếp hạng tích lũy
                </h2>
              </div>

              {leaderboardLoading && (
                <p className="text-sm text-[#4B0503]/60 text-center">
                  Đang tải bảng xếp hạng...
                </p>
              )}

              {/* Podium Top 3 */}
              <div className="grid grid-cols-3 gap-3 mb-8 items-end relative">
                {[1, 0, 2].map((originalIndex, displayPos) => {
                  const user = topUsers[originalIndex];
                  if (!user) return null;
                  const rank = originalIndex + 1;
                  const podiumConfig = [
                    { scale: "scale-95", bg: "from-gray-300/40 to-white/20", order: "order-1" },
                    { scale: "scale-110", bg: "from-amber-300/60 to-white/30", order: "order-2 z-10" },
                    { scale: "scale-90", bg: "from-orange-300/40 to-white/20", order: "order-3" },
                  ][displayPos];

                  return (
                    <div
                      key={originalIndex}
                      className={`
                        relative p-4 rounded-2xl text-center
                        bg-gradient-to-b ${podiumConfig.bg}
                        border border-white/40
                        shadow-lg shadow-black/10
                        backdrop-blur-md
                        ${podiumConfig.scale}
                        ${podiumConfig.order}
                        flex flex-col items-center
                        min-h-[180px]
                        transition-all duration-300
                        hover:-translate-y-1 hover:shadow-xl
                      `}
                    >
                      {rank === 1 && <span className="absolute -top-7 text-4xl">👑</span>}
                      {rank === 2 && <span className="absolute -top-4 text-2xl">🥈</span>}
                      {rank === 3 && <span className="absolute -top-4 text-2xl">🥉</span>}

                      <div className="relative w-14 h-14 mb-2">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-red-500 blur-sm opacity-60" />
                        <div className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-white">
                          {getAvatarUrl(user) ? (
                            <img
                              src={getAvatarUrl(user)}
                              alt={getDisplayName(user)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          ) : (
                            <span className="text-[#4B0503] font-bold text-lg">
                              {getDisplayName(user)?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className={`font-semibold ${rank === 1 ? "text-base" : "text-sm"} text-[#4B0503] line-clamp-2`}>
                        {user.name}
                      </p>

                      <p className="text-xs text-[#4B0503]/70 mb-1">
                        {user.role}
                      </p>

                      <p className="text-lg font-bold text-[#BE0000]">
                        {user.totalScore?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-[#4B0503]/60">điểm</p>
                    </div>
                  );
                })}
              </div>

              {/* Top 4–10 */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {topUsers.slice(3).map((user, index) => {
                  const rank = index + 4;
                  const maxPoint = topUsers[0]?.totalScore || 1;
                  const percent = Math.round(((user.totalScore || 0) / maxPoint) * 100);

                  return (
                    <div
                      key={`${user._id}-${rank}`}
                      className="
                        flex items-center gap-3 p-3 rounded-xl
                        bg-white/10 hover:bg-white/25
                        transition-all duration-200
                        border border-white/10
                        hover:scale-[1.01]
                      "
                    >
                      <span className="w-6 text-center text-sm font-bold text-[#4B0503]">
                        #{rank}
                      </span>

                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-amber-300 to-red-400 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          {getAvatarUrl(user) ? (
                            <img
                              src={getAvatarUrl(user)}
                              alt={getDisplayName(user)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-[#4B0503]">
                              {getDisplayName(user)?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-[#4B0503]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#4B0503]/60">{user.role}</p>
                        <div className="mt-1 h-2 rounded-full bg-white/20 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-[#BE0000]">
                          {user.totalScore?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-[#4B0503]/60">điểm</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Sự kiện sắp diễn ra */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: "easeOut" }}
              className={`${glassGlowClass} p-6 md:p-8 rounded-3xl backdrop-blur-lg bg-white/5 border border-white/10`}
            >
              <h2 className="text-xl font-semibold text-[#4B0503] mb-6 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[#F7DFA8] drop-shadow-sm" />
                Sự kiện sắp diễn ra
              </h2>

              <div className="space-y-4">
                {upcomingLoading ? (
                  <div className="text-center py-6 text-[#4B0503]/60">
                    Đang tải sự kiện...
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-center py-6 text-[#4B0503]/50">
                    Không có sự kiện nào sắp diễn ra
                  </div>
                ) : (
                  upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.6, type: "spring", stiffness: 120 }}
                      whileHover={{
                        y: -8,
                        scale: 1.02,
                        transition: { duration: 0.35, ease: "easeOut" }
                      }}
                      className="
                        group
                        relative
                        h-48
                        rounded-3xl
                        overflow-hidden
                        shadow-lg
                        hover:shadow-xl               {/* giữ nguyên mức shadow gốc + tăng nhẹ khi hover */}
                        transition-all duration-500
                        hover:-translate-y-2
                        cursor-pointer
                        border border-white/8
                        bg-gradient-to-br from-white/4 to-transparent
                        backdrop-blur-md
                      "
                    >
                      {/* Background Image */}
                      <img
                        src={event.bannerUrl || "/default-banner.jpg"}
                        alt={event.name}
                        className="
                          absolute inset-0
                          w-full h-full
                          object-cover
                          scale-100
                          group-hover:scale-108
                          transition-transform duration-800 ease-out
                          brightness-[0.72] contrast-[1.05]
                        "
                      />

                      {/* Gradient Overlay – giữ chiều sâu nhưng tinh tế hơn */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/8" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                      {/* Shine layer mỏng (premium touch) */}
                      <div className={`
                        absolute inset-0
                        bg-gradient-to-br from-white/10 via-transparent to-transparent
                        opacity-0 group-hover:opacity-70
                        transition-opacity duration-600
                        pointer-events-none
                      `} />

                      {/* Border glow nhẹ */}
                      <div className={`
                        absolute inset-0 rounded-3xl
                        ring-1 ring-white/10 group-hover:ring-white/25
                        transition duration-400
                        pointer-events-none
                      `} />

                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white">

                        {/* Top Row */}
                        <div className="flex justify-between items-start">
                          {/* Date glass badge – nâng cấp nhẹ */}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="
                              backdrop-blur-md
                              bg-white/12
                              px-4 py-2.5
                              rounded-xl
                              border border-white/20
                              shadow-md
                            "
                          >
                            <p className="text-lg font-semibold leading-none text-[#F7DFA8]">
                              {event.date?.split('/')[0]?.padStart(2,'0')}
                            </p>
                            <p className="text-xs opacity-85">
                              Tháng {event.date?.split('/')[1]}
                            </p>
                          </motion.div>

                          {/* Club badge */}
                          <div className="
                            text-xs
                            px-3 py-1.5
                            rounded-full
                            bg-white/12
                            backdrop-blur-md
                            border border-white/18
                          ">
                            {event.createdBy?.club_info?.club_name || "Không rõ CLB"}
                          </div>
                        </div>

                        {/* Bottom Content */}
                        <div>
                          <p className="
                            text-xl
                            font-semibold
                            leading-snug
                            tracking-wide
                            group-hover:text-[#F7DFA8]
                            transition-colors duration-300
                            line-clamp-2
                          ">
                            {event.name}
                          </p>

                          <p className="mt-2 text-sm text-white/75 font-light">
                            {formatDateVN(event.date)}
                          </p>

                          {/* Accent line nhỏ xinh */}
                          <div className="h-0.5 w-10 bg-[#F7DFA8]/60 rounded-full mt-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;