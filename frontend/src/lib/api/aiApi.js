import { apiClient } from "../apiClient";
export const aiApi = {
  async predictDemand(payload) {
    const res = await apiClient.post("/ai/demand-prediction", payload);
    return res.data.data;
  },
  async recommendCrop(payload) {
    const res = await apiClient.post("/ai/crop-recommendation", payload);
    return res.data.data;
  },
  async predictPrice(payload) {
    const res = await apiClient.post("/ai/price-prediction", payload);
    return res.data.data;
  },
  async detectDisease(image) {
    const formData = new FormData();
    formData.append("image", image);
    const res = await apiClient.post("/ai/disease-detection", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data.data;
  },
  async weatherAlerts(lat, lon) {
    const res = await apiClient.get("/ai/weather-alerts", {
      params: lat != null && lon != null ? {
        lat,
        lon
      } : undefined
    });
    return res.data.data;
  },
  async history(params) {
    const res = await apiClient.get("/ai/history", {
      params
    });
    return res.data.data;
  }
};