import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Dock";

type CommonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

// dsSave 패턴 저장 공용
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    `/dockService/${url}`,
    { dsSave },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...rest,
      },
    },
  );
}

export const dockApi = {
  // 메인(도크) 조회
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dockService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 운영시간 슬롯 조회
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dockService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 메인(도크) 저장
  saveMain(payload: any) {
    return postSave("saveMain", payload);
  },
  // 운영시간 슬롯 저장
  saveOpSlot(payload: any) {
    return postSave("saveOpSlot", payload);
  },
  // 운영시간 슬롯 삭제
  deleteOpSlot(payload: any) {
    return postSave("onOpSlotDel", payload);
  },
};
