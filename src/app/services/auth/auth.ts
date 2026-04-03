// app/services/auth/auth.ts
import { Lang } from "@/app/services/common/Lang";

const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";
const USERID = "userId";
const USERNM = "userNm";
const SESLANG = "sesLang";
const USRGRP = "userGroupName";

export function setTokens(
  accessToken: string,
  refreshToken: string,
  userId: string,
  userNm: string,
  sesLang: string,
  userGroupName: string,
) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  sessionStorage.setItem(USERID, userId);
  sessionStorage.setItem(USERNM, userNm);
  sessionStorage.setItem(SESLANG, sesLang);
  sessionStorage.setItem(USRGRP, userGroupName);
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getUserName() {
  return sessionStorage.getItem(USERNM);
}

export function getUserGroup() {
  return sessionStorage.getItem(USRGRP);
}

/**
 * 로그아웃 처리 — 세션 토큰 + Lang 캐시 모두 정리
 * 요구사항 6: 자동 로그아웃 시에도 호출됨 (client.ts 인터셉터)
 */
export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USERID);
  sessionStorage.removeItem(USERNM);
  sessionStorage.removeItem(SESLANG);
  sessionStorage.removeItem(USRGRP);

  // 요구사항 6: Lang 캐시도 함께 정리 (보안 상 로그아웃 시 삭제)
  Lang.clearCache();
}

export function isAuthed() {
  return !!getAccessToken();
}

/** API 레이어에서 공통으로 쓰는 세션 필드 */
export function getSessionFields() {
  const userId = sessionStorage.getItem(USERID) ?? "";
  return {
    userId,
    sesUserId: userId,
    ACCESS_TOKEN: sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? "",
    REFRESH_TOKEN: sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? "",
    sesLang: sessionStorage.getItem(SESLANG) ?? "",
  };
}
