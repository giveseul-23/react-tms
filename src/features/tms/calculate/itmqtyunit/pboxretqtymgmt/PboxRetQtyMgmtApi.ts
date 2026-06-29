import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./PboxRetQtyMgmt";

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

// dsSave 패턴 저장 (확인/확인취소/상세저장 공용)
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    `/pboxRetQtyManagementService/${url}`,
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

export const pboxRetQtyMgmtApi = {
  // 협력사단위 조회
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/pboxRetQtyManagementService/searchByCarr`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 차량단위요약 조회
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/pboxRetQtyManagementService/searchByVeh`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 상세 조회
  getSub02List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/pboxRetQtyManagementService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 확인
  saveConfirm(payload: any) {
    return postSave("saveConfirm", payload);
  },
  // 확인취소
  saveCancelConfirm(payload: any) {
    return postSave("saveCancelConfirm", payload);
  },
  // 상세 저장
  saveSub02(payload: any) {
    return postSave("saveSub02", payload);
  },
  // 기간구분 일괄 변경
  saveTermTp(payload: any) {
    return apiClient.post<CommonResponse>(
      `/pboxRetQtyManagementService/saveTermTp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
