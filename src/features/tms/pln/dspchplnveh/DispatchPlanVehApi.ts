import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DispatchPlanVeh";

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

// dsSave 저장 공통 (URL params + body { dsSave })
const dsSavePost = (
  url: string,
  rows: any[],
  extra: Record<string, any> = {},
) =>
  apiClient.post<CommonResponse>(
    url,
    { dsSave: rows },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...extra,
      },
    },
  );

// 서버 base URL: /dispatchPlanVehService (일부 흐름은 /dispatchPlanService, /dispatchPlanAdService)
export const dispatchPlanVehApi = {
  // ── 조회 ─────────────────────────────────────────────────────
  // 착지별 물량 (착지계획 탭1)
  searchShpmVolumePerLocation(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchShpmVolumePerLocation",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 착지별 배차내역 (착지계획 탭2)
  searchDspchPerLocation(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchDspchPerLocation",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 자차배차계획 (center)
  searchDedicatedTruckDispatchList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchDedicatedTruckDispatchList",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 용차(스팟)배차내역 (east)
  searchTempTruckDispatchList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchTempTruckDispatchList",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 계획확정(자차) / 취소 ─────────────────────────────────────
  savePlannedPlanDispatch(rows: any[]) {
    return dsSavePost("/dispatchPlanVehService/savePlannedPlanDispatch", rows);
  },
  saveCancelPlannedPlanDispatch(rows: any[]) {
    return dsSavePost(
      "/dispatchPlanVehService/saveCancelPlannedPlanDispatch",
      rows,
    );
  },
  // 계획확정(용차) — 서버는 /dispatchPlanService 사용
  savePlannedPlanDispatchTemp(rows: any[]) {
    return dsSavePost("/dispatchPlanService/savePlannedPlanDispatch", rows);
  },

  // ── 배차취소 ──────────────────────────────────────────────────
  // 자차 배차 취소
  saveCancelPlanDedDispatch(rows: any[]) {
    return dsSavePost(
      "/dispatchPlanVehService/saveCancelPlanDedDispatch",
      rows,
    );
  },
  // 용차 배차 취소 — 서버는 /dispatchPlanService 사용
  saveCancelPlanDispatchTemp(rows: any[]) {
    return dsSavePost("/dispatchPlanService/saveCancelPlanDispatch", rows);
  },
  // 배송요청취소(용차)
  saveCancelTender(rows: any[]) {
    return dsSavePost("/dispatchPlanVehService/saveCancelTender", rows);
  },

  // ── 차량교환/이동 ─────────────────────────────────────────────
  // 차량 스왑 (자차 2건) — 서버는 /dispatchPlanAdService 사용
  saveChangeVehicleSwap(rows: any[]) {
    return dsSavePost("/dispatchPlanAdService/saveChangeVehicleSwap", rows);
  },

  // ── 운수사/톤급 변경 (용차) ──────────────────────────────────
  saveChangeCarrier(rows: any[]) {
    return dsSavePost("/dispatchPlanVehService/saveChangeCarrier", rows);
  },
  saveChangeTonType(rows: any[]) {
    return dsSavePost("/dispatchPlanVehService/saveChangeTonType", rows);
  },

  // ── 자차 ↔ 용차 전환 ─────────────────────────────────────────
  changeDedicatedTruckToTemp(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/changeDedicatedTruckToTemp",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 운송일 변경 ──────────────────────────────────────────────
  changeDlvryDate(rows: any[]) {
    return dsSavePost("/dispatchPlanVehService/changeDlvryDate", rows);
  },

  // ── 배차생성/복화/복사 ──────────────────────────────────────
  // 복화운송생성 — 서버 /dispatchPlanService
  saveCreateContinuousMove(rows: any[]) {
    return dsSavePost("/dispatchPlanService/saveCreateContinuousMove", rows);
  },
  // 용차 배차복사
  copyTempDispatch(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/copyTempDispatch",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 스팟차량(임시차량) 등록 ──────────────────────────────────
  saveDspchSpotVeh(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/saveDspchSpotVeh",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 일괄 차고지 연결 / 취소 ──────────────────────────────────
  saveBatchConnect(rows: any[]) {
    return dsSavePost("/dispatchPlanVehService/saveBatchConnect", rows);
  },
  saveBatchConnectCancel(rows: any[]) {
    return dsSavePost("/dispatchPlanVehService/saveBatchConnectCancel", rows);
  },
  saveBatchConnectAll(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/saveBatchConnectAll",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveBatchConnectCancelAll(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/saveBatchConnectCancelAll",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 배송요청 확인문자 발송 ───────────────────────────────────
  sendSmsToCarr(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/sendSmsToCarr",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 앱설치 SMS 발송 — 서버 /tenderReceiveDispatchService
  sendSmsForAppInstall(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/sendSmsPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
