// services/eventrequest.service.js
import api from "./api";

export const getEventRequests = () => {
  return api.get("/event-requests");
};

export const updateEventStatus = (id, status) =>{
  return api.patch(`/event-requests/${id}/status`, {
    status,
  });
};

export const getPromotions = () =>
  api.get("/event-promotions");

export const updatePromotionStatus = (id, promotionStatus) =>
  api.patch(`/event-promotions/${id}/status`, { promotionStatus });

export const getEventStats = (month, year) => {
  return api.get("/event-stats", {
    params: { month, year }
  });
};

export const getUpcomingApprovedEventApi = ()=>{
  return api.get("/upcoming-approved-events");
};