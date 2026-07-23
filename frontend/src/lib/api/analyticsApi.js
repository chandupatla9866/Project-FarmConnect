import { apiClient } from "../apiClient";
export const analyticsApi = {
  async summary() {
    const res = await apiClient.get("/farmer/analytics/summary");
    return res.data.data;
  },
  async revenueTrend(range) {
    const res = await apiClient.get("/farmer/analytics/revenue-trend", {
      params: {
        range
      }
    });
    return res.data.data;
  },
  async topProducts(limit = 5) {
    const res = await apiClient.get("/farmer/analytics/top-products", {
      params: {
        limit
      }
    });
    return res.data.data;
  }
};