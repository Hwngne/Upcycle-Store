import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { changePasswordApi } from "@/services/auth.service";

const ChangePasswordPage = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const inputClass = (error) =>
        `w-full px-5 py-3 rounded-xl
     bg-[#E3CD9C]/20
     border border-[#EAE4CD]/40
     placeholder-[#F7DFA8]/60 italic
     focus:outline-none focus:ring-2 focus:ring-[#F7DFA8]
     transition
     ${error ? "border-red-600" : ""}
     pr-12`;

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};
        if (!oldPassword) newErrors.oldPassword = "Vui lòng nhập mật khẩu cũ";
        if (!newPassword) newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        if (newPassword && newPassword.length < 8)
            newErrors.newPassword = "Mật khẩu mới phải ít nhất 8 ký tự";
        if (newPassword !== confirmPassword)
            newErrors.confirmPassword = "Xác nhận mật khẩu không khớp";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setLoading(true);
            await changePasswordApi({ old_password: oldPassword, new_password: newPassword });
            alert("Đổi mật khẩu thành công!");
            navigate("/homepage");
        } catch (err) {
            setErrors({
                oldPassword: err.response?.data?.message || "Lỗi hệ thống",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative min-h-screen w-full bg-cover bg-center overflow-hidden"
            style={{ backgroundImage: "url('/Login_Bg.jpg')" }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 backdrop-blur-sm"></div>
            <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-400/40 to-purple-500/30 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-pink-400/30 to-purple-600/20 blur-3xl animate-pulse"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6">
                <form
                    onSubmit={handleSubmit}
                    className="
            w-full max-w-md
            bg-[#FAF4E5]/20 backdrop-blur-2xl
            border border-[#EAE4CD]/30
            rounded-3xl
            shadow-[0_8px_32px_rgba(0,0,0,0.25)]
            p-10
            text-[#4B0503]
            flex flex-col
            gap-6
            animate-fadeUp
            transition-all duration-500
            hover:shadow-[0_0_60px_rgba(99,102,241,0.5)]
          "
                >
                    <h1 className="text-4xl font-bold text-center drop-shadow-md">
                        Đổi mật khẩu
                    </h1>
                    <p className="text-center text-[#4B0503]/70 italic">
                        Hệ thống quản lý CLB – Sinh viên
                    </p>

                    {/* Mật khẩu cũ */}
                    <div className="flex flex-col gap-1 relative">
                        <input
                            type={showOld ? "text" : "password"}
                            placeholder="Mật khẩu cũ"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className={inputClass(errors.oldPassword)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowOld(!showOld)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B0503]/60 hover:text-[#4B0503] cursor-pointer"
                        >
                            {showOld ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.oldPassword && (
                            <span className="text-red-600 text-sm">{errors.oldPassword}</span>
                        )}
                    </div>

                    {/* Mật khẩu mới */}
                    <div className="flex flex-col gap-1 relative">
                        <input
                            type={showNew ? "text" : "password"}
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClass(errors.newPassword)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B0503]/60 hover:text-[#4B0503] cursor-pointer"
                        >
                            {showNew ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.newPassword && (
                            <span className="text-red-600 text-sm">{errors.newPassword}</span>
                        )}
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div className="flex flex-col gap-1 relative">
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClass(errors.confirmPassword)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B0503]/60 hover:text-[#4B0503] cursor-pointer"
                        >
                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.confirmPassword && (
                            <span className="text-red-600 text-sm">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full px-5 py-3 rounded-xl font-semibold
                            flex items-center justify-center gap-2
                            text-white
                            transition-all duration-300
                            transform hover:scale-105
                            cursor-pointer
                            ${loading ? "opacity-70 cursor-not-allowed" : ""}
                        `}
                        style={{
                            background: "linear-gradient(to right, #BE0000 0%, #F7DFA8 100%)",
                        }}
                        onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                            "linear-gradient(to right, #D12B1E 0%, #B40001 50%, #E5CFB5 100%)")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                            "linear-gradient(to right, #BE0000 0%, #F7DFA8 100%)")
                        }
                    >
                        {loading && (
                            <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin shadow-md"></span>
                        )}
                        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </Button>

                    <Button
                        type="button"
                        onClick={() => navigate("/")}
                        className="
                            group
                            relative
                            w-full
                            px-5 py-3
                            rounded-xl
                            font-semibold
                            flex items-center justify-center gap-2
                            text-white
                            transition-all
                            duration-300
                            hover:scale-105
                            active:scale-95
                            shadow-md
                            overflow-hidden
                        "
                        style={{
                            background: "linear-gradient(to right, #5B0704 0%, #A71D0D 50%, #D12B1E 100%)",
                        }}>
                        {/* layer hover */}
                        <span
                            className="
                                absolute inset-0
                                opacity-0
                                group-hover:opacity-100
                                transition-opacity
                                duration-300
                                cursor-pointer
                                "
                            style={{
                                background:
                                    "linear-gradient(to right, #D12B1E 0%, #B40001 50%, #E5CFB5 100%)",
                            }}
                        />

                        {/* text */}
                        <span className="relative z-10">
                            Quay lại Đăng nhập
                        </span>
                    </Button>


                
                    <p className="text-center text-sm text-[#4B0503]/60 mt-4">
                        ©2025 VanLang University
                    </p>

                </form>
            </div>

            <style>
                {`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeUp { animation: fadeUp 0.8s ease-out forwards; }
        `}
            </style>
        </div>
    );
};

export default ChangePasswordPage;
