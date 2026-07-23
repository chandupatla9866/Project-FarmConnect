import { apiClient } from "../apiClient";
export const favoriteApi = {
  async list(params) {
    const res = await apiClient.get("/buyer/favorites", {
      params
    });
    return res.data.data;
  },
  async add(productId) {
    await apiClient.post(`/buyer/favorites/${productId}`);
  },
  async remove(productId) {
    await apiClient.delete(`/buyer/favorites/${productId}`);
  }
};