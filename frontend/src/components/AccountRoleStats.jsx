import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, UserCog } from "lucide-react";

const AccountRoleStats = ({ overview }) => {
  if (!overview) return null;

  const totalAdmins = overview?.roleStatsTotal?.admin || 0;
  const totalStudents = overview?.roleStatsTotal?.student || 0;
  const totalClubs = overview?.roleStatsTotal?.club || 0;
  
  const total = totalAdmins + totalStudents + totalClubs;

  const percent =
    total > 0
      ? Math.round((totalStudents / total) * 100)
      : 0;

  const radius = 95;
  const strokeWidth = 16;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (percent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        rounded-3xl
        p-8
        min-h-[300px]
        flex
        items-center
        gap-10
        bg-[#F6F1E8]
        shadow-xl
      "
    >
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-4 flex-1">
        <h3 className="text-2xl font-semibold text-[#4B0503]">
          Thống kê tài khoản
        </h3>

        {/* Sinh viên */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-inner">
          <div className="flex items-center gap-2 text-[#8C5E58] mb-1">
            <Users className="w-4 h-4 text-[#BE0000]" />
            <span className="text-sm whitespace-nowrap">
              Sinh viên
            </span>
          </div>
          <p className="text-3xl font-bold text-[#4B0503]">
            {totalStudents}
          </p>
        </div>

        {/* Admin + CLB */}
        <div className="grid grid-cols-2 gap-3">
          {/* Admin */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-inner">
            <div className="flex items-center gap-2 text-[#8C5E58] mb-1">
              <UserCog className="w-4 h-4 text-[#BE0000]" />
              <span className="text-sm whitespace-nowrap">
                Admin
              </span>
            </div>
            <p className="text-2xl font-bold text-[#4B0503]">
              {totalAdmins}
            </p>
          </div>

          {/* CLB */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-inner">
            <div className="flex items-center gap-2 text-[#8C5E58] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#BE0000]" />
              <span className="text-sm whitespace-nowrap">
                Câu lạc bộ
              </span>
            </div>
            <p className="text-2xl font-bold text-[#4B0503]">
              {totalClubs}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - CIRCLE */}
      <div className="relative flex items-center justify-center w-[200px] shrink-0">

        <svg height={radius * 2} width={radius * 2} className="relative overflow-visible">
          <defs>
            {/* Gradient */}
            <linearGradient
              id="goldGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#F7DFA8" />
              <stop offset="100%" stopColor="#BE0000" />
            </linearGradient>

            {/* Blur filter tròn thật */}
            <filter id="circleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
            </filter>
          </defs>

          {/* Glow nền tròn */}
          <circle
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            stroke="url(#goldGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity="0.35"
            filter="url(#circleGlow)"
          />

          {/* Background circle */}
          <circle
            stroke="#E5DED6"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            opacity="0.6"
          />

          {/* Progress circle */}
          <motion.circle
            stroke="url(#goldGradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2 }}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute text-center">
          <p className="text-sm text-[#8C5E58]">
            Tỷ lệ sinh viên
          </p>

          <p className="text-5xl font-bold text-[#4B0503]">
            {percent}
            <span className="text-2xl ml-1">%</span>
          </p>

          <p className="text-sm text-[#8C5E58]">
            Tổng hệ thống
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountRoleStats;