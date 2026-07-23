import { apiClient } from "../apiClient";
export const buyerOrderApi = {
  async create(payload) {
    const res = await apiClient.post("/buyer/orders", payload);
    return res.data.data;
  },
  async list(params) {
    const res = await apiClient.get("/buyer/orders", {
      params
    });
    return res.data.data;
  },
  async get(id) {
    const res = await apiClient.get(`/buyer/orders/${id}`);
    return res.data.data;
  },
  async verifyPayment(id, payload) {
    const res = await apiClient.post(`/buyer/orders/${id}/verify-payment`, payload);
    return res.data.data;
  }
};