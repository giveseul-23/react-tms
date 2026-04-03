// app/services/auth/authApi.ts
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
  const langPack = resObj.dsLangPack[0][userLang];

  // 요구사항 6: setData 호출 시 버전 정보(타임스탬프)와 함께 localStorage 캐시 저장
  const version = resObj.langPackVersion ?? new Date().toISOString();
  Lang.setData(langPack, version);
}
