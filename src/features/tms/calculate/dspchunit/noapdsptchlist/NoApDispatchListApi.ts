import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./NoApDispatchList";

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

// dsSave 패턴 저장 (서버 saveRecord 대응)
function postSave(url: string, rows: any[], params: any = {}) {
  return apiClient.post<CommonResponse>(
    url,
    { dsSave: withSession(rows) },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...params,
      },
    },
  );
}

export const noApDispatchListApi = {
  // 메인 조회 — /noApDispatchListService/search
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/noApDispatchListService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 동적 컬럼 메타(요율항목 CHG_CD) — 서버 getChgList: /tenderReceiveDispatchService/searchCarrierChgList
  //  (서버에서 MENU_CD 를 MENU_PLAN_TENDER_RECEIVE 로 고정 — 유지)
  getCarrierChgList(payload: any = {}) {
    return apiClient.post<CommonResponse>(
      `/tenderReceiveDispatchService/searchCarrierChgList`,
      withSession({ MENU_CD: "MENU_PLAN_TENDER_RECEIVE", ...payload }),
    );
  },

  // 지급운송협력사 재설정(차량지급협력사로) — /noApDispatchListService/saveDspchPayCarrReSet
  saveDspchPayCarrReSet(rows: any[]) {
    return postSave(`/noApDispatchListService/saveDspchPayCarrReSet`, rows);
  },

  // 지급운송협력사 변경 — /noApDispatchListService/saveDspchPayCarrChange
  saveDspchPayCarrChange(rows: any[]) {
    return postSave(`/noApDispatchListService/saveDspchPayCarrChange`, rows);
  },

  // RATING(요율생성) — refactor: /tariffOperationRefactorService/makeRateRefactor
  makeRateRefactor(rows: any[], params: any) {
    return postSave(
      `/tariffOperationRefactorService/makeRateRefactor`,
      rows,
      params,
    );
  },

  // (구) RATING — /tariffOperationService/makeRate
  makeRate(rows: any[]) {
    return postSave(`/tariffOperationService/makeRate`, rows);
  },
};
