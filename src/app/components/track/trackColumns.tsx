// 추적 패널 컬럼 정의.
// API는 단일(getTrackList)이지만 trackType별로 컬럼 구성이 달라 lookup 맵으로 분기.

export type TrackType = "BUY" | "SELL" | "DSPCH" | "ORD" | "STOP" | "POD";

// 매입 추적
export const BUY_TRACK_COLUMN_DEFS = (): any[] => [
  { headerName: "No" },
  // TODO: 매입 추적 컬럼 정의
];

// 매출 추적
export const SELL_TRACK_COLUMN_DEFS = (): any[] => [
  { headerName: "No" },
  // TODO: 매출 추적 컬럼 정의
];

// 배차 추적
export const DSPCH_TRACK_COLUMN_DEFS = (): any[] => [
  { headerName: "No" },
  // TODO: 배차 추적 컬럼 정의
];

// 주문 추적
export const ORD_TRACK_COLUMN_DEFS = (): any[] => [
  { headerName: "No" },
  // TODO: 주문 추적 컬럼 정의
];

// 경유지 추적
export const STOP_TRACK_COLUMN_DEFS = (): any[] => [
  { headerName: "No" },
  // TODO: 경유지 추적 컬럼 정의
];

// 인수증 추적
export const POD_TRACK_COLUMN_DEFS = (): any[] => [
  { headerName: "No" },
  // TODO: 인수증 추적 컬럼 정의
];

export const TRACK_COLUMN_DEFS_MAP: Record<TrackType, () => any[]> = {
  BUY: BUY_TRACK_COLUMN_DEFS,
  SELL: SELL_TRACK_COLUMN_DEFS,
  DSPCH: DSPCH_TRACK_COLUMN_DEFS,
  ORD: ORD_TRACK_COLUMN_DEFS,
  STOP: STOP_TRACK_COLUMN_DEFS,
  POD: POD_TRACK_COLUMN_DEFS,
};

export const TRACK_TITLE_MAP: Record<TrackType, string> = {
  BUY: "매입",
  SELL: "매출",
  DSPCH: "배차",
  ORD: "주문",
  STOP: "경유지",
  POD: "인수증",
};

// 추적 type 별로 그리드 행에서 추출할 컬럼 필드.
// TODO: 실제 type 별 keyField 로 교체 (현재 모두 DSPCH_NO placeholder).
export const TRACK_KEY_FIELD_MAP: Record<TrackType, string> = {
  BUY: "DSPCH_NO",
  SELL: "DSPCH_NO",
  DSPCH: "DSPCH_NO",
  ORD: "DSPCH_NO",
  STOP: "DSPCH_NO",
  POD: "DSPCH_NO",
};
