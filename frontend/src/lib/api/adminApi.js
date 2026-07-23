import { apiClient } from "../apiClient";
export const adminApi = {
  async farmers(params) {
    const res = await apiClient.get("/admin/farmers", {
      params
    });
    return res.data.data;
  },
  async farmerDetail(id) {
    const res = await apiClient.get(`/admin/farmers/${id}`);
    return res.data.data;
  },
  async setFarmerVerified(id, verified) {
    const res = await apiClient.patch(`/admin/farmers/${id}/verify`, {
      verified
    });
    return res.data.data;
  },
  async setFarmerEnabled(id, enabled) {
    const res = await apiClient.patch(`/admin/farmers/${id}/enabled`, {
      enabled
    });
    return res.data.data;
  },
  async deliveryPartners(params) {
    const res = await apiClient.get("/admin/delivery-partners", {
      params
    });
    return res.data.data;
  },
  async setDeliveryPartnerApproved(id, approved) {
    const res = await apiClient.patch(`/admin/delivery-partners/${id}/approve`, {
      approved
    });
    return res.data.data;
  },
  async setDeliveryPartnerEnabled(id, enabled) {
    const res = await apiClient.patch(`/admin/delivery-partners/${id}/enabled`, {
      enabled
    });
    return res.data.data;
  },
  async buyers(params) {
    const res = await apiClient.get("/admin/buyers", {
      params
    });
    return res.data.data;
  },
  async setBuyerEnabled(id, enabled) {
    const res = await apiClient.patch(`/admin/buyers/${id}/enabled`, {
      enabled
    });
    return res.data.data;
  },
  async products(params) {
    const res = await apiClient.get("/admin/products", {
      params
    });
    return res.data.data;
  },
  async setProductStatus(id, status) {
    const res = await apiClient.patch(`/admin/products/${id}/status`, {
      status
    });
    return res.data.data;
  },
  async orders(params) {
    const res = await apiClient.get("/admin/orders", {
      params
    });
    return res.data.data;
  },
  async deliveries(params) {
    const res = await apiClient.get("/admin/deliveries", {
      params
    });
    return res.data.data;
  },
  async analyticsSummary() {
    const res = await apiClient.get("/admin/analytics/summary");
    return res.data.data;
  },
  async revenueTrend(range) {
    const res = await apiClient.get("/admin/analytics/revenue-trend", {
      params: {
        range
      }
    });
    return res.data.data;
  },
  async topFarmers(limit = 5) {
    const res = await apiClient.get("/admin/analytics/top-farmers", {
      params: {
        limit
      }
    });
    return res.data.data;
  },
  async getProfile() {
    const res = await apiClient.get("/admin/me");
    return res.data.data;
  },
  async updateProfile(payload) {
    const res = await apiClient.put("/admin/me", payload);
    return res.data.data;
  }
};