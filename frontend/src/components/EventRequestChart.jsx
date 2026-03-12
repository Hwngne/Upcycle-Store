import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import dayjs from "dayjs";

/* =========================
   TOOLTIP - Đổi nền sáng ấm
========================= */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const formattedDate = dayjs(label).format("DD/MM/YYYY");

  // Lọc chỉ giữ main line
  const filteredPayload = payload.filter((entry) =>
    entry.name === "Sự kiện" || entry.name === "Quảng bá"
  );

  if (filteredPayload.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[#F6F1E8] text-[#4B0503] p-4 rounded-xl shadow-2xl border border-[#D12B1E]/30 min-w-[220px] backdrop-blur-sm"
    >
      <p className="font-semibold mb-3 text-[#4B0503]">
        Ngày: {formattedDate}
      </p>

      {filteredPayload.map((entry, i) => (
        <div key={i} className="flex items-center gap-3 text-sm mb-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="opacity-90 font-medium">{entry.name}:</span>
          <strong>{entry.value} yêu cầu</strong>
        </div>
      ))}
    </motion.div>
  );
};

/* =========================
   MAIN COMPONENT
========================= */

const EventRequestChart = ({ data = [], loading }) => {
  const [range, setRange] = useState(30);

  const processedData = useMemo(() => {
    if (!data.length) return [];

    const sorted = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const endDate = dayjs();
    const startDate = endDate.subtract(range - 1, "day");

    const map = {};
    sorted.forEach((item) => {
      map[dayjs(item.date).format("YYYY-MM-DD")] = item;
    });

    const result = [];
    for (let i = 0; i < range; i++) {
      const current = startDate.add(i, "day").format("YYYY-MM-DD");

      result.push({
        date: current,
        eventsRequested: map[current]?.eventsRequested || 0,
        promotionRequested: map[current]?.promotionRequested || 0,
      });
    }

    return result;
  }, [data, range]);

  return (
    <div className="bg-[#F6F1E8] rounded-[24px] p-8 shadow-xl justify-betweenflex flex-col">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-[20px] font-semibold text-[#4B0503]">
            Yêu cầu theo ngày tạo
          </h3>
          <p className="text-sm text-[#8C5E58] mt-1">
            Biến động yêu cầu tổ chức sự kiện & quảng bá
          </p>
        </div>

        {/* FILTER */}
        <div className="flex gap-2">
          {[7, 30, 90].map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              className={`px-3 py-1.5 rounded-lg text-sm transition font-medium ${
                range === item
                  ? "bg-[#D12B1E] text-white shadow-md"
                  : "bg-[#F7DFA8]/30 text-[#4B0503] hover:bg-[#F7DFA8]/50 border border-[#D12B1E]/30"
              }`}
            >
              {item} ngày
            </button>
          ))}
        </div>
      </div>

      {/* CHART */}
      <div className="h-[340px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#4B0503]/60">
            Đang tải dữ liệu...
          </div>
        ) : processedData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#8C5E58] text-sm italic">
            Chưa có yêu cầu nào trong khoảng thời gian này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>

              {/* DEFINITIONS */}
              <defs>
                <linearGradient id="eventStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#5B0704" />
                  <stop offset="100%" stopColor="#D12B1E" />
                </linearGradient>

                <linearGradient id="eventArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(209, 43, 30, 0.45)" />
                  <stop offset="60%" stopColor="rgba(209, 43, 30, 0.12)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>

                <filter id="glowRed" height="300%" width="300%" x="-100%" y="-100%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <linearGradient id="promoStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F7DFA8" />
                  <stop offset="100%" stopColor="#F4C430" />
                </linearGradient>

                <linearGradient id="promoArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(247,223,168,0.45)" />
                  <stop offset="60%" stopColor="rgba(247,223,168,0.12)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>

                <filter id="glowYellow" height="300%" width="300%" x="-100%" y="-100%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(75, 5, 3, 0.12)"  // đỏ nhạt mờ trên nền kem
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={(value) => dayjs(value).format("DD/MM")}
                tick={{ fill: "#4B0503", fontSize: 12 }}
                axisLine={{ stroke: "#8C5E58" }}
                tickLine={{ stroke: "#8C5E58" }}
              />

              <YAxis
                tick={{ fill: "#4B0503", fontSize: 12 }}
                axisLine={{ stroke: "#8C5E58" }}
                tickLine={{ stroke: "#8C5E58" }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "rgba(209, 43, 30, 0.4)",
                  strokeDasharray: "4 4",
                }}
              />

              <Area
                type="monotone"
                dataKey="eventsRequested"
                fill="url(#eventArea)"
                stroke="none"
                animationDuration={900}
              />

              <Area
                type="monotone"
                dataKey="promotionRequested"
                fill="url(#promoArea)"
                stroke="none"
                animationDuration={1100}
              />

              {/* GLOW LAYER - Sự kiện */}
              <Line
                type="monotone"
                dataKey="eventsRequested"
                stroke="url(#eventStroke)"
                strokeWidth={8}
                dot={false}
                strokeOpacity={0.15}
                filter="url(#glowRed)"
                animationDuration={900}
                hide={true}
              />

              {/* MAIN LINE - Sự kiện */}
              <Line
                type="monotone"
                dataKey="eventsRequested"
                name="Sự kiện"
                stroke="url(#eventStroke)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 8,
                  stroke: "#4B0503",
                  strokeWidth: 3,
                  fill: "#D12B1E",
                }}
                animationDuration={900}
                animationEasing="ease-out"
              />

              {/* GLOW LAYER - Quảng bá */}
              <Line
                type="monotone"
                dataKey="promotionRequested"
                stroke="url(#promoStroke)"
                strokeWidth={8}
                dot={false}
                strokeOpacity={0.18}
                filter="url(#glowYellow)"
                animationDuration={1080}
                hide={true}
              />

              {/* MAIN LINE - Quảng bá */}
              <Line
                type="monotone"
                dataKey="promotionRequested"
                name="Quảng bá"
                stroke="url(#promoStroke)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 8,
                  stroke: "#4B0503",
                  strokeWidth: 3,
                  fill: "#F4C430",
                }}
                animationDuration={1080}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default EventRequestChart;