// import axios from "axios";

// const api = axios.create({
//     baseURL: "http://localhost:5001/api", 
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// // ===== LOGIN =====
// export const loginApi = (data) => {
//     return api.post("/auth/login", {
//         email: data.email.toLowerCase().trim(),
//         password: data.password,
//     });
// };

// // ===== ME =====
// export const meApi = () => {
//     const token = localStorage.getItem("token");

//     return api.get("/auth/me", {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     });
// };

// // ===== LOGOUT =====
// export const logoutApi = () => {
//     const token = localStorage.getItem("token");

//     return api.post(
//         "/auth/logout",
//         {},
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         }
//     );
// };

// // ===== CHANGE PASSWORD =====
// export const changePasswordApi = (data) => {
//     const token = localStorage.getItem("token");
//     return api.post(
//         "/auth/change-password",
//         {
//             old_password: data.old_password,
//             new_password: data.new_password,
//         },
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         }
//     );
// };

// src/services/auth.service.js
import api from "./api.js"; // ← Import cùng thư mục services

// ===== LOGIN =====
export const loginApi = (data) => {
    return api.post("/auth/login", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
    });
};

// ===== ME =====
export const meApi = () => {
    return api.get("/auth/me");
};

// ===== LOGOUT ===== (giữ lại để gọi nếu muốn, backend không làm gì cũng được)
export const logoutApi = () => {
    return api.post("/auth/logout");
};

// ===== CHANGE PASSWORD =====
export const changePasswordApi = (data) => {
    return api.post("/auth/change-password", {
        old_password: data.old_password,
        new_password: data.new_password,
    });
};