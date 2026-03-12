// src/services/wasteConfig.service.js
import api from "./api";

export const getAllConfigsApi = () => api.get("/waste-config");

export const createConfigApi = (data) => api.post("/waste-config", data);

export const updateConfigApi = (id, data) => api.put(`/waste-config/${id}`, data);

export const deleteConfigApi = (id) => api.delete(`/waste-config/${id}`);