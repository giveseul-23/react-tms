import { apiClient } from "@/app/api/client";
import { Util } from "@/app/services/common/Util.ts";
import { Lang } from "@/app/services/common/Lang.ts";

export type LoginRequest = {
  userId: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

export const authApi = {
  loginMobile({ userId, password }: LoginRequest) {
    return apiClient.post<LoginResponse>("/sessionService/loginMobile", {
      USERID: btoa(userId),
      PASSWORD: btoa(password),
    });
  },
};

export const configApi = {
  getConfig() {
    return apiClient.get("/sessionService/getLangPackAndSysConfigForLogin", {
      params: {
        sesLang: localStorage.getItem("userLang"),
        sesUserGroup: localStorage.getItem("userGroupCode"),
      },
    });
  },
};

export async function getConfigInfo() {
  const userLang = Util.getUserInfo("userLang");

  const res = await configApi.getConfig();

  const resObj = res.data.data;

  if (!resObj.success) {
    throw new Error(resObj.msg);
  }

  setUtilConfig(resObj, userLang);
}

// 기존 me.setUtilConfig 대체
function setUtilConfig(resObj: any, userLang: string) {
  // 👉 여기서 언어팩 넣어야 핵심
  const langPack = resObj.dsLangPack[0][userLang]; // 서버 구조에 맞게 수정

  Lang.setData(langPack);

  // 필요하면 추가 config도 여기서 세팅
}
