import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DispatchOperatorCostManagement";

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

export const dispatchOperatorCostApi = {
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 비용상세정보
  getCostDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/searchDispatchApplanDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 비용상세 — 함수 서브
  getCostFunctionList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/searchCostInfoList`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 경유처
  getWaypointList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/searchPlanStop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 증빙문서
  getEvidenceList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/searchDocFile`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 상단 액션
  changeContract(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/changeContract`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 요율 계산 (요율생성)
  calculateCost(payload: any) {
    return apiClient.post<commonResponse>(
      `/tariffOperationService/makeRate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 이동거리 재계산 (일괄/단건 공통)
  adjustBulkDistance(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/recalcDistance`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  recalculateMoveDistance(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/recalcDistance`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 일정산 처리 / 취소
  closeDaily(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/saveDlySetl`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  cancelCloseDaily(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/saveDlySetlCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 운영자 비용 확정 / 확정취소
  confirmCost(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/saveRateOpConfirm`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  cancelConfirmCost(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/saveRateOpConfirmCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 비용(정산) 삭제
  deleteSettlement(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/deleteAp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/save`,
      withSession(rows),
    );
  },
  createClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/createClose`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 경유처 - 정산경로 추가/복구/조정
  addSettlementRoute(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/addSettlementRoute`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  restoreRoute(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/restoreRoute`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveWaypoint(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/saveWaypoint`,
      withSession(rows),
    );
  },

  // 증빙문서 - 저장 / 첨부
  saveEvidence(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/saveEvidence`,
      withSession(rows),
    );
  },
  downloadEvidence(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/downloadEvidence`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 메모 등록 — 선택행에 MEMO_DESC 세팅 후 저장. (센차 onSaveApplnMemo, rowStatus 'I')
  saveMemo(rows: any[], text: string) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/saveApplnMemo`,
      withSession(
        rows.map((r) => ({
          ...r,
          MEMO_DESC: text,
          EDIT_STS: "I",
          MENU_CD: MENU_CODE,
        })),
      ),
    );
  },

  // 메모 등록취소. (센차 onCancelApplnMemo)
  cancelMemo(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/cancelApplnMemo`,
      withSession(rows.map((r) => ({ ...r, EDIT_STS: "I", MENU_CD: MENU_CODE }))),
    );
  },
};
