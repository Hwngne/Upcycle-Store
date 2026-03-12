import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginApi, meApi } from "@/services/auth.service";


const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = { email: "", password: "" };
        if (!email) newErrors.email = "Vui lòng nhập email";
        if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
        setErrors(newErrors);

        if (newErrors.email || newErrors.password) return;

        try {
            setLoading(true);

            // 1. Login
            const res = await loginApi({ email, password });
            // const { token } = res.data.data;

            // localStorage.setItem("token", token);
            const { accessToken } = res.data.data;
            localStorage.setItem("token", accessToken); // vẫn dùng tên "token" để không phải sửa nhiều nơi

            // 2. Lấy thông tin user
            const meRes = await meApi();
            localStorage.setItem("user", JSON.stringify(meRes.data));

            // 3. Điều hướng
            if (meRes.data.change_password) {
                // đánh dấu là đăng nhập lần đầu
                sessionStorage.setItem("isFirstLogin", "true");

                navigate("/change-password", {
                    state: { fromLogin: true },
                });
            } else {
                sessionStorage.removeItem("isFirstLogin");
                navigate("/homepage");
            }




        } catch (err) {
            setErrors({
                email: "Email hoặc mật khẩu không đúng",
                password: "",
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
                        Đăng nhập
                    </h1>
                    <p className="text-center text-[#4B0503]/70 italic">
                        Hệ thống quản lý CLB – Sinh viên
                    </p>

                    <div className="flex flex-col gap-1">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`
                                w-full px-5 py-3 rounded-xl
                                bg-[#E3CD9C]/20
                                border border-[#EAE4CD]/40
                                placeholder-[#F7DFA8]/60 italic
                                focus:outline-none focus:ring-2 focus:ring-[#F7DFA8]
                                transition
                                ${errors.email ? "border-red-600" : ""}
                            `}
                        />
                        {errors.email && (
                            <span className="text-red-600 text-sm">{errors.email}</span>
                        )}
                    </div>

                    {/* Password input with toggle */}
                    <div className="flex flex-col gap-1 relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`
                                w-full px-5 py-3 rounded-xl
                                bg-[#E3CD9C]/20
                                border border-[#EAE4CD]/40
                                placeholder-[#F7DFA8]/60 italic
                                focus:outline-none focus:ring-2 focus:ring-[#F7DFA8]
                                transition
                                ${errors.password ? "border-red-600" : ""}
                                pr-12
                            `}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#4B0503]/60 hover:text-[#4B0503]"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.password && (
                            <span className="text-red-600 text-sm">{errors.password}</span>
                        )}
                    </div>

                
                    <Button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full px-5 py-3 rounded-xl font-semibold
                            flex items-center justify-center gap-2
                            text-white
                            cursor-pointer
                            transition-all duration-300
                            transform hover:scale-105
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
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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

export default LoginPage;
