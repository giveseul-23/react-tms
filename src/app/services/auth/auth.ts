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

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USERID);
  sessionStorage.removeItem(USERNM);
  sessionStorage.removeItem(SESLANG);
  sessionStorage.removeItem(USRGRP);
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
