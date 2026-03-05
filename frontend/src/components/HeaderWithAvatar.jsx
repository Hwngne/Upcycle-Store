// src/components/HeaderWithAvatar.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "@/services/auth.service";
import { getMyProfileApi } from "@/services/account.service";
import { toast } from "sonner";
import { FaUser } from "react-icons/fa";

const HeaderWithAvatar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);     // Dùng để hiển thị email + role
    const [avatar, setAvatar] = useState(null); // Avatar riêng từ API

    const dropdownRef = useRef(null);
    const avatarRef = useRef(null);
    const navigate = useNavigate();

    // Lấy dữ liệu user + avatar từ API
    const fetchUserData = async () => {
        try {
            const res = await getMyProfileApi();
            const data = res.data;

            const userInfo = {
                email: data.email,
                role: data.role === "student" ? "Sinh viên" : data.role === "admin" ? "Admin" : "Câu lạc bộ",
            };

            setUser(userInfo);
            setAvatar(data.avatar || null);

            // Đồng bộ vào localStorage (để các tab khác cập nhật nếu cần)
            localStorage.setItem("user", JSON.stringify({
                ...userInfo,
                avatar: data.avatar || null
            }));
        } catch (error) {
            toast.error("Không thể tải thông tin người dùng");
            console.error(error);
        }
    };

    useEffect(() => {
        // Load lần đầu
        fetchUserData();

        // 🔥 LẮNG NGHE CUSTOM EVENT "avatar-updated" TỪ PROFILEPAGE
        const handleAvatarUpdated = () => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed.avatar) {
                        setAvatar(parsed.avatar);
                    }
                } catch (err) {
                    console.error("Lỗi parse user khi cập nhật avatar");
                }
            }
        };

        window.addEventListener("avatar-updated", handleAvatarUpdated);

        return () => {
            window.removeEventListener("avatar-updated", handleAvatarUpdated);
        };
    }, []);

    const toggleDropdown = () => setDropdownOpen((prev) => !prev);

    // Click outside đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                avatarRef.current &&
                !avatarRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Đăng xuất
    const handleLogout = async () => {
        try {
            await logoutApi();
            toast.success("Đăng xuất thành công!");
        } catch (error) {
            // Bỏ qua lỗi nếu backend không xử lý logout
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.clear();
            navigate("/");
        }
    };

    return (
        <div className="relative flex items-center gap-4">
            {/* INFO */}
            <div className="text-right">
                <p className="text-sm text-[#4B0503]/70 break-all max-w-70">
                    {user?.email || "—"}
                </p>
                <span className="inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full bg-[#F7DFA8]/70 text-[#4B0503] capitalize">
                    {user?.role || "—"}
                </span>
            </div>

            {/* AVATAR - KHÔNG VIỀN TRẮNG */}
            <div
                ref={avatarRef}
                onClick={toggleDropdown}
                className="w-14 h-14 rounded-full overflow-hidden shadow-lg cursor-pointer select-none relative"
            >
                {avatar ? (
                    <img
                        src={avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                        }}
                    />
                ) : null}

                {/* Fallback: Icon user nếu chưa có avatar */}
                <div
                    className={`absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center ${avatar ? "hidden" : "flex"
                        }`}
                >
                    <FaUser className="text-gray-500 text-3xl" />
                </div>
            </div>

            {/* DROPDOWN */}
            {dropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 top-16 w-48 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50 overflow-hidden"
                >
                    <ul className="text-[#4B0503]">
                        <li
                            className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                            onClick={() => {
                                setDropdownOpen(false);
                                navigate("/profile");
                            }}
                        >
                            Xem hồ sơ
                        </li>
                        <li
                            className="px-4 py-3 border-t border-white/20 hover:bg-red-500/30 cursor-pointer transition text-red-700 font-semibold"
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default HeaderWithAvatar;