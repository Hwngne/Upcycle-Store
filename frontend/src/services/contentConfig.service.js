import api from "./api";

export const getAllContentConfigsApi = ()  => api.get("/content-config");

export const createContentConfigApi = (data) => api.post("/content-config", data);

// export const updateContentConfigApi = (id, data) => api.put(`/content-config/${id}`, data);

// export const deleteContentConfigApi = (id, data) => api.delete(`/content-config/${id}`);

// src/services/contentConfig.service.js (bổ sung)

export const updateContentConfigApi = async (id, data) => {
    const res = await api.put(`/content-config/${id}`, data);
    return res.data;
};

export const deleteContentConfigApi = async (id) => {
    const res = await api.delete(`/content-config/${id}`);
    return res.data;
};