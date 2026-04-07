// app/api/client.ts
//
// 요구사항 6: 세션 만료 시 자동 로그아웃 + 로그인 페이지 리디렉션
//   - 401 Unauthorized → 토큰 + Lang 캐시 정리 후 /login 으로 이동
//   - 네트워크 에러(서버 미응답) → 로그인 화면에서는 LoginPage 자체 오류팝업으로 처리
//     이미 로그인된 상태라면 세션 끊김으로 간주하고 자동 로그아웃

import axios from "axios";
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
 * Response Interceptor
 * ========================= */
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginPage =
      window.location.pathname === "/login" ||
      window.location.pathname === "/";

    // ── 401: 토큰 만료 / 세션 만료 ───────────────────────────
    if (error.response?.status === 401) {
      clearTokens();
      Lang.clearCache(); // 요구사항 6: Lang 캐시도 함께 정리
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // ── 네트워크 에러 (서버 미응답 / 연결 끊김) ──────────────
    // 로그인 페이지에서는 LoginPage 의 catch 에서 팝업으로 처리하므로 여기서는 통과
    // 이미 로그인 된 상태에서 서버가 끊기면 자동 로그아웃
    if (!error.response && !isLoginPage) {
      const token = getAccessToken();
      if (token) {
        // 세션이 있었던 상태에서 서버 연결 끊김 → 자동 로그아웃
        clearTokens();
        Lang.clearCache();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
