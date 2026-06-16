import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ItmQtySettlMgmt";

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

// dsSave 패턴 저장 공용 (확정/확정취소/매입문서취소/저장/메모)
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    `/itmQtySettlMgmtService/${url}`,
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

export const itmQtySettlMgmtApi = {
  // 메인(물동량) 조회
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itmQtySettlMgmtService/searchMain`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // sub01(요율항목) 조회 — AP_ID
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itmQtySettlMgmtService/searchSub01`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // sub02(구간상세) 조회 — AP_ID, CHG_CD
  getSub02List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itmQtySettlMgmtService/searchSub02`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 요율항목 추가 팝업 조회 — AP_ID, code, name
  searchPopChgList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itmQtySettlMgmtService/searchPopChgList`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 구간상세 팝업 조회 — AP_ID, CHG_CD, LANE_ID
  getLaneDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itmQtySettlMgmtService/searchSub02Detail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 매입문서생성(발행)
  publishApDoc(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itmQtySettlMgmtService/publishApDoc`,
      withSession({ MENU_CD: MENU_CODE, module: "TMS", ...payload }),
    );
  },
  // 매입문서취소
  cancelApDocument(payload: any) {
    return postSave("cancelApDocument", payload);
  },
  // 계획확정
  confirmApDocument(payload: any) {
    return postSave("confirmApDocument", payload);
  },
  // 계획확정취소
  cancelConfirmApDocument(payload: any) {
    return postSave("cancelConfirmApDocument", payload);
  },
  // 승인취소
  cancelApproveApDocument(payload: any) {
    return postSave("cancelApproveApDocument", payload);
  },
  // sub01 요율항목 저장
  saveChargeCode(payload: any) {
    return postSave("saveChargeCode", payload);
  },
  // 정산메모 등록
  saveApplnMemo(payload: any) {
    return postSave("saveApplnMemo", payload);
  },
  // 정산메모 취소
  cancelApplnMemo(payload: any) {
    return postSave("cancelApplnMemo", payload);
  },

  // 일마감 (apDailyManagementService)
  saveDlySetl(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/apDailyManagementService/saveDlySetl`,
      { dsSave },
      { params: { ...getSessionFields(), MENU_CD: MENU_CODE, ...rest } },
    );
  },
  // 일마감취소 (apDailyManagementService)
  saveDlySetlCancel(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/apDailyManagementService/saveDlySetlCancel`,
      { dsSave },
      { params: { ...getSessionFields(), MENU_CD: MENU_CODE, ...rest } },
    );
  },
};
