// src/app/services/dispatchPlan/dispatchPlanApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DispatchPlan";

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

// 차량 현재 위치는 수송중차량관제 서비스를 재사용해 VEH_ID 기준으로 조회한다.
const IN_TRNST_MENU = "MENU_IN_TRNST_VEH_CTRL";
// 경로(주행경로/정차지)는 운행이력 서비스를 재사용한다.
const DRIVE_HISTORY_MENU = "MENU_DRIVE_HISTORY";

export const dispatchPlanApi = {
  // ── 조회 ─────────────────────────────────────────────────────
  getDispatchPlanList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 하단 탭: 경유처 ─────────────────────────────────────────
  getStopList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchPlanStop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 하단 탭: 할당주문 ───────────────────────────────────────
  getAllocOrderList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 하단 탭: 미할당주문 ─────────────────────────────────────
  getUnallocOrderList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchUnAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 할당주문 / 미할당주문 SUB (품목 목록) ───────────────────
  getAllocOrderItemList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchAssignedShipmentDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getUnallocOrderItemList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchUnAssignedShipmentDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getAllocAndUnallocOrderItemList(payload: any) {
    return apiClient.post<CommonResponse>(
      "dispatchPlanService/searchUnAssignedShipmentItem",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  //차량정보조회
  // ── 하단 탭: 미할당주문 ─────────────────────────────────────
  searchVehInfo(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanAdService/searchVehInfo",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 저장 ─────────────────────────────────────────────────────
  /**
   * 저장 — menuConfig/LanguagePack 와 동일한 dsSave 패턴 (URL params + body { dsSave }).
   */
  saveDispatchPlan(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/save",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },

  // ── 계획확정 / 계획확정취소 ─────────────────────────────────
  savePlannedPlanDispatch(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/savePlannedPlanDispatch",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  saveCancelPlannedPlanDispatch(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveCancelPlannedPlanDispatch",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 경유순서 자동조정 ───────────────────────────────────────
  saveAutoChangeStopSeq(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveAutoChangeStopSeq",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 차량교환 (2건 차량정보 스왑) ────────────────────────────
  saveChangeVehicleSwap(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanAdService/saveChangeVehicleSwap",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── ETA 예측 / 계산 ────────────────────────────────────────
  predictEta(payload: any) {
    return apiClient.post<CommonResponse>(
      "/mapService/updateStopEstAndCalDTTM",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  calcEta(payload: any) {
    return apiClient.post<CommonResponse>(
      "/mapService/updateCalDTTM",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 경유처 순서 저장 ────────────────────────────────────────
  saveStopOrder(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveStopOrder",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 메모 (TruckDispatchConfirmMemoPop) ──────────────────────
  // 기존 메모 조회 (배차번호 기준 4개 메모 1건)
  searchDispatchMemo(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchDispatchMemo",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 메모 저장 — 선택 배차행에 4개 메모 머지한 단건(dsSave 첫 행)을 전달
  saveDispatchMemo(record: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveDispatchMemo",
      withSession({ MENU_CD: MENU_CODE, dsSave: [record] }),
    );
  },
  //주문/품목메모입력
  saveShpmItemMemo(record: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveShpmItemMemo",
      withSession({ MENU_CD: MENU_CODE, dsSave: record }),
    );
  },

  cancelDspchMemo(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/cancelDspchMemo",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 운송일변경 (ChangeDlvryDatePop) ─────────────────────────
  changeDlvryDate(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/changeDlvryDate",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 임시차량변경 / 스팟차량 등록 (RegiSpotPop) ──────────────
  saveDspchSpotVeh(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/saveDspchSpotVeh",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 차량변경 (ChangeVehiclePop) ─────────────────────────────
  // 조회: VEH_OP_TP(지입100/용차110/가상999)별 변경 가능 차량 목록
  searchChangeVehicle(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchDispatchChangeVehiclePop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 적용: 선택 차량을 배차 행에 반영 (ORG_VEH_ID = 변경 전 차량)
  saveChangeVehicle(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveChangeVehicle",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 고정노선배차생성 (CreateItineraryDispatchPop) ────────────────
  // 조회
  searchItineraryDispatch(payload: any) {
    return apiClient.post<CommonResponse>(
      "/itineraryService/searchItineraryPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveCreateItineraryGroupDispatch(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanAdService/saveCreateItineraryGroupDispatch",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 고정노선그룹배차생성 (CreateItineraryDispatchPop) ────────────────
  // 조회
  searchGroupPop(payload: any) {
    return apiClient.post<CommonResponse>(
      "/itineraryService/searchGroupPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 배차생성 (CreateEmptyDispatchVehiclePop) ────────────────
  // 조회: 운영그룹/조건 기준 배차 가능 차량 (VEH_OP_TP 100/110/999)
  searchEmptyDispatchVehicle(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchEmptyDispatchVehiclePop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveCreateEmptyDispatch(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveCreateEmptyDispatch",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 배차취소 ────────────────────────────────────────────────
  saveCancelPlanDispatch(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveCancelPlanDispatch",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 주문할당 / 할당취소 (MIT코드 분기는 호출측 처리) ─────────
  saveAssignedShipment(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  saveUnAssignedShipment(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveUnAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 주문 병합(합차) ─────────────────────────────────────────
  saveMergeShipment(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/createDispatchService/saveMergeShipment",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  // ── 품목 라인분할 / 수량분할 ────────────────────────────────
  saveSplitShipmentLine(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/createDispatchService/saveSplitShipmentLine",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  saveSplitShipmentQty(payload: any) {
    return apiClient.post<CommonResponse>(
      "/createDispatchService/saveSplitShipmentQty",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 차량 현재 위치 조회 (SidePanel 지도) ────────────────────
  // 선택 배차행의 VEH_ID 로 수송중차량관제 서비스를 조회해 위치(LAT/LON) 반환.
  getVehiclePosition(vehId: string) {
    return apiClient.post<CommonResponse>(
      "/inTransitVehicleStatusService/search",
      withSession({
        MENU_CD: IN_TRNST_MENU,
        DYNAMIC_QUERY: `1=1 AND VEH.VEH_ID = '${vehId}'`,
        page: 1,
        limit: 100,
      }),
    );
  },

  // ── 경로 보기 (SidePanel 지도) — 운행이력 서비스 재사용 ──────
  // 주행경로(trace) 좌표 목록 조회.
  searchDispathTrace(dspchNo: string) {
    return apiClient.post<CommonResponse>(
      "/traceService/searchDispathTrace",
      withSession({ MENU_CD: DRIVE_HISTORY_MENU, DSPCH_NO: dspchNo }),
    );
  },
  // 정차지(route) 목록 조회.
  getDlvryRoute(dspchNo: string) {
    return apiClient.post<CommonResponse>(
      "/mapService/getDlvryRoute",
      withSession({ MENU_CD: DRIVE_HISTORY_MENU, DSPCH_NO: dspchNo }),
    );
  },
};
