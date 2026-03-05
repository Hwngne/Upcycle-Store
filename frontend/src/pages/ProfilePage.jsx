// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import EditProfileModal from "@/components/EditProfileModal";
import {
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaVenusMars,
  FaCalendarAlt,
  FaShieldAlt,
  FaPhone,
  FaBirthdayCake,
  FaCamera,
} from "react-icons/fa";
import { getMyProfileApi } from "@/services/account.service";
import { toast } from "sonner";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyProfileApi();
      const data = res.data;

      const formattedUser = {
        email: data.email,
        phone_number: data.phone_number || data.admin_phone || "",
        role:
          data.role === "student"
            ? "Sinh viên"
            : data.role === "admin"
              ? "Admin"
              : "Câu lạc bộ",
        status: data.status === "active" ? "Còn hoạt động" : "Đã khóa",
        createdAt: new Date(data.createdAt).toLocaleDateString("vi-VN"),
        avatar: data.avatar || "https://i.pravatar.cc/150?img=3",
        dateOfBirth: data.dateOfBirth || "Chưa cập nhật",
      };

      if (data.role === "student") {
        formattedUser.name = data.student_name || "Chưa cập nhật";
        formattedUser.mssv = data.student_code || "—";
        formattedUser.gender =
          data.gender === "M"
            ? "Nam"
            : data.gender === "F"
              ? "Nữ"
              : "Chưa cập nhật";
      } else if (data.role === "admin") {
        formattedUser.name = data.admin_name || "Chưa cập nhật";
        formattedUser.gender =
          data.admin_gender === "M"
            ? "Nam"
            : data.admin_gender === "F"
              ? "Nữ"
              : "Chưa cập nhật";
      } else if (data.role === "club") {
        formattedUser.name = data.club_info?.club_name || "Chưa cập nhật";
        formattedUser.president = data.club_info?.president_name || "Chưa cập nhật";
        formattedUser.memberCount = data.club_info?.member_count || 0;
      }

      setUser(formattedUser);
    } catch (err) {
      toast.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được quá 5MB");
      return;
    }

    // Preview ngay
    const previewUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, avatar: previewUrl }));
    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/accounts/me/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Đang làm mới...");
          fetchProfile();
          return;
        }
        const text = await res.text();
        console.error("Lỗi server:", text);
        throw new Error("Upload thất bại");
      }

      const data = await res.json();

      setUser((prev) => ({ ...prev, avatar: data.data.avatar }));
      toast.success("Cập nhật ảnh đại diện thành công!");

      // Cập nhật avatar trong localStorage để HeaderWithAvatar cập nhật ngay
      const currentUser = localStorage.getItem("user");
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        parsed.avatar = data.data.avatar;
        localStorage.setItem("user", JSON.stringify(parsed));
        window.dispatchEvent(new Event("avatar-updated"));
      } else {
        localStorage.setItem("user", JSON.stringify({
          email: user.email,
          role: user.role,
          avatar: data.data.avatar
        }));
      }
    } catch (err) {
      toast.error(err.message || "Cập nhật ảnh thất bại");
      fetchProfile(); // rollback
    } finally {
      setUploading(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff0] p-8 flex items-center justify-center">
        <p className="text-[#4B0503]/70 text-xl">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fff0] p-8 flex items-center justify-center">
        <p className="text-red-600 text-xl">Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "from-[#B40001] to-[#E29A7D]";
      case "Câu lạc bộ":
        return "from-[#5B0704] to-[#D12B1E]";
      case "Sinh viên":
      default:
        return "from-[#D12B1E] to-[#E5CFB5]";
    }
  };

  const getStatusColor = (status) =>
    status === "Còn hoạt động" ? "text-green-600" : "text-red-600";

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-[#F7DFA8]/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] bg-[#BE0000]/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[520px] h-[520px] bg-[#F7DFA8]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0] z-10">
        <div className="relative z-50 mb-8">
          <PageHeader
            icon={<FaUser className="text-3xl" />}
            title="Hồ sơ cá nhân"
            subtitle="Thông tin chi tiết tài khoản của bạn"
            right={<HeaderWithAvatar />}
          />
        </div>

        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-40">
          {/* Avatar card */}
          <div className="lg:col-span-1">
            <div className="w-80 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-white/30 relative group">
              <div className="relative inline-block">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-40 h-40 mx-auto rounded-full object-cover shadow-2xl border-4 border-white cursor-pointer"
                  onClick={openFilePicker}
                  onError={(e) => {
                    e.target.src = "https://i.pravatar.cc/150?img=3";
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer"
                  onClick={openFilePicker}
                >
                  <div className="text-white text-center">
                    <FaCamera className="mx-auto text-4xl mb-2" />
                    <p className="text-lg font-semibold">
                      {uploading ? "Đang tải..." : "Thay ảnh"}
                    </p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <h2 className="text-2xl font-bold text-[#4B0503] mt-6 mb-2">
                {user.name}
              </h2>
              <p className="text-[#4B0503]/70 mb-4 break-all">{user.email}</p>

              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-semibold shadow-lg bg-gradient-to-r from-[#B40001] to-[#E29A7D]">
                <FaShieldAlt />
                {user.role}
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl p-11 border border-white/30">
              <h3 className="text-xl font-bold text-[#4B0503] mb-6 flex items-center gap-3">
                <FaIdCard className="text-2xl" />
                Thông tin tài khoản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.dateOfBirth !== "Chưa cập nhật" && (
                  <div>
                    <p className="text-sm text-[#4B0503]/60 mb-1 flex items-center gap-2">
                      <FaBirthdayCake /> Ngày sinh
                    </p>
                    <p className="text-lg font-semibold text-[#4B0503]">{user.dateOfBirth}</p>
                  </div>
                )}

                {(user.role === "Sinh viên" || user.role === "Câu lạc bộ") && (
                  <div>
                    <p className="text-sm text-[#4B0503]/60 mb-1">
                      {user.role === "Sinh viên" ? "Mã số sinh viên" : "Tên câu lạc bộ"}
                    </p>
                    <p className="text-lg font-semibold text-[#4B0503]">
                      {user.role === "Sinh viên" ? user.mssv || "—" : user.name}
                    </p>
                  </div>
                )}

                {user.role !== "Câu lạc bộ" && (
                  <div>
                    <p className="text-sm text-[#4B0503]/60 mb-1">Họ và tên</p>
                    <p className="text-lg font-semibold text-[#4B0503]">{user.name}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-[#4B0503]/60 mb-1 flex items-center gap-2">
                    <FaEnvelope /> Email
                  </p>
                  <p className="text-lg font-semibold text-[#4B0503] break-all">{user.email}</p>
                </div>

                {user.phone_number && (
                  <div>
                    <p className="text-sm text-[#4B0503]/60 mb-1 flex items-center gap-2">
                      <FaPhone /> Số điện thoại
                    </p>
                    <p className="text-lg font-semibold text-[#4B0503]">{user.phone_number}</p>
                  </div>
                )}

                {(user.role === "Sinh viên" || user.role === "Admin") && (
                  <div>
                    <p className="text-sm text-[#4B0503]/60 mb-1 flex items-center gap-2">
                      <FaVenusMars /> Giới tính
                    </p>
                    <p className="text-lg font-semibold text-[#4B0503]">{user.gender}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-[#4B0503]/60 mb-1">Trạng thái tài khoản</p>
                  <p className={`text-lg font-bold ${getStatusColor(user.status)}`}>
                    {user.status}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#4B0503]/60 mb-1 flex items-center gap-2">
                    <FaCalendarAlt /> Ngày tạo
                  </p>
                  <p className="text-lg font-semibold text-[#4B0503]">{user.createdAt}</p>
                </div>

                {user.role === "Câu lạc bộ" && (
                  <>
                    <div>
                      <p className="text-sm text-[#4B0503]/60 mb-1">Chủ nhiệm CLB</p>
                      <p className="text-lg font-semibold text-[#4B0503]">{user.president}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#4B0503]/60 mb-1">Số thành viên</p>
                      <p className="text-lg font-semibold text-[#4B0503]">{user.memberCount} thành viên</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setEditOpen(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#B40001] to-[#E29A7D] text-white font-semibold hover:shadow-xl transition shadow-lg"
              >
                Chỉnh sửa thông tin
              </button>

              <button
                onClick={() => setPasswordOpen(true)}
                className="px-8 py-4 rounded-xl border border-[#B40001] text-[#B40001] font-semibold hover:bg-[#B40001]/10 transition"
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        onSuccess={fetchProfile}
      />
    </>
  );
};

export default ProfilePage;