import { apiClient } from "../apiClient";
export const buyerBrowseApi = {
  async products(params) {
    const res = await apiClient.get("/buyer/products", {
      params
    });
    return res.data.data;
  },
  async product(id) {
    const res = await apiClient.get(`/buyer/products/${id}`);
    return res.data.data;
  },
  async farmers(params) {
    const res = await apiClient.get("/buyer/farmers", {
      params
    });
    return res.data.data;
  },
  async farmer(id) {
    const res = await apiClient.get(`/buyer/farmers/${id}`);
    return res.data.data;
  }
};