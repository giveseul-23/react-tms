const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";
const USERID = "userId";
const USERNM = "userNm";
const SESLANG = "sesLang";

export function setTokens(
  accessToken: string,
  refreshToken: string,
  userId: string,
  userNm: string,
  sesLang: string,
) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  sessionStorage.setItem(USERID, userId);
  sessionStorage.setItem(USERNM, userNm);
  sessionStorage.setItem(SESLANG, sesLang);
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUserName() {
  return sessionStorage.getItem(USERNM);
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USERID);
  sessionStorage.removeItem(USERNM);
  sessionStorage.removeItem(SESLANG);
}

export function isAuthed() {
  return !!getAccessToken();
}
