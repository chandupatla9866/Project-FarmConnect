import { apiClient } from "../apiClient";
function buildFormData(values, image) {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("description", values.description ?? "");
  formData.append("categoryId", values.categoryId);
  formData.append("unit", values.unit);
  formData.append("pricePerUnit", values.pricePerUnit);
  formData.append("quantityAvailable", values.quantityAvailable);
  formData.append("organic", String(values.organic));
  if (values.harvestDate) formData.append("harvestDate", values.harvestDate);
  if (image) formData.append("image", image);
  return formData;
}
export const productApi = {
  async list(params) {
    const res = await apiClient.get("/farmer/products", {
      params
    });
    return res.data.data;
  },
  async get(id) {
    const res = await apiClient.get(`/farmer/products/${id}`);
    return res.data.data;
  },
  async create(values, image) {
    const res = await apiClient.post("/farmer/products", buildFormData(values, image), {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data.data;
  },
  async update(id, values, image) {
    const res = await apiClient.put(`/farmer/products/${id}`, buildFormData(values, image), {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data.data;
  },
  async remove(id) {
    await apiClient.delete(`/farmer/products/${id}`);
  },
  async updateStatus(id, status) {
    const res = await apiClient.patch(`/farmer/products/${id}/status`, {
      status
    });
    return res.data.data;
  }
};