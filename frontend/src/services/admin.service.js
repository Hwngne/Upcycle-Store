import api from "./api";

export const getUrgentOverviewApi = () =>{
    return api.get("/admin/alerts/urgent-overview");
};

export const getAccountOverviewApi = () =>{
    return api.get("/accounts/overview");
};

export const getAccountPieStatsApi = async () => {
  return api.get("/accounts/account-pie-stats");
};