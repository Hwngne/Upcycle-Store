import api from "./api";

export const getActivityHistoriesApi = () => {
  return api.get("/activity-histories");
};
