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
  // 배차상세 — 회전수/제약무시 저장 (센차 onSave → saveDispatchRtnNo)
  saveDispatchRtnNo(rows: any[]) {
    return dsSavePost("/dispatchPlanVehService/saveDispatchRtnNo", rows);
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
  saveCreateItineraryGroupDispatch(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanAdService/saveCreateItineraryGroupDispatch",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
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

  // ── 팝업 조회 ────────────────────────────────────────────────
  // 운수사변경 — 운수사 목록(master)
  searchTempCarrierToChange(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchTempCarrierToChange",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 운수사변경 — 운수사별 차량(sub)
  searchTempCarrierVehicleToChange(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchTempCarrierVehicleToChange",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 톤급변경 — 톤그룹 목록(master)
  searchTempTonGroupToChange(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchTempTonGroupToChange",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 톤급변경 — 그룹별 톤급(sub)
  searchVehicleTypeToChange(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchVehicleTypeToChange",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 차량변경(용차→자차) — 차량 목록(지입/용차/택배, VEH_OP_TP 구분)
  searchDispatchChangeVehiclePop(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchDispatchChangeVehiclePop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 계약차 신규배차 — 차량 목록
  searchVehiclePop(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/searchVehiclePop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 차량위치(GPS) 최신 위치.
  //  서버가 listMap.getParameterMap().get("VEH_ID") 로 읽으므로 body 가 아닌 query params 로 보낸다.
  //  VEH_ID 배열은 반복 파라미터(VEH_ID=a&VEH_ID=b, 대괄호 없음)로 직렬화해야 서버가 List 로 인식.
  getLatestVehicleLocation(
    payload: { VEH_ID: string[] } & Record<string, any>,
  ) {
    return apiClient.post<CommonResponse>(
      "/mapService/getLatestVehicleLocation",
      {},
      {
        params: { ...getSessionFields(), MENU_CD: MENU_CODE, ...payload },
        paramsSerializer: { indexes: null },
      },
    );
  },

  // ── 팝업 저장/처리 ──────────────────────────────────────────
  // 자차↔자차 차량교환(DtoD)
  dedicatedTrckChange(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/dedicatedTrckChange",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 용차→자차 변경(TtoD)
  saveTempDspchToDedicatedTrck(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/saveTempDspchToDedicatedTrck",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 계약차 신규배차 생성 (dsSave)
  saveCreateEmptyDispatchCntrVeh(rows: any[]) {
    return dsSavePost(
      "/dispatchPlanVehService/saveCreateEmptyDispatchCntrVeh",
      rows,
    );
  },
  // 자차 신규배차(빈 배차) 생성 (dsSave) — 선택 배차행 기준. 서버는 /dispatchPlanService 사용
  saveCreateEmptyDispatch(rows: any[]) {
    return dsSavePost("/dispatchPlanService/saveCreateEmptyDispatch", rows);
  },

  // ── 배차메모 (공통 DispatchMemoPopup) — 서버 /dispatchPlanService ──
  // 기존 4메모 조회 (배차번호 기준)
  searchDispatchMemo(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchDispatchMemo",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 4메모 머지 단건 저장
  saveDispatchMemo(record: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveDispatchMemo",
      withSession({ MENU_CD: MENU_CODE, dsSave: [record] }),
    );
  },
  // 메모 등록취소 (선택행)
  cancelDspchMemo(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/cancelDspchMemo",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  //디테일 팝업 조회
  searchDispatchPop(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchDispatch",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  //디테일 할당 주문 조회
  searchAssignedShipment(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  //디테일 배송경로(경유지) 조회
  searchPlanStop(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/searchPlanStop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  //디테일 미할당 주문조회
  getUnallocOrderList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchUnAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  //디테일 할당 주문 품목 조회
  searchAssignedShipmentDetail(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchAssignedShipmentDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  //디테일 미할당 주문 품목 조회
  searchUnAssignedShipmentDetail(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchUnAssignedShipmentDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  //디테일 주문할당 (미할당 → 선택 배차)
  saveAssignedShipment(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  //디테일 주문할당취소 (할당 → 미할당)
  saveUnAssignedShipment(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveUnAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  //디테일 경유순서 자동조정
  saveAutoChangeStopSeq(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveAutoChangeStopSeq",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  //디테일 배송경로 ETA 예측
  predictEta(payload: any) {
    return apiClient.post<CommonResponse>(
      "/mapService/updateStopEstAndCalDTTM",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  //디테일 배송경로 ETA 계산
  calcEta(payload: any) {
    return apiClient.post<CommonResponse>(
      "/mapService/updateCalDTTM",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  //디테일 배송경로 경유순서 저장
  saveStopOrder(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveStopOrder",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  //디테일 배송경로 경유순서 조정(+)
  saveAdjustPlanStopSeqPlus(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveAdjustPlanStopSeqPlus",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  //디테일 배송경로 경유순서 조정(-)
  saveAdjustPlanStopSeqMinus(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveAdjustPlanStopSeqMinus",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  //디테일 품목 라인분할
  saveSplitShipmentLine(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/createDispatchService/saveSplitShipmentLine",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  //디테일 품목 수량분할
  saveSplitShipmentQty(payload: any) {
    return apiClient.post<CommonResponse>(
      "/createDispatchService/saveSplitShipmentQty",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 드래그드랍: 자차 → 용차 변경
  saveSimpleDedicatedToTempDspch(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/saveSimpleDedicatedToTempDspch",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
