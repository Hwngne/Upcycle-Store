import React, { useState, useRef, useEffect } from "react";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import PageHeader from "@/components/PageHeader";
import StatsBoxes from "@/components/StatsBoxes";
import { FaPlus, FaChevronDown, FaUser, FaEye } from "react-icons/fa";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { MdToggleOn, MdToggleOff } from "react-icons/md";
import CreateStudentAccountModal from "@/components/CreateStudentAccountModal";
import CreateClubAccountModal from "@/components/CreateClubAccountModal";
import CreateAdminAccountModal from "@/components/CreateAdminAccountModal";
import EditAdminAccountModal from "@/components/EditAdminAccountModal";
import EditClubAccountModal from "@/components/EditClubAccountModal";
import EditStudentAccountModal from "@/components/EditStudentAccountModal";
import Pagination from "@/components/Pagination";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import ViewAccountDetailModal from "@/components/ViewAccountDetailModal";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  getAllAccountsApi,
  createAccountApi,
  updateAccountStatusApi,
  deleteAccountApi,
} from "@/services/account.service";

const AccountsPage = () => {
  const [activeTab, setActiveTab] = useState("student");
  const [currentPageStudent, setCurrentPageStudent] = useState(1);
  const [currentPageAdmin, setCurrentPageAdmin] = useState(1);
  const [currentPageClub, setCurrentPageClub] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAccount, setViewingAccount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState({
    students: [],
    admins: [],
    clubs: [],
  });

  // Filter trạng thái riêng cho từng tab
  const [statusFilterStudent, setStatusFilterStudent] = useState("all");
  const [statusFilterAdmin, setStatusFilterAdmin] = useState("all");
  const [statusFilterClub, setStatusFilterClub] = useState("all");

  // === THÊM: Từ khóa tìm kiếm ===
  const [searchQuery, setSearchQuery] = useState("");

  // === THÊM: Filter giới tính cho Sinh viên và Admin ===
  const [genderFilterStudent, setGenderFilterStudent] = useState("all");
  const [genderFilterAdmin, setGenderFilterAdmin] = useState("all");

  const handleView = (account) => {
    setViewingAccount(account);
    setShowViewModal(true);
  };

  const roleRef = useRef(null);
  const statusRef = useRef(null);
  const genderRef = useRef(null); // ref cho dropdown giới tính

  const itemsPerPage = 10;

  const glassGlow = `
    backdrop-blur-md
    bg-white/30
    rounded-2xl
    border border-white/30
    shadow-[0_0_20px_rgba(247,223,168,0.35)]
  `;

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getAllAccountsApi();
      const data = res.data;

      const students = [];
      const admins = [];
      const clubs = [];

      data.forEach((acc) => {
        if (acc.role === "student") students.push(acc);
        else if (acc.role === "admin") admins.push(acc);
        else if (acc.role === "club") clubs.push(acc);
      });

      setAccounts({ students, admins, clubs });
    } catch (err) {
      toast.error("Không thể tải danh sách tài khoản");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Hàm lấy filter hiện tại của tab đang active
  const getCurrentStatusFilter = () => {
    if (activeTab === "student") return statusFilterStudent;
    if (activeTab === "admin") return statusFilterAdmin;
    if (activeTab === "club") return statusFilterClub;
    return "all";
  };

  const getCurrentGenderFilter = () => {
    if (activeTab === "student") return genderFilterStudent;
    if (activeTab === "admin") return genderFilterAdmin;
    return "all";
  };

  // Hàm set filter cho tab hiện tại
  const setCurrentStatusFilter = (value) => {
    if (activeTab === "student") setStatusFilterStudent(value);
    else if (activeTab === "admin") setStatusFilterAdmin(value);
    else if (activeTab === "club") setStatusFilterClub(value);
  };

  const setCurrentGenderFilter = (value) => {
    if (activeTab === "student") setGenderFilterStudent(value);
    else if (activeTab === "admin") setGenderFilterAdmin(value);
  };

  // === THÊM: Hàm tìm kiếm theo tab hiện tại ===
  const searchInData = (data) => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();

    return data.filter((item) => {
      if (activeTab === "student") {
        return (
          (item.student_code || "").toLowerCase().includes(query) ||
          (item.student_name || "").toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query)
        );
      }
      if (activeTab === "admin") {
        return (
          (item.admin_name || "").toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query)
        );
      }
      if (activeTab === "club") {
        return (
          (item.club_info?.club_name || "").toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query)
        );
      }
      return false;
    });
  };

  // Lọc dữ liệu: trạng thái + giới tính + tìm kiếm
  const getFilteredData = (data) => {
    let filtered = data;

    // Filter trạng thái
    const statusFilter = getCurrentStatusFilter();
    if (statusFilter !== "all") {
      filtered = filtered.filter((acc) => acc.status === statusFilter);
    }

    // Filter giới tính (chỉ cho student và admin)
    const genderFilter = getCurrentGenderFilter();
    if (genderFilter !== "all" && (activeTab === "student" || activeTab === "admin")) {
      filtered = filtered.filter((acc) => {
        const gender = activeTab === "student" ? acc.gender : acc.admin_gender;
        return gender === genderFilter;
      });
    }

    // Tìm kiếm
    filtered = searchInData(filtered);

    return filtered;
  };

  const filteredStudents = activeTab === "student" ? getFilteredData(accounts.students) : accounts.students;
  const filteredAdmins = activeTab === "admin" ? getFilteredData(accounts.admins) : accounts.admins;
  const filteredClubs = activeTab === "club" ? getFilteredData(accounts.clubs) : accounts.clubs;

  const totalPagesStudent = Math.ceil(filteredStudents.length / itemsPerPage);
  const totalPagesAdmin = Math.ceil(filteredAdmins.length / itemsPerPage);
  const totalPagesClub = Math.ceil(filteredClubs.length / itemsPerPage);

  const currentStudents = filteredStudents.slice(
    (currentPageStudent - 1) * itemsPerPage,
    currentPageStudent * itemsPerPage
  );

  const currentAdmins = filteredAdmins.slice(
    (currentPageAdmin - 1) * itemsPerPage,
    currentPageAdmin * itemsPerPage
  );

  const currentClubs = filteredClubs.slice(
    (currentPageClub - 1) * itemsPerPage,
    currentPageClub * itemsPerPage
  );

  // Reset trang về 1 khi filter hoặc tìm kiếm thay đổi
  useEffect(() => {
    if (activeTab === "student") setCurrentPageStudent(1);
    else if (activeTab === "admin") setCurrentPageAdmin(1);
    else if (activeTab === "club") setCurrentPageClub(1);
  }, [searchQuery, getCurrentStatusFilter(), genderFilterStudent, genderFilterAdmin]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (roleRef.current && !roleRef.current.contains(e.target)) &&
        (statusRef.current && !statusRef.current.contains(e.target)) &&
        (genderRef.current && !genderRef.current.contains(e.target))
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đóng dropdown khi chuyển tab
  useEffect(() => {
    setOpenDropdown(null);
  }, [activeTab]);

  const handleCreateClick = () => {
    if (activeTab === "student") setShowStudentModal(true);
    else if (activeTab === "admin") setShowAdminModal(true);
    else setShowClubModal(true);
  };

  const handleCreateSuccess = () => {
    toast.success("Tạo tài khoản thành công!");
    fetchAccounts();
  };

  const toggleStatus = async (id) => {
    try {
      const allAccounts = [...accounts.students, ...accounts.admins, ...accounts.clubs];
      const account = allAccounts.find((a) => a._id === id);
      const newStatus = account.status === "active" ? "locked" : "active";

      await updateAccountStatusApi(id, newStatus);
      toast.success(
        newStatus === "locked" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản"
      );
      fetchAccounts();
    } catch (err) {
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  const handleDelete = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await deleteAccountApi(accountToDelete._id);
      toast.success("Xóa tài khoản thành công");
      fetchAccounts();
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể xóa tài khoản";
      toast.error(msg);
    } finally {
      setShowDeleteModal(false);
      setAccountToDelete(null);
    }
  };

  // ===== CHỨC NĂNG CHỈNH SỬA =====
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [showEditClubModal, setShowEditClubModal] = useState(false);

  // ===== CHỨC NĂNG XÓA (DUY NHẤT MỘT LẦN) =====
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const handleEdit = (account) => {
    setSelectedAccount(account);
    if (account.role === "student") {
      setShowEditStudentModal(true);
    } else if (account.role === "admin") {
      setShowEditAdminModal(true);
    } else if (account.role === "club") {
      setShowEditClubModal(true);
    }
  };

  const handleUpdateSuccess = () => {
    fetchAccounts();
  };

  // Hàm lấy text hiển thị trên nút dropdown theo filter hiện tại
  const getFilterText = () => {
    const filter = getCurrentStatusFilter();
    if (filter === "active") return "Còn hoạt động";
    if (filter === "locked") return "Khóa tài khoản";
    return "Lọc theo Trạng thái";
  };

  const getGenderFilterText = () => {
    const filter = getCurrentGenderFilter();
    if (filter === "M") return "Nam";
    if (filter === "F") return "Nữ";
    return "Lọc theo Giới tính";
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0] overflow-x-hidden">
      {/* BACKGROUND BLOBS */}
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-[#F7DFA8]/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] bg-[#BE0000]/25 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[520px] h-[520px] bg-[#F7DFA8]/20 rounded-full blur-3xl" />

      {/* HEADER */}
      <div className="relative z-50 mb-6">
        <PageHeader
          icon={<FaUser />}
          title="Quản lý tài khoản"
          subtitle="Tổng quan hệ thống"
          right={<HeaderWithAvatar />}
        />
      </div>

      {/* STATISTICS */}
      <div className="mb-8 w-full">
        <StatsBoxes
          items={[
            { title: "Sinh viên", value: accounts.students.length, icon: <FaUser /> },
            { title: "Admin", value: accounts.admins.length, icon: <FaUser /> },
            { title: "Câu lạc bộ", value: accounts.clubs.length, icon: <FaUser /> },
          ]}
        />
      </div>

      {/* TAB SWITCH */}
      <div className="flex gap-6 mb-6">
        <button
          onClick={() => setActiveTab("student")}
          className={`px-8 py-3 rounded-t-xl text-base font-medium relative transition-all cursor-pointer ${activeTab === "student" ? "bg-white/80 text-[#4B0503]" : "bg-white/30 text-[#4B0503]/70 hover:bg-white/50"}`}
        >
          Sinh viên
          {activeTab === "student" && (
            <span className="absolute bottom-0 left-0 w-full h-1 rounded-b-xl"
              style={{ background: "linear-gradient(to right, #D12B1E 0%, #E5CFB5 100%)" }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("admin")}
          className={`px-8 py-3 rounded-t-xl text-base font-medium relative transition-all cursor-pointer ${activeTab === "admin" ? "bg-white/80 text-[#4B0503]" : "bg-white/30 text-[#4B0503]/70 hover:bg-white/50"}`}
        >
          Admin
          {activeTab === "admin" && (
            <span className="absolute bottom-0 left-0 w-full h-1 rounded-b-xl"
              style={{ background: "linear-gradient(90deg, #F7DFA8 0%, #D12B1E 100%)" }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("club")}
          className={`px-8 py-3 rounded-t-xl text-base font-medium relative transition-all cursor-pointer ${activeTab === "club" ? "bg-white/80 text-[#4B0503]" : "bg-white/30 text-[#4B0503]/70 hover:bg-white/50"}`}
        >
          Câu lạc bộ
          {activeTab === "club" && (
            <span className="absolute bottom-0 left-0 w-full h-1 rounded-b-xl"
              style={{ background: "linear-gradient(to right, #5B0704 0%, #D12B1E 100%)" }}
            />
          )}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <section className={`${glassGlow} p-8 w-full relative z-10`}>
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* DROPDOWN LỌC TRẠNG THÁI */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm hover:bg-white/40 transition"
              >
                {getFilterText()}
                <FaChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${openDropdown === "status" ? "rotate-180" : ""}`}
                />
              </button>

              {openDropdown === "status" && (
                <div className="absolute mt-2 w-56 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50">
                  <ul className="text-[#4B0503]">
                    {[
                      { label: "Tất cả", value: "all" },
                      { label: "Còn hoạt động", value: "active" },
                      { label: "Khóa tài khoản", value: "locked" },
                    ].map((item) => (
                      <li
                        key={item.value}
                        className={`px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition ${getCurrentStatusFilter() === item.value ? "bg-[#F7DFA8]/30" : ""}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setCurrentStatusFilter(item.value);
                          setOpenDropdown(null);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* === THÊM: DROPDOWN LỌC GIỚI TÍNH (chỉ hiện ở tab Sinh viên và Admin) === */}
            {(activeTab === "student" || activeTab === "admin") && (
              <div className="relative" ref={genderRef}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === "gender" ? null : "gender")}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm hover:bg-white/40 transition"
                >
                  {getGenderFilterText()}
                  <FaChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${openDropdown === "gender" ? "rotate-180" : ""}`}
                  />
                </button>

                {openDropdown === "gender" && (
                  <div className="absolute mt-2 w-56 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg z-50">
                    <ul className="text-[#4B0503]">
                      {[
                        { label: "Tất cả", value: "all" },
                        { label: "Nam", value: "M" },
                        { label: "Nữ", value: "F" },
                      ].map((item) => (
                        <li
                          key={item.value}
                          className={`px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition ${getCurrentGenderFilter() === item.value ? "bg-[#F7DFA8]/30" : ""}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCurrentGenderFilter(item.value);
                            setOpenDropdown(null);
                          }}
                        >
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* THANH TÌM KIẾM - BÂY GIỜ HOẠT ĐỘNG */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "student"
                  ? "Tìm kiếm MSSV, tên hoặc email..."
                  : activeTab === "admin"
                    ? "Tìm kiếm tên hoặc email admin..."
                    : "Tìm kiếm tên CLB hoặc email..."
              }
              className="px-4 py-2 rounded-md bg-white/30 text-sm outline-none text-[#4B0503] backdrop-blur-md border border-white/30 shadow-sm w-72"
            />
          </div>

          <motion.button
            onClick={handleCreateClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition cursor-pointer"
            style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
          >
            <FaPlus /> Tạo tài khoản
          </motion.button>
        </div>

        {/* TAB SINH VIÊN */}
        {activeTab === "student" && (
          <>
            <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-x-auto">
              {currentStudents.length === 0 ? (
                <div className="text-center py-10 text-[#4B0503]/70 text-lg">
                  Hiện không có dữ liệu
                </div>
              ) : (
                <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-3">
                  <thead>
                    <tr className="text-[#4B0503]/80 text-center">
                      <th className="py-3 px-4 w-[60px]">STT</th>
                      <th className="py-3 px-4">MSSV</th>
                      <th className="py-3 px-4 text-left">Tên</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4">Giới tính</th>
                      <th className="py-3 px-4 w-35">Vai trò</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((a, index) => (
                      <tr key={a._id} className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]">
                        <td className="py-4 px-4 text-center">
                          {(currentPageStudent - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="py-4 px-4 text-center">{a.student_code || "-"}</td>
                        <td className="py-4 px-4 font-semibold text-left">{a.student_name || "-"}</td>
                        <td className="py-4 px-4 text-left break-all">{a.email}</td>
                        <td className="py-4 px-4 text-center">
                          {a.gender === "M" ? "Nam" : a.gender === "F" ? "Nữ" : "-"}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md"
                            style={{ background: "linear-gradient(90deg, #D12B1E 0%, #E5CFB5 100%)" }}
                          >
                            Sinh viên
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button onClick={() => toggleStatus(a._id)}>
                            {a.status === "active" ? (
                              <MdToggleOn className="text-green-500 text-[50px] hover:scale-110 transition-transform mx-auto" />
                            ) : (
                              <MdToggleOff className="text-gray-400 text-[50px] hover:scale-110 transition-transform mx-auto" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center gap-3">
                            <HiOutlinePencil onClick={() => handleEdit(a)} className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl" />
                            <HiOutlineTrash onClick={() => handleDelete(a)} className="text-red-600 cursor-pointer hover:scale-110 transition text-2xl" />
                            <button
                              onClick={() => handleView(a)}
                              className="p-2 -mt-1 rounded-md bg-white/30 hover:bg-white/40 shadow-sm transition"
                            >
                              <FaEye className="text-[#4B0503]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {currentStudents.length > 0 && (
              <Pagination currentPage={currentPageStudent} totalPages={totalPagesStudent} setCurrentPage={setCurrentPageStudent} />
            )}
          </>
        )}

        {/* TAB ADMIN */}
        {activeTab === "admin" && (
          <>
            <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-x-auto">
              {currentAdmins.length === 0 ? (
                <div className="text-center py-10 text-[#4B0503]/70 text-lg">
                  Hiện không có dữ liệu
                </div>
              ) : (
                <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-3">
                  <thead>
                    <tr className="text-[#4B0503]/80 text-center">
                      <th className="py-3 px-4 w-[60px]">STT</th>
                      <th className="py-3 px-4 text-left">Tên</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4">Giới tính</th>
                      <th className="py-3 px-4">Số điện thoại</th>
                      <th className="py-3 px-4 w-35">Vai trò</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAdmins.map((a, index) => (
                      <tr key={a._id} className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]">
                        <td className="py-4 px-4 text-center">
                          {(currentPageAdmin - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="py-4 px-4 font-semibold text-left">{a.admin_name || "-"}</td>
                        <td className="py-4 px-4 text-left break-all">{a.email}</td>
                        <td className="py-4 px-4 text-center">
                          {a.admin_gender === "M" ? "Nam" : a.admin_gender === "F" ? "Nữ" : "-"}
                        </td>
                        {/* <td className="py-4 px-4 text-center">{a.admin_phone || "-"}</td> */}
                        <td className="py-4 px-4 text-center">
                          {a.phone_number || a.admin_phone || "-"}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md"
                            style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                          >
                            Admin
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button onClick={() => toggleStatus(a._id)}>
                            {a.status === "active" ? (
                              <MdToggleOn className="text-green-500 text-[50px] hover:scale-110 transition-transform mx-auto" />
                            ) : (
                              <MdToggleOff className="text-gray-400 text-[50px] hover:scale-110 transition-transform mx-auto" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center gap-3">
                            <HiOutlinePencil onClick={() => handleEdit(a)} className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl" />
                            <HiOutlineTrash className="text-red-300 text-2xl opacity-50 cursor-not-allowed" title="Không thể xóa tài khoản admin" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {currentAdmins.length > 0 && (
              <Pagination currentPage={currentPageAdmin} totalPages={totalPagesAdmin} setCurrentPage={setCurrentPageAdmin} />
            )}
          </>
        )}

        {/* TAB CÂU LẠC BỘ */}
        {activeTab === "club" && (
          <>
            <div className="w-full rounded-2xl bg-white/30 backdrop-blur-md shadow-md p-4 overflow-x-auto">
              {currentClubs.length === 0 ? (
                <div className="text-center py-10 text-[#4B0503]/70 text-lg">
                  Hiện không có dữ liệu
                </div>
              ) : (
                <table className="w-full table-auto text-sm border-separate border-spacing-x-3 border-spacing-y-3">
                  <thead>
                    <tr className="text-[#4B0503]/80 text-center">
                      <th className="py-3 px-4 w-[60px]">STT</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Tên câu lạc bộ</th>
                      <th className="py-3 px-4">Số thành viên</th>

                      <th className="py-3 px-4 w-35">Vai trò</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClubs.map((c, index) => (
                      <tr key={c._id} className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl shadow-sm text-[#4B0503]">
                        <td className="py-4 px-4 text-center">
                          {(currentPageClub - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="py-4 px-4 text-left break-all">{c.email}</td>
                        <td className="py-4 px-4 font-semibold text-left">{c.club_info?.club_name || "-"}</td>
                        <td className="py-4 px-4 text-center">{c.club_info?.member_count || 0} thành viên</td>

                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-4 py-1 text-[13px] font-semibold text-white rounded-md"
                            style={{ background: "linear-gradient(90deg, #5B0704 0%, #D12B1E 100%)" }}
                          >
                            Câu lạc bộ
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button onClick={() => toggleStatus(c._id)}>
                            {c.status === "active" ? (
                              <MdToggleOn className="text-green-500 text-[50px] hover:scale-110 transition-transform mx-auto" />
                            ) : (
                              <MdToggleOff className="text-gray-400 text-[50px] hover:scale-110 transition-transform mx-auto" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center gap-3">
                            <HiOutlinePencil onClick={() => handleEdit(c)} className="text-green-600 cursor-pointer hover:scale-110 transition text-2xl" />
                            <HiOutlineTrash onClick={() => handleDelete(c)} className="text-red-600 cursor-pointer hover:scale-110 transition text-2xl" />
                            <button
                              onClick={() => handleView(c)}
                              className="p-2 -mt-1 rounded-md bg-white/30 hover:bg-white/40 shadow-sm transition"
                            >
                              <FaEye className="text-[#4B0503]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {currentClubs.length > 0 && (
              <Pagination currentPage={currentPageClub} totalPages={totalPagesClub} setCurrentPage={setCurrentPageClub} />
            )}
          </>
        )}
      </section>

      {/* MODALS TẠO MỚI */}
      {/* <CreateStudentAccountModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onSubmit={async (data) => {
          try {
            await createAccountApi({ ...data, role: "student" });
            handleCreateSuccess();
            setShowStudentModal(false);
          } catch (err) {
            toast.error("Tạo tài khoản thất bại");
          }
        }}
      /> */}

      <CreateStudentAccountModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onSubmit={async (data) => {
          await createAccountApi({ ...data, role: "student" });
          handleCreateSuccess();
          setShowStudentModal(false);
        }}
      />
      
      {/* <CreateAdminAccountModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSubmit={async (data) => {
          try {
            await createAccountApi({ ...data, role: "admin" });
            handleCreateSuccess();
            setShowAdminModal(false);
          } catch (err) {
            toast.error("Tạo tài khoản thất bại");
          }
        }}
      /> */}
      <CreateAdminAccountModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSubmit={async (data) => {
          await createAccountApi({ ...data, role: "admin" });
          handleCreateSuccess();
          setShowAdminModal(false);
        }}
      />

      <CreateClubAccountModal
        isOpen={showClubModal}
        onClose={() => setShowClubModal(false)}
        onSubmit={async (data) => {
          try {
            await createAccountApi({ ...data, role: "club" });
            handleCreateSuccess();
            setShowClubModal(false);
          } catch (err) {
            toast.error("Tạo tài khoản thất bại");
          }
        }}
      />

      {/* MODALS CHỈNH SỬA */}
      <EditStudentAccountModal
        isOpen={showEditStudentModal}
        onClose={() => {
          setShowEditStudentModal(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <EditAdminAccountModal
        isOpen={showEditAdminModal}
        onClose={() => {
          setShowEditAdminModal(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <EditClubAccountModal
        isOpen={showEditClubModal}
        onClose={() => {
          setShowEditClubModal(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* MODAL XÁC NHẬN XÓA */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAccountToDelete(null);
        }}
        onConfirm={confirmDelete}
        itemName={
          accountToDelete?.student_name ||
          accountToDelete?.admin_name ||
          accountToDelete?.club_info?.club_name ||
          accountToDelete?.email
        }
        itemType="tài khoản"
        actionText="Xóa tài khoản"
      />

      {/* MODAL XEM CHI TIẾT */}
      <ViewAccountDetailModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingAccount(null);
        }}
        account={viewingAccount}
      />
    </div>
  );
};

export default AccountsPage;