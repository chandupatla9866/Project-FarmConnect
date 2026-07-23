import { apiClient } from "../apiClient";
export const orderApi = {
  async list(params) {
    const res = await apiClient.get("/farmer/orders", {
      params
    });
    return res.data.data;
  },
  async history(params) {
    const res = await apiClient.get("/farmer/orders/history", {
      params
    });
    return res.data.data;
  },
  async get(id) {
    const res = await apiClient.get(`/farmer/orders/${id}`);
    return res.data.data;
  },
  async accept(id) {
    const res = await apiClient.patch(`/farmer/orders/${id}/accept`);
    return res.data.data;
  },
  async reject(id) {
    const res = await apiClient.patch(`/farmer/orders/${id}/reject`);
    return res.data.data;
  },
  async markReadyForPickup(id) {
    const res = await apiClient.patch(`/farmer/orders/${id}/ready-for-pickup`);
    return res.data.data;
  }
};