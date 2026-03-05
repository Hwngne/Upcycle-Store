import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const GaugeProgress = ({
  title,
  subtitle,
  value = 75,
  unit = "%",
  icon: Icon,
  gradientVariant = "red-gold",
  roleStats = {},
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [activeRole, setActiveRole] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const radius = 120;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * Math.PI;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedValue(value);
    }, 200);
    return () => clearTimeout(timeout);
  }, [value]);

  const strokeDashoffset =
    circumference - (animatedValue / 100) * circumference;

  const gradients = {
    "red-gold": { start: "#F7DFA8", end: "#D12B1E" },
    "dark-red": { start: "#5B0704", end: "#D12B1E" },
  };

  const selected =
    gradients[gradientVariant] || gradients["red-gold"];

  const student = roleStats?.student || 0;
  const club = roleStats?.club || 0;
  const admin = roleStats?.admin || 0;

  const totalRole = student + club + admin;
  const studentPercent = totalRole ? student / totalRole : 0;
  const clubPercent = totalRole ? club / totalRole : 0;
  const adminPercent = totalRole ? admin / totalRole : 0;

  const studentLength = studentPercent * circumference;
  const clubLength = clubPercent * circumference;
  const adminLength = adminPercent * circumference;

  const getOpacity = (role) => {
    if (!activeRole) return 1;
    return activeRole === role ? 1 : 0.2;
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTooltipPos({ x, y: y - 2 });
  };

  return (
    <div className="rounded-3xl p-6 min-h-[360px] bg-[#F6F1E8] shadow-xl flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-[#4B0503]">
          {title}
        </h3>
        <p className="text-sm text-[#8C5E58] mt-1">
          {subtitle}
        </p>
      </div>

      {/* Gauge */}
      <div className="flex justify-center">
        <div className="relative">
          <svg
            height={radius + 30}
            width={radius * 2}
            viewBox={`0 0 ${radius * 2} ${radius}`}
          >
            <defs>
              <linearGradient
                id="brandGaugeGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={selected.start} />
                <stop offset="100%" stopColor={selected.end} />
              </linearGradient>

              {/* Chỉ thêm blur glow */}
              <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
              </filter>
            </defs>

            {/* Background */}
            <path
              d={`
                M ${strokeWidth} ${radius}
                A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth} ${radius}
              `}
              fill="transparent"
              stroke="#E5DED6"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Glow nền - chỉ thêm cái này */}
            <path
              d={`
                M ${strokeWidth} ${radius}
                A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth} ${radius}
              `}
              fill="transparent"
              stroke="url(#brandGaugeGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#gaugeGlow)"
              opacity="0.35"
            />

            {/* STUDENT */}
            <path
              d={`
                M ${strokeWidth} ${radius}
                A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth} ${radius}
              `}
              fill="transparent"
              stroke="url(#brandGaugeGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${studentLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              style={{ opacity: getOpacity("student"), cursor: "pointer" }}
              onMouseEnter={() => setActiveRole("student")}
              onMouseLeave={() => setActiveRole(null)}
              onMouseMove={handleMouseMove}
            />

            {/* CLUB */}
            <path
              d={`
                M ${strokeWidth} ${radius}
                A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth} ${radius}
              `}
              fill="transparent"
              stroke="url(#brandGaugeGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${clubLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset - studentLength}
              style={{ opacity: getOpacity("club"), cursor: "pointer" }}
              onMouseEnter={() => setActiveRole("club")}
              onMouseLeave={() => setActiveRole(null)}
              onMouseMove={handleMouseMove}
            />

            {/* ADMIN */}
            <path
              d={`
                M ${strokeWidth} ${radius}
                A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth} ${radius}
              `}
              fill="transparent"
              stroke="url(#brandGaugeGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${adminLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset - studentLength - clubLength}
              style={{ opacity: getOpacity("admin"), cursor: "pointer" }}
              onMouseEnter={() => setActiveRole("admin")}
              onMouseLeave={() => setActiveRole(null)}
              onMouseMove={handleMouseMove}
            />
          </svg>

          {/* Tooltip ngay trên đoạn hover */}
          {activeRole && (
            <div
              className="absolute bg-white shadow-xl rounded-xl p-3 w-52 text-sm z-20"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="font-semibold text-[#4B0503] mb-1 text-center">
                {activeRole === "student" && "Sinh viên"}
                {activeRole === "club" && "Câu lạc bộ"}
                {activeRole === "admin" && "Admin"}
              </div>

              <div className="text-center">
                {activeRole === "student" && student}
                {activeRole === "club" && club}
                {activeRole === "admin" && admin}
              </div>
            </div>
          )}

          {/* Center Icon */}
          {Icon && (
            <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[#F7DFA8] to-[#D12B1E] text-white flex items-center justify-center shadow-lg">
              <Icon size={28} />
            </div>
          )}
        </div>
      </div>

      {/* Value Card giữ nguyên */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl px-6 py-4 text-center shadow-inner">
        <div className="flex justify-between text-sm text-[#8C5E58] mb-2">
          <span>0%</span>
          <span>100%</span>
        </div>

        <div className="text-[#4B0503] flex justify-center items-end gap-1">
          <span className="text-5xl font-bold">
            {animatedValue}
          </span>
          <span className="text-2xl font-semibold mb-1">
            {unit}
          </span>
        </div>

        <div className="text-sm text-[#8C5E58] mt-1">
          Tài khoản đang hoạt động
        </div>
      </div>
    </div>
  );
};

export default GaugeProgress;