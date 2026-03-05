import React, { useMemo, useState, useRef, useEffect } from "react";
import CustomDropdown from "@/components/CustomDropdown";
import MonthFilterDropdown from "@/components/MonthFilterDropdown";
import TooltipPortal from "./TooltipPortal"; // giả sử đã import đúng

/* ================= UTILS ================= */
const parseVNDate = (d) => new Date(d.split("/").reverse().join("-"));

const formatMonthKey = (date) => `${date.getMonth() + 1}/${date.getFullYear()}`;

const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

const diffDays = (a, b) => Math.floor((b - a) / (1000 * 60 * 60 * 24));

/* ===== WEEK UTILS ===== */
const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  return d;
};

const endOfWeek = (date) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return d;
};

/* ================= COLORS ================= */
const CLUB_COLORS = [
  "from-[#5B0704] to-[#A71D0D]",
  "from-[#F7DFA8] to-[#D12B1E]",
];

const getColorByClub = (club) => {
  let hash = 0;
  for (let i = 0; i < club.length; i++) {
    hash += club.charCodeAt(i);
  }
  return CLUB_COLORS[hash % CLUB_COLORS.length];
};

/* ================= EVENT ROW COMPONENTS ================= */

const MonthEventRow = ({ event, monthStart, monthEnd, monthGridTemplate }) => {
  const barRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const barStart = new Date(Math.max(event.start.getTime(), monthStart.getTime()));
  const barEnd   = new Date(Math.min(event.end.getTime(), monthEnd.getTime()));

  if (barEnd < barStart) return null;

  const offset = diffDays(monthStart, barStart);
  const span   = diffDays(barStart, barEnd) + 1;

  return (
    <div
      className="grid items-center relative"
      style={{
        gridTemplateColumns: monthGridTemplate,
        backgroundImage: "linear-gradient(to right, rgba(79, 75, 75, 0.04) 1px, transparent 1px)",
        backgroundSize: "36px 100%",
      }}
    >
      {/* LEFT LABEL */}
      <div className="sticky left-0 z-40 px-3 py-2 bg-white/95 backdrop-blur border-r border-black/10">
        <div className="text-sm font-semibold truncate text-[#4B0503]">
          {event.name}
        </div>
        <div className="text-xs opacity-60">{event.club}</div>
      </div>

      {/* Offset empty cells */}
      {Array.from({ length: Math.max(0, offset) }).map((_, i) => (
        <div key={i} />
      ))}

      {/* BAR + TooltipPortal */}
      <div style={{ gridColumn: `span ${span}` }} className="ml-1.5 mr-1">
        <div
          ref={barRef}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`h-6 rounded-lg bg-gradient-to-r ${getColorByClub(event.club)}
            shadow-sm flex items-center px-2 text-white text-[11px] cursor-pointer
          `}
        >
          <span className="truncate">
            {event.promotionStartDate} → {event.promotionEndDate}
          </span>
        </div>

        <TooltipPortal targetRef={barRef} visible={showTooltip}>
          <div className="px-4 py-2.5 bg-gray-800/95 text-white text-xs rounded-md shadow-xl border border-gray-700 whitespace-nowrap">
            <div className="font-medium mb-1">{event.name}</div>
            <div className="opacity-90">{event.club}</div>
            <div className="mt-1 border-t border-gray-600 pt-1">
              {event.promotionStartDate} → {event.promotionEndDate}
            </div>
          </div>
        </TooltipPortal>
      </div>
    </div>
  );
};

const WeekEventRow = ({ event, weekStart, weekEnd, weekGridTemplate }) => {
  const barRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const barStart = new Date(Math.max(event.start.getTime(), weekStart.getTime()));
  const barEnd   = new Date(Math.min(event.end.getTime(), weekEnd.getTime()));

  if (barEnd < barStart) return null;

  const offset = diffDays(weekStart, barStart);
  const span   = diffDays(barStart, barEnd) + 1;

  return (
    <div
      className="grid items-center relative"
      style={{ gridTemplateColumns: weekGridTemplate }}
    >
      {/* LEFT LABEL */}
      <div className="sticky left-0 z-40 px-3 py-2 bg-white/95 border-r border-black/10">
        <div className="text-sm font-semibold truncate text-[#4B0503]">
          {event.name}
        </div>
        <div className="text-xs opacity-60">{event.club}</div>
      </div>

      {/* Offset empty cells */}
      {Array.from({ length: Math.max(0, offset) }).map((_, i) => (
        <div key={i} />
      ))}

      {/* BAR + TooltipPortal */}
      <div style={{ gridColumn: `span ${span}` }} className="px-1.5">
        <div
          ref={barRef}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`h-6 rounded-lg bg-gradient-to-r ${getColorByClub(event.club)}
            text-white text-[11px] flex items-center px-2 shadow-sm cursor-pointer
          `}
        >
          {event.promotionStartDate} → {event.promotionEndDate}
        </div>

        <TooltipPortal targetRef={barRef} visible={showTooltip}>
          <div className="px-4 py-2.5 bg-gray-800/95 text-white text-xs rounded-md shadow-xl border border-gray-700 whitespace-nowrap">
            <div className="font-medium mb-1">{event.name}</div>
            <div className="opacity-90">{event.club}</div>
            <div className="mt-1 border-t border-gray-600 pt-1">
              {event.promotionStartDate} → {event.promotionEndDate}
            </div>
          </div>
        </TooltipPortal>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
const GanttTimeline = ({ events = [] }) => {
  const [viewType, setViewType] = useState("month");
  const [weekDate, setWeekDate] = useState(new Date());

  const displayRef = useRef(null);
  const [displayOpen, setDisplayOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (displayRef.current && !displayRef.current.contains(e.target)) {
        setDisplayOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===== DATA PARSING ===== */
  const parsedEvents = useMemo(() => {
    return events
      .map((e) => {
        let start = e.start instanceof Date ? e.start : parseVNDate(e.promotionStartDate);
        let end = e.end instanceof Date ? e.end : parseVNDate(e.promotionEndDate);

        if (!start || !end || isNaN(start) || isNaN(end) || end < start) {
          console.warn(`Event không hợp lệ: ${e.name}`);
          return null;
        }
        return { ...e, start, end };
      })
      .filter(Boolean);
  }, [events]);

  /* ===== MONTH OPTIONS ===== */
  const monthOptions = useMemo(() => {
    if (!parsedEvents.length) return [];
    const minDate = new Date(Math.min(...parsedEvents.map(e => e.start)));
    const maxDate = new Date(Math.max(...parsedEvents.map(e => e.end)));
    const cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    const result = [];
    while (cur <= end) {
      result.push({
        value: formatMonthKey(cur),
        month: cur.getMonth() + 1,
        year: cur.getFullYear(),
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return result;
  }, [parsedEvents]);

  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    if (!selectedMonth && monthOptions.length) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  useEffect(() => {
    if (viewType === "week" && selectedMonth) {
      setWeekDate(new Date(selectedMonth.year, selectedMonth.month - 1, 1));
    }
  }, [selectedMonth, viewType]);

  if (!selectedMonth) {
    return <div className="text-center py-12 text-[#4B0503]/70">Đang tải dữ liệu...</div>;
  }

  const { month, year } = selectedMonth;

  /* ===== MONTH VIEW ===== */
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, daysInMonth(month, year));
  const days = Array.from({ length: daysInMonth(month, year) }, (_, i) => 
    new Date(year, month - 1, i + 1)
  );
  const visibleMonthEvents = parsedEvents.filter(e => e.end >= monthStart && e.start <= monthEnd);
  const monthGridTemplate = `240px repeat(${days.length}, minmax(36px, 1fr))`;

  /* ===== WEEK VIEW ===== */
  const weekStart = startOfWeek(weekDate);
  const weekEnd = endOfWeek(weekDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const visibleWeekEvents = parsedEvents.filter(e => e.end >= weekStart && e.start <= weekEnd);
  const weekGridTemplate = `240px repeat(7, minmax(80px, 1fr))`;

  /* ================= RENDER ================= */
  return (
    <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/40 relative">
      {/* FILTER BAR */}
      <div className="relative z-50 flex flex-col md:flex-row gap-4 mb-12 items-end">
        <div className="flex-1">
          <CustomDropdown
            refProp={displayRef}
            open={displayOpen}
            setOpen={setDisplayOpen}
            value={viewType}
            onChange={setViewType}
            options={[
              { value: "month", label: "Hiển thị theo tháng" },
              { value: "week", label: "Hiển thị theo tuần" },
            ]}
            label="Loại hiển thị"
          />
        </div>

        <div className="flex-1">
          <MonthFilterDropdown
            months={monthOptions}
            value={selectedMonth?.value}
            onChange={(val) => {
              const [m, y] = val.split("/").map(Number);
              setSelectedMonth({ value: val, month: m, year: y });
            }}
          />
        </div>

        {viewType === "week" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekDate(prev => new Date(prev.getTime() - 7 * 86400000))}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-[#F7DFA8]/30 text-sm"
            >
              ← Tuần trước
            </button>
            <button
              onClick={() => setWeekDate(prev => new Date(prev.getTime() + 7 * 86400000))}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-[#F7DFA8]/30 text-sm"
            >
              Tuần sau →
            </button>
          </div>
        )}
      </div>

      {/* MONTH VIEW */}
      {viewType === "month" && (
        <div className="relative z-10 overflow-x-auto">
          {/* Header */}
          <div
            className="grid sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-black/5"
            style={{ gridTemplateColumns: monthGridTemplate }}
          >
            <div className="sticky left-0 z-40 bg-white/95" />
            {days.map(d => {
              const isToday = d.toDateString() === new Date().toDateString();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div
                  key={d.getTime()}
                  className={`relative py-2 text-xs text-center font-medium text-[#4B0503] border-l border-black/5 ${isWeekend ? "bg-[#F7DFA8]/20" : ""}`}
                >
                  {d.getDate()}
                  {isToday && <div className="absolute inset-1 rounded-md border-2 border-[#A71D0D]/60 pointer-events-none" />}
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div className="space-y-1 mt-2 min-w-[1200px]">
            {visibleMonthEvents.length === 0 ? (
              <div className="grid items-center" style={{ gridTemplateColumns: monthGridTemplate }}>
                <div className="sticky left-0 px-3 py-4 bg-white/95 text-sm opacity-60 border-r border-black/10">
                  Không có sự kiện trong tháng này
                </div>
                {days.map((_, i) => <div key={i} />)}
              </div>
            ) : (
              visibleMonthEvents.map(event => (
                <MonthEventRow
                  key={event.id}
                  event={event}
                  monthStart={monthStart}
                  monthEnd={monthEnd}
                  monthGridTemplate={monthGridTemplate}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewType === "week" && (
        <div className="relative z-10 overflow-x-auto">
          {/* Header */}
          <div
            className="grid sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-black/5"
            style={{ gridTemplateColumns: weekGridTemplate }}
          >
            <div className="sticky left-0 z-40 bg-white/95 px-3 py-2 text-sm font-semibold text-[#4B0503]">
              {weekStart.toLocaleDateString("vi-VN")} – {weekEnd.toLocaleDateString("vi-VN")}
            </div>
            {weekDays.map(d => {
              const isToday = d.toDateString() === new Date().toDateString();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div
                  key={d.toISOString()}
                  className={`relative py-2 text-xs text-center font-medium border-l border-black/5 text-[#4B0503] ${isWeekend ? "bg-[#F7DFA8]/20" : ""}`}
                >
                  {d.getDate()}/{d.getMonth() + 1}
                  {isToday && <div className="absolute inset-1 rounded-md border-2 border-[#A71D0D]/60 pointer-events-none" />}
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div className="space-y-1 mt-2 min-w-[900px]">
            {visibleWeekEvents.length === 0 ? (
              <div className="grid items-center" style={{ gridTemplateColumns: weekGridTemplate }}>
                <div className="sticky left-0 px-3 py-4 bg-white/95 text-sm opacity-60 border-r border-black/10">
                  Không có sự kiện trong tuần này
                </div>
                {weekDays.map((_, i) => <div key={i} />)}
              </div>
            ) : (
              visibleWeekEvents.map(event => (
                <WeekEventRow
                  key={event.id}
                  event={event}
                  weekStart={weekStart}
                  weekEnd={weekEnd}
                  weekGridTemplate={weekGridTemplate}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttTimeline;