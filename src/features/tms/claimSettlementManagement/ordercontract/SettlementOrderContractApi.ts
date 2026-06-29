import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./SettlementOrderContract";

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

// dsSave 패턴 저장 (선택 행 배열 → 서버 saveRecord 대응)
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    `/settlementOrderContractService/${url}`,
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

export const settlementOrderContractApi = {
  // 주문계약 목록 조회
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/settlementOrderContractService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 주문별 정산문서 생성 (선택 행 단위 — 서버 saveRecord)
  createSettlementPerShipment(payload: any) {
    return postSave("createSettlementPerShipment", payload);
  },

  // 기간합산 정산문서 생성 (선택 행 단위 — 서버 saveRecord)
  createSettlementPerPeriodBySelection(payload: any) {
    return postSave("createSettlementPerPeriodBySelection", payload);
  },

  // 기간합산 정산문서 생성 (조회조건 단위 — 서버 callAjax, dsSave 없음)
  createSettlementPerPeriodByCondition(payload: any) {
    return apiClient.post<CommonResponse>(
      `/settlementOrderContractService/createSettlementPerPeriodByCondition`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
