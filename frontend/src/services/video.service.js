import api from "./api";

export const getAllVideosApi = () => {
    return api.get("/videos");
};

export const createVideoApi = (formData) => {
    return api.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateVideoApi = (id, formData) => {
    return api.put(`/videos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
export const updateVideoStatusApi = (id, status) => {
    return api.patch(`/videos/${id}/status`, { status });
};

export const toggleVideoVisibleApi = (id) => {
    return api.patch(`/videos/${id}/visible`);
};

export const deleteVideoApi = (id) => {
    return api.delete(`/videos/${id}`);
};
