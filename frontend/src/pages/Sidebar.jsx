import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FaHome, FaUser, FaGem, FaRecycle, FaFileAlt, FaCalendarAlt,
    FaBars, FaChevronDown, FaSignOutAlt, FaStar, FaQuestionCircle, FaNewspaper
} from "react-icons/fa";
import { logoutApi } from "@/services/auth.service"; 
import { toast } from "sonner";

const Sidebar = () => {
    const [open, setOpen] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: <FaHome />, label: "Trang chủ", path: "/homepage" },
        { icon: <FaUser />, label: "Tài khoản", path: "/accounts" },
        {
            icon: <FaGem />, label: "Điểm tích lũy", children: [
                { label: "Quà tặng", path: "/gifts" },
                { label: "Nhận thưởng", path: "/rewards" },
            ]
        },
        {
            icon: <FaRecycle />, label: "Trạm thu gom rác", children: [
                { label: "Cấu hình trạm", path: "/waste_stations/config" },
                { label: "Danh sách Trạm", path: "/waste_stations" },
            ]
        },
        {
            icon: <FaFileAlt />, label: "Quản lý nội dung", children: [
                // { label: "Quản lý bài đăng", path: "/content/management" },
                { label: "Cấu hình nội dung", path: "/content/config" },
                { label: "Video", path:"/content/video"},

            ]
        },
        {
            icon: <FaCalendarAlt />, label: "Quản lý sự kiện", children: [
                { label: "Duyệt sự kiện", path: "/events/review" },
                { label: "Quảng bá", path: "/events/promote" },
            ]
        },
        { icon: <FaStar />, label: "Săn điểm", path: "/hunt_points" },
        { icon: <FaQuestionCircle />, label: "Bài quiz", path: "/quizzes" },
        { icon: <FaNewspaper />, label: "Bài báo", path: "/articles" },
    ];

    useEffect(() => {
        const parent = menuItems.find(item =>
            item.children?.some(c => c.path === location.pathname)
        );
        setOpenDropdown(parent ? parent.label : null);
    }, [location.pathname]);

    const handleParentClick = (item) => {
        if (item.children) setOpenDropdown(prev => prev === item.label ? null : item.label);
        else { navigate(item.path); setOpenDropdown(null); }
    };

    // === CHỈNH SỬA: Logout được xử lý đúng cách ===
    const handleLogout = async () => {
        try {
            await logoutApi(); // Gọi API logout (backend trả 200 dù không làm gì)
            toast.success("Đăng xuất thành công!");
        } catch (error) {
            // Bỏ qua lỗi nếu có (vẫn tiếp tục xóa local)
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.clear();
            navigate("/");
        }
    };

    return (
        <aside
            className={`h-screen z-20 transition-all duration-300 ${open ? "w-64" : "w-28"} backdrop-blur-xl border-r border-[#F7DFA8]/30 text-[#FAF4E5]`}
            style={{
                background: "linear-gradient(to bottom, #5B0704 0%, #840101 50%, #B40001 60%, #e5cfb5 100%)"
            }}
        >
            {/* LOGO */}
            <div className="flex items-center justify-between px-4 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7DFA8]/20 border border-[#F7DFA8]/40 flex items-center justify-center font-bold text-[#F7DFA8] shadow-[0_0_20px_rgba(247,223,168,0.45)]">
                        VL
                    </div>
                    {open && <span className="font-semibold text-lg">VanLang Admin</span>}
                </div>
                <button onClick={() => setOpen(!open)} className="p-2 rounded-lg text-[#F7DFA8] hover:bg-[#F7DFA8]/20 cursor-pointer">
                    <FaBars />
                </button>
            </div>

            {/* MENU */}
            <ul className="mt-6 flex flex-col gap-3 px-2">
                {menuItems.map((item, idx) => {
                    const isParentActive = location.pathname === item.path;
                    const isChildActive = item.children?.some(c => c.path === location.pathname);
                    const isOpen = openDropdown === item.label;

                    return (
                        <li key={idx}>
                            {/* ITEM CHA */}
                            <div
                                onClick={() => handleParentClick(item)}
                                className={`
                  flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer
                  transition-all duration-300
                  hover:bg-[#F7DFA8]/15
                  ${isParentActive
                                        ? "bg-gradient-to-r from-[#F7DFA8] to-[#E3CD9C] text-[#4B0503] shadow-[0_0_25px_rgba(247,223,168,0.6)]"
                                        : isChildActive
                                            ? "bg-white/20 text-[#FAF4E5] shadow-[0_0_12px_rgba(247,223,168,0.25)]"
                                            : ""
                                    }
                `}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{item.icon}</span>
                                    {open && <span className="font-medium">{item.label}</span>}
                                </div>
                                {item.children && open && (
                                    <FaChevronDown className={`text-sm transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                )}
                            </div>

                            {/* ITEM CON */}
                            {item.children && open && (
                                <ul className={`flex flex-col gap-1 mt-2 overflow-hidden transition-[max-height] duration-300 ${isOpen ? "max-h-80" : "max-h-0"}`}>
                                    {item.children.map((child, cIdx) => {
                                        const activeChild = location.pathname === child.path;
                                        return (
                                            <li key={cIdx} onClick={() => { navigate(child.path); setOpenDropdown(null); }} className="cursor-pointer">
                                                <div className={`
                          flex items-center gap-2 px-4 py-2.5 mx-4 mt-1 rounded-xl transition-all duration-300
                          border border-[#F7DFA8]/30
                          ${activeChild
                                                        ? "bg-[#F7DFA8] text-[#4B0503] shadow-[0_0_25px_rgba(247,223,168,0.6)] border-transparent"
                                                        : "bg-[#4B0503]/30 text-[#FAF4E5] :hoverbg-[#F7DFA8]/15 hover:shadow-[0_0_16px_rgba(247,223,168,0.35)]"
                                                    }
                        `}>
                                                    <span className={`w-2 h-2 rounded-full ${activeChild ? "bg-[#4B0503]" : "bg-[#F7DFA8]"}`} />
                                                    <span className={`flex-1 ${activeChild ? "font-semibold" : ""}`}>{child.label}</span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>

            {/* LOGOUT */}
            <ul className="mt-auto flex flex-col gap-3 px-2 mb-4">
                <li>
                    <div
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
                            transition-all duration-300
                            hover:bg-[#F7DFA8]/15 text-[#FAF4E5]
                        `}
                    >
                        <FaSignOutAlt className="text-lg" />
                        {open && <span className="font-medium">Đăng xuất</span>}
                    </div>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;