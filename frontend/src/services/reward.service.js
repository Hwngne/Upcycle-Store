import api from "./api";

/* ================= GIFTS ================= */
export const getAllGiftsApi = () => {
    return api.get("/rewards/gifts");
};

export const createGiftApi = (formData) => {
    return api.post("/rewards/gifts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateGiftApi = (id, formData) => {
    return api.put(`/rewards/gifts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const deleteGiftApi = (id) => {
    return api.delete(`/rewards/gifts/${id}`);
};

/* ================= EXCHANGE ================= */
export const exchangeGiftApi = (giftId) => {
    return api.post("/rewards/exchange", { giftId });
};

/* ================= REWARDS (ADMIN) ================= */
export const getAllRewardsApi = () => {
    return api.get("/rewards/rewards");
};

export const updateRewardStatusApi = (id, status) => {
    return api.patch(`/rewards/rewards/${id}/status`, { status });
};
