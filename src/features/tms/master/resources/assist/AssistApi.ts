import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Assist";

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

// dsSave 패턴 저장 — body { dsSave }, params 에 세션/MENU_CD/그 외 키.
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    `/assistService/${url}`,
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

export const assistApi = {
  // 메인(헬퍼) 조회
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/assistService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 소속(물류운영그룹) 조회
  getAssistLogisticsList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/assistService/searchAssistLogisticsList`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 헬퍼 검색조건용 물류운영그룹 팝업 조회
  searchLogisticsPop(payload: any) {
    return apiClient.post<CommonResponse>(
      `/assistService/searchLogisticsPop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 메인 저장
  save(payload: any) {
    return postSave("save", payload);
  },
  // 소속 저장
  saveAsstLgstGrp(payload: any) {
    return postSave("saveAsstLgstGrp", payload);
  },
  // 소속등록 (다건)
  onRegiAffi(payload: any) {
    return apiClient.post<CommonResponse>(
      `/assistService/onRegiAffi`,
      { dsSave: payload },
      {
        params: { ...getSessionFields(), MENU_CD: MENU_CODE },
      },
    );
  },
  // 소속등록취소 (다건)
  onRegiAffiCancle(payload: any) {
    return apiClient.post<CommonResponse>(
      `/assistService/onRegiAffiCancle`,
      { dsSave: payload },
      {
        params: { ...getSessionFields(), MENU_CD: MENU_CODE },
      },
    );
  },
};
