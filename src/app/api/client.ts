import axios from "axios";
import { API_CONFIG } from "./config";
import { getAccessToken, clearTokens } from "@/app/services/auth/auth";

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
 * Request Interceptor
 * ========================= */
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================
 * Response Interceptor
 * ========================= */
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 / 세션 만료
      clearTokens();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
