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

const dsSavePost = (
  url: string,
  rows: any[],
  params: Record<string, any> = {},
) =>
  apiClient.post<commonResponse>(
    url,
    { dsSave: rows },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...params,
      },
    },
  );

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

  // 요율 계산 (요율생성)
  calculateCost(rows: any[], params: Record<string, any>) {
    return dsSavePost(
      `/tariffOperationRefactorService/makeRateRefactor`,
      rows,
      params,
    );
  },
  recalculateMoveDistance(rows: any[]) {
    return dsSavePost(
      `/dispatchOperatorCostManagementService/recalcDistance`,
      rows,
    );
  },
  // 일정산 처리 / 취소
  closeDaily(payload: { dsSave: any[] }) {
    return dsSavePost(
      `/apDailyManagementService/saveDlySetl`,
      payload.dsSave,
    );
  },
  cancelCloseDaily(payload: { dsSave: any[] }) {
    return dsSavePost(
      `/apDailyManagementService/saveDlySetlCancel`,
      payload.dsSave,
    );
  },
  // 운영자 비용 확정 / 확정취소
  confirmCost(rows: any[]) {
    return dsSavePost(
      `/dispatchOperatorCostManagementService/saveRateOpConfirm`,
      rows,
    );
  },
  cancelConfirmCost(rows: any[]) {
    return dsSavePost(
      `/dispatchOperatorCostManagementService/saveRateOpConfirmCancel`,
      rows,
    );
  },
  // 비용(정산) 삭제
  deleteSettlement(rows: any[]) {
    return dsSavePost(
      `/dispatchOperatorCostManagementService/deleteAp`,
      rows,
    );
  },
  save(payload: { dsSave: any[] }) {
    return dsSavePost(
      `/dispatchOperatorCostManagementService/save`,
      payload.dsSave,
    );
  },
  saveDetail(payload: {
    FI_APPLN_DTL: string;
    FI_DSPCH_APPLN_RT: string;
  }) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/saveDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 경유처 - 정산경로 복구/조정
  restoreRoute(rows: any[]) {
    return dsSavePost(
      `/dispatchPlanVehService/deleteFiRoute`,
      rows,
    );
  },
  saveFiRoute(rows: any[]) {
    return dsSavePost(
      `/dispatchPlanVehService/saveFiRoute`,
      rows,
    );
  },

  // 증빙문서 - 저장 / 첨부
  saveEvidence(rows: any[]) {
    return dsSavePost(
      `/dispatchOperatorCostManagementService/saveDoc`,
      rows,
    );
  },
  uploadEvidence(file: File, params: Record<string, any>) {
    const form = new FormData();
    form.append("UPLOAD_FILE", file);
    form.append("MENU_CD", MENU_CODE);
    form.append("JSON_READ_PASS", "Y");
    Object.entries({ ...getSessionFields(), ...params }).forEach(([key, value]) =>
      form.append(key, String(value ?? "")),
    );
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/uploadImgFile`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
  downloadEvidence(fileIds: string, zipFlag: "Y" | "N") {
    return apiClient.post(
      `/dispatchOperatorCostManagementService/fileDownload`,
      undefined,
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          FILE_ID: fileIds,
          ZIP_FLAG: zipFlag,
        },
        responseType: "blob",
      },
    );
  },
  // 메모 등록 — 선택행에 MEMO_DESC 세팅 후 저장. (센차 onSaveApplnMemo, rowStatus 'I')
  saveMemo(rows: any[], text: string) {
    return dsSavePost(
      `/dispatchOperatorCostManagementService/saveApplnMemo`,
      rows.map((r) => ({
        ...r,
        MEMO_DESC: text,
        rowStatus: "I",
      })),
    );
  },

  // 메모 등록취소. (센차 onCancelApplnMemo)
  cancelMemo(rows: any[]) {
    return dsSavePost(
      `/dispatchOperatorCostManagementService/cancelApplnMemo`,
      rows.map((r) => ({ ...r, rowStatus: "I" })),
    );
  },
};
