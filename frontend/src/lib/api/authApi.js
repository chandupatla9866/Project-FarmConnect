import { apiClient } from "../apiClient";
export const authApi = {
  async register(payload) {
    const res = await apiClient.post("/auth/register", payload);
    return res.data.data;
  },
  async login(payload) {
    const res = await apiClient.post("/auth/login", payload);
    return res.data.data;
  },
  async me() {
    const res = await apiClient.get("/auth/me");
    return res.data.data;
  },
  async selectRole(onboardingToken, payload) {
    const res = await apiClient.post("/auth/select-role", payload, {
      headers: {
        Authorization: `Bearer ${onboardingToken}`
      }
    });
    return res.data.data;
  }
};