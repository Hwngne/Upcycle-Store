import api from "./api.js";

// Lấy tất cả tài khoản
export const getAllAccountsApi = () => {
    return api.get("/accounts");
};

// Tạo tài khoản
export const createAccountApi = (data) => {
    return api.post("/accounts", data);
};

//Cập nhật thông tin tài khoản
export const updateAccountApi = (id, data) => {
    return api.put(`/accounts/${id}`, data);
};

// Cập nhật trạng thái (lock/unlock)
export const updateAccountStatusApi = (id, status) => {
    return api.put(`/accounts/${id}`, { status });
};

// Xóa tài khoản (soft delete)
export const deleteAccountApi = (id) => {
    return api.delete(`/accounts/${id}`);
};

// Lấy thông tin cá nhân của người dùng hiện tại
export const getMyProfileApi = async () => {
    return await api.get("/accounts/me");
};

// Cập nhật profile của chính mình
export const updateMyProfileApi = (data) => {
    return api.put("/accounts/me", data);
};

// src/services/account.service.js (thêm hàm mới)
export const updateAvatarApi = async (formData) => {
    const token = localStorage.getItem("token"); // hoặc cách lấy token của bạn
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts/me/avatar`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cập nhật avatar thất bại");
    return data;
};

// Lấy bảng xếp hạng
export const getLeaderboardApi = () => {
    return api.get("/accounts/leaderboard");
};

export const getChartDataApi = (days = 30) => {
  return api.get(`/admin/stats/chart?days=${days}`);
};