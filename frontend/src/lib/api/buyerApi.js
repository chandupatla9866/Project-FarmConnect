import { apiClient } from "../apiClient";
export const buyerApi = {
  async getProfile() {
    const res = await apiClient.get("/buyers/me");
    return res.data.data;
  },
  async updateProfile(payload) {
    const res = await apiClient.put("/buyers/me", payload);
    return res.data.data;
  }
};