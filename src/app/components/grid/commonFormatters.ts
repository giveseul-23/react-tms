// src/app/components/grid/commonFormatters.ts
//
// AG Grid 컬럼에 반복해서 쓰이는 포맷/스타일 헬퍼 모음.
// - 정렬 상수 (CENTER / RIGHT)
// - 천 단위 콤마 valueFormatter
// - 음수 빨강 cellStyle (center / right 변형)

export const CENTER: { textAlign: "center" } = { textAlign: "center" };
export const RIGHT: { textAlign: "right" } = { textAlign: "right" };

/** "1,234" 같은 문자열도 허용하는 안전한 숫자 변환 */
const toNumber = (v: unknown): number => {
  if (typeof v === "number") return v;
  return Number(String(v ?? "").replaceAll(",", ""));
};

/** AG Grid valueFormatter — 빈 값은 공백, 숫자로 변환해서 toLocaleString */
export const numberValueFormatter = (p: any): string => {
  const v = p?.value;
  if (v == null || v === "") return "";
  const n = toNumber(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString();
};

/** 음수면 빨강 글자 (가운데 정렬) */
export const negativeRedCenterCellStyle = (
  p: any,
): Record<string, string> => {
  const v = p?.value;
  if (v == null || v === "") return CENTER;
  const n = toNumber(v);
  return !Number.isNaN(n) && n < 0 ? { ...CENTER, color: "red" } : CENTER;
};

/** 음수면 빨강 글자 + 연한 빨강 배경 (우측 정렬) */
export const negativeRedRightCellStyle = (
  p: any,
): Record<string, string> => {
  const v = p?.value;
  if (v == null || v === "") return RIGHT;
  const n = toNumber(v);
  return !Number.isNaN(n) && n < 0
    ? { ...RIGHT, color: "red", backgroundColor: "#FEECEC" }
    : RIGHT;
};
