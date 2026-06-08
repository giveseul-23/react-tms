import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./SmsGroup";

type commonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();

  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }

  return { ...sessionFields, ...payload };
};

export const smsGroupApi = {
  ////// SEARCH
  getSmsGroupList(payload: any) {
    return apiClient.post<commonResponse>(
      `/smsGroupService/search`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getSmsGroupDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      "/smsGroupService/searchDetail",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  ////// SAVE
  // SMS 그룹(main) 저장
  save(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      "/smsGroupService/save",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // SMS 수신자(sub01) 저장
  saveDetail(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      "/smsGroupService/saveDetail",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },

  ////// 팝업 검색
  // 사용자 계정 검색 (수신자 USR_ID)
  searchTmsUserAccount(payload: any) {
    return apiClient.post<commonResponse>(
      "/smsGroupService/searchTmsUserAccount",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
