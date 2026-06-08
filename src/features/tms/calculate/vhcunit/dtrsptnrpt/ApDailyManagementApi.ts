import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ApDailyManagement";

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

export const apDailyManagementApi = {
  // 일일실적 메인 조회
  getDailyList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 사용 CHG_CD 조회 (동적 컬럼 메타)
  getUsedChgCd(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/getUsedChgCd`,
      withSession({
        module: "TMS",
        MENU_CD: MENU_CODE,
        DF_CHG_OP_DIV_TCD: "DAILY",
        ...payload,
      }),
    );
  },

  // 상세내역 조회
  getDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일일실적(비용) 생성
  createDailyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/createDailyAp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일일실적(비용) 취소
  cancelDailyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/cancelDailyAp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일정산(배차종료처리)
  closeDaily(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onDispatchEndProcessing`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일정산취소(배차종료복원)
  cancelDailyClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onDispatchEndRestore`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 요율 재계산
  recalculate(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/calcRate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 요율 취소 / 복원
  onRateCancel(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/onRateCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  onRateCancelRestore(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/onRateCancelRestore`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 저장
  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/save`,
      withSession(rows),
    );
  },

  // 엑셀 업로드 (운임/유가/요율) + 요율양식 다운로드
  uploadFreight(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/uploadFreight`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  uploadFuelFare(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/uploadFuelFare`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  uploadRate(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/uploadRate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  downloadRatePrepare(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/downloadRatePrepare`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // (구) uploadFareExcel 호환 — 운임 업로드로 위임
  uploadFareExcel(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/uploadFreight`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 메모 등록 — 선택행에 MEMO_DESC 세팅 후 저장. (센차 onSaveApplnMemo, rowStatus 'I')
  saveMemo(rows: any[], text: string) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/saveApplnMemo`,
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
      `/apDailyManagementService/cancelApplnMemo`,
      withSession(rows.map((r) => ({ ...r, EDIT_STS: "I", MENU_CD: MENU_CODE }))),
    );
  },
};
