// app/api/client.ts
//
// 요구사항 6: 세션 만료 시 자동 로그아웃 + 로그인 페이지 리디렉션
//   - 401 Unauthorized → 토큰 + Lang 캐시 정리 후 /login 으로 이동
//   - 네트워크 에러(서버 미응답) → 로그인 화면에서는 LoginPage 자체 오류팝업으로 처리
//     이미 로그인된 상태라면 세션 끊김으로 간주하고 자동 로그아웃

import axios, { type AxiosRequestConfig } from "axios";
import { API_CONFIG } from "./config";
import { getAccessToken, clearTokens } from "@/app/services/auth/auth";
import { Lang } from "@/app/services/common/Lang";

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
    withCredentials: true,
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
 * Token Refresh
 * ========================= */
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function onRefreshed(newToken: string) {
  pendingRequests.forEach(({ resolve }) => resolve(newToken));
  pendingRequests = [];
}

function onRefreshFailed(error: unknown) {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = sessionStorage.getItem("REFRESH_TOKEN");
  const res = await axios.post(
    `${API_CONFIG.baseURL}/sessionService/refreshToken`,
    { REFRESH_TOKEN: refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );

  const { ACCESS_TOKEN, REFRESH_TOKEN } = res.data.data;

  sessionStorage.setItem("ACCESS_TOKEN", ACCESS_TOKEN);
  if (REFRESH_TOKEN) {
    sessionStorage.setItem("REFRESH_TOKEN", REFRESH_TOKEN);
  }

  return ACCESS_TOKEN;
}

/* =========================
 * Response Interceptor
 * ========================= */
apiClient.interceptors.response.use(
  (res) => {
    const msgCode = res.data?.msgCode;

    // ── ACCESS_TOKEN 만료 → 갱신 후 원래 요청 재시도 ──────────
    if (msgCode === "MSG_ACCESS_EXPIRED") {
      const originalRequest = res.config as AxiosRequestConfig & { _retry?: boolean };

      if (originalRequest._retry) {
        clearTokens();
        Lang.clearCache();
        window.location.href = "/login";
        return Promise.reject(new Error("Token refresh failed"));
      }
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;

      return refreshAccessToken()
        .then((newToken) => {
          isRefreshing = false;
          onRefreshed(newToken);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return apiClient(originalRequest);
        })
        .catch((err) => {
          isRefreshing = false;
          onRefreshFailed(err);
          clearTokens();
          Lang.clearCache();
          window.location.href = "/login";
          return Promise.reject(err);
        });
    }

    // ── REFRESH_TOKEN 만료 → 로그아웃 ────────────────────────
    if (msgCode === "MSG_REFRESH_EXPIRED") {
      clearTokens();
      Lang.clearCache();
      window.location.href = "/login";
      return Promise.reject(new Error("Refresh token expired"));
    }

    return res;
  },
  (error) => {
    const isLoginPage =
      window.location.pathname === "/login" ||
      window.location.pathname === "/";

    // ── 401: 토큰 만료 / 세션 만료 ───────────────────────────
    if (error.response?.status === 401) {
      clearTokens();
      Lang.clearCache();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // ── 네트워크 에러 (서버 미응답 / 연결 끊김) ──────────────
    if (!error.response && !isLoginPage) {
      const token = getAccessToken();
      if (token) {
        clearTokens();
        Lang.clearCache();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
