import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ItmQtyCfmMgmt";

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

// dsSave 패턴 저장 (메인 저장/확인/확인취소 공용)
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    `/itemQtyConfirmManagementService/${url}`,
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

export const itmQtyCfmMgmtApi = {
  // 메인(물동량) 조회
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itemQtyConfirmManagementService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // sub01: 배차할당 운송 조회 (메인행 DSPCH_NO 기준)
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchPlanService/searchAssignedShipment`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // sub02: 배차할당 운송 상세 조회 (sub01행 SHPM_ID 기준)
  getSub02List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchPlanService/searchAssignedShipmentDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // sub03: 물동량 수치변경 이력 조회 (sub02행 기준)
  getSub03List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itemQtyConfirmManagementService/searchItmQtyChg`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 메인 저장 (saveMain)
  saveMain(payload: any) {
    return postSave("saveMain", payload);
  },
  // 물동량 확정
  onItemQtyConfirm(payload: any) {
    return postSave("onItemQtyConfirm", payload);
  },
  // 물동량 확정취소
  onItemQtyConfirmCancel(payload: any) {
    return postSave("onItemQtyConfirmCancel", payload);
  },
  // 일자기준 물동량 확정 (DateTypePop)
  onDateItemQtyConfirm(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itemQtyConfirmManagementService/onDateItemQtyConfirm`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 일자기준 물동량 확정취소 (DateTypePop)
  onDateItemQtyConfirmCancel(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itemQtyConfirmManagementService/onDateItemQtyConfirmCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 마감 AP 생성 (ItemQtyConfirmCreatePop 확정)
  createApSettlQty(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itmQtySettlMgmtService/createApSettlQty`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 마감 AP 취소
  cancelApSettlQty(payload: any) {
    return apiClient.post<CommonResponse>(
      `/itmQtySettlMgmtService/cancelApSettlQty`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // AP 마감일자 조회 (ItemQtyConfirmCreatePop 초기값)
  getApMonthlyDate(payload: any) {
    return apiClient.post<CommonResponse>(
      `/apMonthlyManagementService/getApMonthlyDate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
