import api from "./api";

export const getActivitiesApi = () => {
  return api.get("/admin/activities");
};

export const updateActivityPointApi = (id, data) => {
  return api.put(`/admin/activities/${id}`, data);
};