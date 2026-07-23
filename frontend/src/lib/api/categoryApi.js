import { apiClient } from "../apiClient";
export const categoryApi = {
  async list() {
    const res = await apiClient.get("/categories");
    return res.data.data;
  }
};