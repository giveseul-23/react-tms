// 상태 배지 색(톤) 매핑 — statusEnums.ts(코드)와 "따로" 관리.
//   라벨은 codeKey(codeMap)에서, 색만 여기서. 색 변경은 이 파일만 수정.
//   컬럼에 `statusStyle: "DSPCH_OP_STS"` 선언 시 processColumn(injectStatusBadge)이 사용.

export type StatusTone =
  | "blue"
  | "green"
  | "amber"
  | "orange"
  | "slate"
  | "gray"
  | "red"
  | "rose"
  | "dark";

// 톤 팔레트 (라벨스탕.JPG) — 연한 배경 + 동계열 진한 글자 + 옅은 보더.
export const TONE_CLASS: Record<StatusTone, string> = {
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  green: "bg-emerald-50 text-emerald-600 border-emerald-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  orange: "bg-orange-50 text-orange-600 border-orange-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  gray: "bg-gray-100 text-gray-500 border-gray-200",
  red: "bg-red-50 text-red-600 border-red-200",
  rose: "bg-rose-50 text-rose-600 border-rose-200",
  dark: "bg-slate-700 text-white border-slate-700",
};

// enum 이름 → (코드 → 톤). 센차 색 계열 + 상태 라이프사이클 기준.
export const STATUS_TONE: Record<string, Record<string, StatusTone>> = {
  // 배차운영상태 — 센차 setDispatchOperationStatusColor 대응
  DSPCH_OP_STS: {
    "2010": "blue", // OPEN(신규)
    "2020": "slate", // PLANNED
    "2030": "slate", // TENDERED
    "2050": "slate", // TENDER_ACCEPTED
    "2040": "amber", // TENDER_REJECTED
    "2060": "amber", // TENDER_CANCELED
    "2070": "blue", // 운행 진행 (센차 파랑 그라데 → 단일 blue)
    "2073": "blue",
    "2075": "blue",
    "2080": "blue",
    "2090": "blue",
    "2100": "blue",
    "2103": "blue",
    "2105": "blue",
    "2110": "green", // COMPLETED
    "2000": "dark", // CANCEL(마감)
    "2001": "gray",
  },

  // 배송운영상태 — 라이프사이클 기준
  SHPM_OP_STS: {
    "1000": "blue",
    "1005": "slate",
    "1010": "slate",
    "1020": "slate",
    "1030": "amber",
    "1040": "amber",
    "1050": "blue",
    "1060": "blue",
    "1063": "blue",
    "1066": "blue",
    "1070": "blue",
    "1080": "blue",
    "1090": "blue",
    "1100": "green",
  },

  // 매입재무상태 — 센차 setApFinancialStatusColor 대응 (핑크/마젠타 → rose)
  AP_FI_STS: {
    "3000": "dark",
    "4000": "blue",
    "4005": "rose",
    "4010": "rose",
    "4020": "rose",
    "4030": "rose",
    "4040": "rose",
    "4050": "rose",
    "4055": "rose",
    "4060": "rose",
    "4070": "amber",
  },

  // 매출재무상태 — 센차 setArFinancialStatusColor 대응
  AR_FI_STS: {
    "4000": "green",
    "5000": "gray",
    "5005": "slate",
    "5010": "slate",
    "5020": "amber",
    "5030": "rose",
    "5040": "rose",
  },

  // 인터페이스 처리상태 — 센차 setInterfaceProcessStatusColor 대응
  IF_PRCS_STS: {
    S: "green",
    R: "orange",
    E: "red",
    P: "blue",
    N: "gray",
    K: "slate",
  },
};

/** 코드의 톤 클래스 반환 (미정의 코드는 gray). */
export function statusToneClass(statusEnum: string, code: unknown): string {
  const tone = STATUS_TONE[statusEnum]?.[String(code)] ?? "gray";
  return TONE_CLASS[tone];
}
