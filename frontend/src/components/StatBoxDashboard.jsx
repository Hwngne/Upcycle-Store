import React from "react";

const statsData = [
  {
    id: 1,
    title: "Yêu cầu đổi quà",
    value: 128,
    icon: "🎁",
  },
  {
    id: 2,
    title: "Bài viết xuất bản",
    value: 64,
    icon: "📝",
  },
  {
    id: 3,
    title: "Sự kiện yêu cầu",
    value: 12,
    icon: "📅",
  },
];

const defaultGradients = [
  "linear-gradient(to right, #5B0704 0%, #A71D0D 50%, #D12B1E 100%)",
  "linear-gradient(to right, #D12B1E 0%, #B40001 50%, #E5CFB5 100%)",
  "linear-gradient(to right, #B40001 0%, #E29A7D 50%, #F5E0C3 100%)",
];

const glassGlowClass = `
  backdrop-blur-md
  rounded-2xl
  shadow-[0_4px_20px_rgba(0,0,0,0.2)]
  transition-all duration-300
  flex items-center gap-4
  p-5
  min-h-[110px]
  text-white
`;

export default function StatBoxDashboard() {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
      }}
    >
      {statsData.map((item, index) => (
        <div
          key={item.id}
          className={glassGlowClass}
          style={{
            background: defaultGradients[index % defaultGradients.length],
          }}
        >
          <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-2xl">
            {item.icon}
          </div>

          <div>
            <p className="text-2xl md:text-3xl font-bold">
              {item.value}
            </p>
            <p className="text-sm md:text-base text-white/90">
              {item.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
