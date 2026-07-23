import { apiClient } from "../apiClient";
export const farmerApi = {
  async getProfile() {
    const res = await apiClient.get("/farmers/me");
    return res.data.data;
  },
  async updateProfile(payload) {
    const res = await apiClient.put("/farmers/me", payload);
    return res.data.data;
  }
};