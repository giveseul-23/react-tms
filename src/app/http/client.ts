// app/http/client.ts
//
// 요구사항 6: 세션 만료 시 자동 로그아웃 + 로그인 페이지 리디렉션
//   - 401 Unauthorized → 토큰 + Lang 캐시 정리 후 /login 으로 이동
//   - 네트워크 에러(서버 미응답) → 로그인 화면에서는 LoginPage 자체 오류팝업으로 처리
//     이미 로그인된 상태라면 세션 끊김으로 간주하고 자동 로그아웃

import axios from "axios";
import { API_CONFIG } from "./config";
import {
  getAccessToken,
  clearTokens,
  getSessionFields,
  updateTokens,
} from "@/app/services/auth/auth";
import { Lang } from "@/app/services/common/Lang";
import { showSessionExpiredModal } from "@/app/components/popup/showErrorModal";

// 병렬 요청이 동시에 401 을 받아도 만료 모달은 한 번만 띄운다.
let sessionExpiredHandled = false;

function goLogin() {
  clearTokens();
  Lang.clearCache();
  window.location.href = "/login";
}

// ── access_token 만료(MSG_ACCESS_EXPIRED) → refreshToken 재발급 ──────────────
// 서버가 data.msg = "MSG_ACCESS_EXPIRED" 로 응답하면 refresh 후 원요청을 재시도한다.
const ACCESS_EXPIRED = "MSG_ACCESS_EXPIRED";

// single-flight: 동시 다발 요청이 모두 만료를 받아도 refresh 는 1회만 수행하고
// 나머지는 새 토큰을 기다렸다가 재시도한다.
let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];
const notifyWaiters = (token: string | null) => {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
};

// /sessionService/refreshToken 은 인증 화이트리스트 — 만료된 access_token 으로도 호출 가능.
// 인터셉터 재귀를 피하려고 apiClient 가 아닌 raw axios 로 호출한다.
async function refreshAccessToken(): Promise<string | null> {
  const { userId, ACCESS_TOKEN, REFRESH_TOKEN } = getSessionFields();
  if (!REFRESH_TOKEN) return null;
  try {
    const res = await axios.post(
      `${API_CONFIG.baseURL}/sessionService/refreshToken`,
      { USERID: userId, ACCESS_TOKEN, REFRESH_TOKEN },
      { headers: { "Content-Type": "application/json" } },
    );
    const data = res.data?.data ?? res.data ?? {};
    const newAccess: string | undefined = data.ACCESS_TOKEN;
    const newRefresh: string | undefined = data.REFRESH_TOKEN;
    if (!newAccess) return null;
    // 응답에 새 refresh_token 이 함께 오면 같이 갱신.
    updateTokens(newAccess, newRefresh);
    return newAccess;
  } catch {
    return null;
  }
}

// 만료 감지 시 공통 처리 — refresh 후 원요청을 새 토큰으로 재시도. 실패 시 null.
async function retryWithRefresh(originalConfig: any): Promise<any> {
  if (!originalConfig || originalConfig._retried) return null;
  originalConfig._retried = true;

  let token: string | null;
  if (isRefreshing) {
    token = await new Promise<string | null>((resolve) =>
      refreshWaiters.push(resolve),
    );
  } else {
    isRefreshing = true;
    token = await refreshAccessToken();
    isRefreshing = false;
    notifyWaiters(token);
  }

  if (!token) return null;
  originalConfig.headers = originalConfig.headers ?? {};
  originalConfig.headers.Authorization = `Bearer ${token}`;
  return apiClient(originalConfig);
}

// Vercel rewrites(/api/* → 백엔드) 때문에 백엔드가 발급한 세션 쿠키가
// 프론트 도메인에 저장되어 재배포/재시작 후 stale 상태로 계속 전송 → 500 유발.
// JWT Bearer 인증만 사용하므로 세션 쿠키 불필요 — 앱 부트 시 제거.
// 백엔드 설정/버전에 따라 JSESSIONID 또는 SESSIONID 로 발급되므로 둘 다 처리.
// if (typeof document !== "undefined") {
//   const expire = "; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
//   document.cookie = `JSESSIONID=${expire}`;
//   document.cookie = `JSESSIONID=${expire}; domain=${window.location.hostname}`;
//   document.cookie = `SESSIONID=${expire}`;
//   document.cookie = `SESSIONID=${expire}; domain=${window.location.hostname}`;
// }

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: true,
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
  async (res) => {
    // 정상(200) 응답이지만 body 에 access_token 만료 신호가 온 경우 → refresh 후 재시도.
    if (res.data?.msg === ACCESS_EXPIRED) {
      const retried = await retryWithRefresh(res.config);
      if (retried) return retried;
    }
    return res;
  },
  async (error) => {
    const isLoginPage = window.location.pathname === "/login";

    // access_token 만료(MSG_ACCESS_EXPIRED) → refresh 후 원요청 재시도. (로그아웃 분기보다 우선)
    if (error.response?.data?.msg === ACCESS_EXPIRED) {
      const retried = await retryWithRefresh(error.config);
      if (retried) return retried;
      // refresh 실패 → 세션 만료 처리로 폴백
    }

    // 401(세션/토큰 만료) 또는 로그인 상태에서 서버 무응답(연결 끊김) → 만료 모달 후 로그인 페이지.
    const sessionLost =
      error.response?.status === 401 ||
      (!error.response && !isLoginPage && !!getAccessToken());

    if (sessionLost && !sessionExpiredHandled) {
      sessionExpiredHandled = true;
      const msg =
        error.response?.data?.error?.message ??
        error.response?.data?.msg ??
        "세션이 만료되었거나 서버에 연결할 수 없습니다. 다시 로그인해 주세요.";
      showSessionExpiredModal(msg, goLogin);
    }

    return Promise.reject(error);
  },
);
