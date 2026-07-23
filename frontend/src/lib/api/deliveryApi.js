import { apiClient } from "../apiClient";
export const deliveryApi = {
  async available(params) {
    const res = await apiClient.get("/delivery/available", {
      params
    });
    return res.data.data;
  },
  async mine(params) {
    const res = await apiClient.get("/delivery/mine", {
      params
    });
    return res.data.data;
  },
  async history(params) {
    const res = await apiClient.get("/delivery/history", {
      params
    });
    return res.data.data;
  },
  async earnings() {
    const res = await apiClient.get("/delivery/earnings");
    return res.data.data;
  },
  async get(id) {
    const res = await apiClient.get(`/delivery/${id}`);
    return res.data.data;
  },
  async claim(id) {
    const res = await apiClient.patch(`/delivery/${id}/claim`);
    return res.data.data;
  },
  async markPickedUp(id) {
    const res = await apiClient.patch(`/delivery/${id}/picked-up`);
    return res.data.data;
  },
  async complete(id, otp) {
    const res = await apiClient.patch(`/delivery/${id}/complete`, {
      otp
    });
    return res.data.data;
  },
  async getProfile() {
    const res = await apiClient.get("/delivery/me");
    return res.data.data;
  },
  async updateProfile(payload) {
    const res = await apiClient.put("/delivery/me", payload);
    return res.data.data;
  }
};