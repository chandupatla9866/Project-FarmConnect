import { apiClient } from "../apiClient";
export const reviewApi = {
  async create(payload) {
    const res = await apiClient.post("/buyer/reviews", payload);
    return res.data.data;
  },
  async listForFarmer(params) {
    const res = await apiClient.get("/farmer/reviews", {
      params
    });
    return res.data.data;
  }
};