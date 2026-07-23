import axios from "axios";
export const TOKEN_STORAGE_KEY = "fc_token";
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
apiClient.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }
  return Promise.reject(error);
});
export function extractErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data?.error;
    if (apiError?.fieldErrors?.length) {
      return apiError.fieldErrors.map(f => f.message).join(", ");
    }
    if (apiError?.message) return apiError.message;
    if (error.message) return error.message;
  }
  return "Something went wrong. Please try again.";
}