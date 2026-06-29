// 상태 코드 enum — 컨트롤러 로직 체크용 단일 소스 (서버 enum 미러링).
//   색(톤) 매핑은 statusColors.ts 에서 "따로" 관리한다.
//   부등호/in 은 코드에 그대로 두고 "값"만 enum 상수를 쓴다(헬퍼 함수 없이).
//   사용 예) if (row.DSPCH_OP_STS === DSPCH_OP_STS.OPEN) { ... }
//           if (row.DSPCH_OP_STS >= DSPCH_OP_STS.IN_TRANSIT) { ... }
//           if (String(row.AP_FI_STS ?? "") >= AP_FI_STS.OPEN) { ... }   // 4010 이상

// 배차운영상태 — 서버 TMSDispatchOpStatusEnum
export const DSPCH_OP_STS = {
  CANCEL: "2000",
  OPEN: "2010",
  PLANNED: "2020",
  TENDERED: "2030",
  TENDER_REJECTED: "2040",
  TENDER_ACCEPTED: "2050",
  TENDER_CANCELED: "2060",
  LOADING_REQUEST: "2070",
  LOADING: "2073",
  LOADING_COMPLETED: "2075",
  READY_TO_DEPARTURE: "2080",
  IN_TRANSIT: "2090",
  DELIVERED_PARTIALLY: "2100",
  DELIVERED: "2103",
  RETURN_TO_DOMICILE: "2105",
  COMPLETED: "2110",
  // "2001" — 서버 enum 미정의(이름 확인 필요)
} as const;

// 배송운영상태 — 서버 TMSShipmentOpStatusEnum
export const SHPM_OP_STS = {
  CANCELLED: "1000",
  PENDING: "1005",
  OPEN: "1010",
  PLANNING: "1020",
  ASSIGNED_TO_CARRIER: "1030",
  TENDERED: "1040",
  TENDER_ACCEPTED: "1050",
  LOADING_REQUEST: "1060",
  LOADING: "1063",
  LOADING_COMPLETED: "1066",
  CONFIRMED: "1070",
  IN_TRANSIT: "1080",
  DELIVERED: "1090",
  POD_COMPLETED: "1100",
} as const;

// 매입재무상태 — 서버 TMSAccountPayableOpStatusEnum
export const AP_FI_STS = {
  CANCEL: "3000",
  PENDING: "4000",
  DAILY_PLANNED: "4005",
  OPEN: "4010",
  PLANNED: "4020",
  CONFIRMED: "4030",
  CLOSED: "4040",
  // 아래 4개 — 서버 enum 미정의(색상 함수에만 존재). 의미명 확인 필요.
  STS_4050: "4050",
  STS_4055: "4055",
  STS_4060: "4060",
  STS_4070: "4070",
} as const;

// 매출재무상태 — 서버 ArFiStatusEnum
export const AR_FI_STS = {
  CANCEL: "4000",
  PLANNED: "5000",
  CALCULATING: "5005",
  NEW: "5010",
  PLANNED_CONFIRMED: "5020",
  CONFIRMED: "5030",
  CLOSED: "5040",
} as const;

// 인터페이스 처리상태 — 이름 추정(서버 enum 미발견). 의미명 확인 필요.
export const IF_PRCS_STS = {
  NEW: "N",
  SENT: "S",
  RECEIVED: "R",
  PROCESSING: "P",
  ERROR: "E",
  SKIP: "K",
} as const;
