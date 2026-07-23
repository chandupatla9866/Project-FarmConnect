import { apiClient } from "../apiClient";
export const notificationApi = {
  async list(params) {
    const res = await apiClient.get("/notifications", {
      params
    });
    return res.data.data;
  },
  async unreadCount() {
    const res = await apiClient.get("/notifications/unread-count");
    return res.data.data.count;
  },
  async markRead(id) {
    await apiClient.patch(`/notifications/${id}/read`);
  },
  async markAllRead() {
    await apiClient.patch("/notifications/read-all");
  }
};