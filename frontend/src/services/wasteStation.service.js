// services/wasteStation.service.js
import api from "./api";

export const getAllWasteStationsApi = () => api.get("/waste-stations");

export const createWasteStationApi = (data) => api.post("/waste-stations", data);

export const updateWasteStationApi = (id, data) => api.put(`/waste-stations/${id}`, data);

export const deleteWasteStationApi = (id) => api.delete(`/waste-stations/${id}`);