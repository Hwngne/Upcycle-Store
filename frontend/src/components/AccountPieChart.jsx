import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ROLE_COLORS = ["#BE0000", "#F7DFA8", "#4B0503"];
const STATUS_COLORS = ["#16A34A", "#DC2626"];

const AccountPieCharts = ({ data }) => {
  if (!data) return null;

  const roleData = [
    { name: "Sinh viên", value: data.roleStats.student || 0 },
    { name: "CLB", value: data.roleStats.club || 0 },
    { name: "Admin", value: data.roleStats.admin || 0 },
  ];

  const statusData = [
    { name: "Hoạt động", value: data.statusStats.active || 0 },
    { name: "Đã khóa", value: data.statusStats.locked || 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* ROLE CHART */}
      <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-[#4B0503]">
          Phân bố theo vai trò
        </h3>
        <div className="h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={roleData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {roleData.map((entry, index) => (
                  <Cell key={index} fill={ROLE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STATUS CHART */}
      <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-[#4B0503]">
          Phân bố trạng thái tài khoản
        </h3>
        <div className="h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AccountPieCharts;