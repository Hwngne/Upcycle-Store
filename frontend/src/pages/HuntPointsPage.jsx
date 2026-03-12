import React, { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { FaGift, FaEdit } from "react-icons/fa";

import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import StatsBoxes from "@/components/StatsBoxes";
import EditActivityConfigModal from "@/components/EditActivityConfigModal";

import {
  getActivitiesApi,
  updateActivityPointApi
} from "@/services/activity.service";

const HuntPointsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activities, setActivities] = useState([]);

  const glassGlow = `
    backdrop-blur-md
    bg-white/30
    rounded-2xl
    border border-white/30
    shadow-[0_0_20px_rgba(247,223,168,0.35)]
  `;

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await getActivitiesApi();
      setActivities(res.data || []);
    } catch {
      setError("Không thể tải danh sách nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // nhiệm vụ admin được chỉnh
  const editableActivities = activities.filter(
    a => a.isEditable && a.type === "normal"
  );

  // nhiệm vụ cố định + spin
  const fixedActivities = activities.filter(
    a => !a.isEditable || a.type === "spin"
  );

  const totalActivities = activities.length;
  const editableCount = editableActivities.length;
  const fixedCount = fixedActivities.length;

  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName] || LucideIcons.Trophy;
    return <Icon className="text-2xl" />;
  };

  const openEditModal = (activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      await updateActivityPointApi(data._id, {
        hunted_point: data.hunted_point,
        description: data.description,
        iconName: data.iconName,
      });
      await fetchActivities();
      setIsModalOpen(false);
      setEditingActivity(null);
    } catch {
      alert("Cập nhật thất bại");
    }
  };

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="relative flex flex-col w-full min-h-screen p-8">
      {/* HEADER */}
      <PageHeader
        icon={<FaGift className="text-3xl" />}
        title="Săn Điểm Tích Lũy"
        subtitle="Cấu hình điểm thưởng cho các hoạt động"
        right={<HeaderWithAvatar />}
      />

      {/* STATS */}
      <div className="my-8">
        <StatsBoxes
          items={[
            {
              title: "Tổng số nhiệm vụ",
              value: totalActivities,
              icon: <FaGift />,
            },
            {
              title: "Nhiệm vụ chỉnh sửa",
              value: editableCount,
              icon: <FaEdit />,
            },
            {
              title: "Nhiệm vụ cố định",
              value: fixedCount,
              icon: <FaGift />,
            },
          ]}
        />
      </div>

      {/* CONTENT */}
      <section className={`${glassGlow} p-8`}>
        <h2 className="text-xl font-bold mb-6 text-[#4B0503]">
          Danh sách nhiệm vụ
        </h2>

        {/* EDITABLE */}
        <h3 className="text-lg font-semibold mb-4 text-[#4B0503]">
          Nhiệm vụ có thể chỉnh sửa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {editableActivities.map(activity => (
            <div
              key={activity._id}
              className="group bg-white/40 rounded-xl p-6 border border-white/30 shadow-lg"
            >
              <div className="flex gap-4 mb-5">
                <div className="p-3 bg-white/60 rounded-lg">
                  {getIcon(activity.iconName)}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{activity.name}</h4>
                  <p className="text-sm opacity-70">{activity.description}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="px-4 py-2 rounded-full text-white bg-gradient-to-r from-[#D12B1E] to-[#A71D0D]">
                  +{activity.hunted_point} điểm
                </span>

                <button
                  onClick={() => openEditModal(activity)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-green-600 text-white rounded-lg"
                >
                  <FaEdit />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FIXED */}
        <h3 className="text-lg font-semibold mb-4 text-[#4B0503]">
          Nhiệm vụ cố định
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fixedActivities.map(activity => (
            <div
              key={activity._id}
              className="bg-white/40 rounded-xl p-6 border border-white/30 shadow-lg"
            >
              <div className="flex gap-4 mb-5">
                <div className="p-3 bg-white/60 rounded-lg">
                  {getIcon(activity.iconName)}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{activity.name}</h4>
                  <p className="text-sm opacity-70">{activity.description}</p>
                </div>
              </div>

              <span className="px-4 py-2 rounded-full text-white bg-gradient-to-r from-[#D12B1E] to-[#A71D0D]">
                {activity.type === "spin"
                  ? "Điểm ngẫu nhiên"
                  : `+${activity.hunted_point} điểm`}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL */}
      <EditActivityConfigModal
        isOpen={isModalOpen}
        activity={editingActivity}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default HuntPointsPage;