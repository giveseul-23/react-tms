import { CONDITION_ICON_MAP } from "@/app/components/Search/conditionIcons";
import type { SearchMeta } from "@/features/search/search.meta.types";

// POPUP 필드의 코드명을 저장할 searchState 키.
//   기본: <base>_NM (기존 관례 — rawFiltersRef `SRCH_<base>_NM` 호환)
//   같은 이름(<base>_NM)의 다른 필드가 있으면(충돌) <base>__NM 으로 분리 →
//   TEXT 등 독립 필드와 searchState 슬롯이 겹치지 않게 한다.
export function popupNameKey(
  popupMetaKey: string,
  meta: readonly SearchMeta[],
): string {
  const base = popupMetaKey.replace("_CD", "");
  const conventional = `${base}_NM`;
  const collides = meta.some((x) => x.key === conventional);
  return collides ? `${base}__NM` : conventional;
}

export type SearchCondition = {
  key: string;
  operator: keyof typeof CONDITION_ICON_MAP;
  dataType?: "DATE" | "STRING" | "NUMBER";
  value?: string;
  sourceType?: "POPUP" | "NORMAL";
};

export function buildSearchCondition(
  searchCon: SearchCondition,
  userTz?: string, // [TEMP-userTz] 서버 작업 완료 시 이 파라미터 제거
): string {
  const { key, operator, dataType, value, sourceType } = searchCon;

  if (sourceType === "POPUP" && key.endsWith("_NM")) return "";
  if (!value && operator !== "notUsed") return "";
  if (operator === "notUsed") return "";

  let returnStr = " AND ";

  const normalizedValue =
    dataType === "NUMBER"
      ? String(value ?? "").replace(/,/g, "")
      : (value ?? "");

  const safeValue =
    dataType === "NUMBER"
      ? normalizedValue
      : String(normalizedValue).replace(/'/g, "''");

  // 날짜 값 → TO_TIMESTAMP 표현식 (hhmmss: 시작='000000', 끝='235959')
  const toTimestamp = (d: string, hhmmss: "000000" | "235959"): string =>
    `TO_TIMESTAMP('${d.replace(/-/g, "")}${hhmmss}', 'YYYYMMDDHH24MISS')`;

  // [TEMP-userTz] range date 에만 tz 접미 — 서버 완료 시 withTz 래핑 전부 제거
  const withTz = (expr: string): string =>
    userTz ? `${expr} AT TIME ZONE '${userTz}'` : expr;

  // dateRange 처리 (_FRM / _TO): 시작=00:00:00, 끝=23:59:59 + userTz(옵션)
  if (key.endsWith("_FRM")) {
    const baseKey = key.replace("_FRM", "");
    returnStr += `${baseKey} >= ${withTz(toTimestamp(safeValue, "000000"))}`; // [TEMP-userTz]
    return returnStr;
  }

  if (key.endsWith("_TO")) {
    const baseKey = key.replace("_TO", "");
    returnStr += `${baseKey} <= ${withTz(toTimestamp(safeValue, "235959"))}`; // [TEMP-userTz]
    return returnStr;
  }

  // 단일 DATE + equal → 하루 범위로 확장 (tz 미적용)
  if (dataType === "DATE" && operator === "equal") {
    returnStr += `${key} >= ${toTimestamp(safeValue, "000000")} AND ${key} <= ${toTimestamp(safeValue, "235959")}`;
    return returnStr;
  }

  const formatValue = (v: string): string => {
    if (dataType === "DATE") {
      return toTimestamp(v, "000000");
    }
    if (dataType === "NUMBER") {
      return v;
    }
    return `'${v}'`;
  };

  switch (operator) {
    case "equal":
      returnStr += `${key} = ${formatValue(safeValue)}`;
      break;

    case "notEqual":
      returnStr += `(${key} <> ${formatValue(safeValue)} OR ${key} IS NULL)`;
      break;

    case "percent":
      returnStr += `CAST(${key} AS TEXT) LIKE '%' || '${safeValue}' || '%'`;
      break;

    case "parentheses":
      returnStr += `${key} IN ${buildInQuery(safeValue, dataType)}`;
      break;

    case "chevronRight":
      returnStr += `${key} > ${formatValue(safeValue)}`;
      break;

    case "chevronLeft":
      returnStr += `${key} < ${formatValue(safeValue)}`;
      break;

    case "chevronLast":
      returnStr += `${key} >= ${formatValue(safeValue)}`;
      break;

    case "chevronFirst":
      returnStr += `${key} <= ${formatValue(safeValue)}`;
      break;

    case "notUsed":
      return "";

    default:
      return "";
  }

  return returnStr;
}

function buildInQuery(val: string, dataType?: string): string {
  if (!val) return "()";

  const tokens = val.split(",");

  const values = tokens
    .map((t) => {
      const trimmed = t.trim().replace(/'/g, "''");

      if (dataType === "NUMBER") {
        return trimmed.replace(/,/g, ""); // 🔥 숫자 콤마 제거 + 따옴표 없음
      }

      if (dataType === "DATE") {
        const compact = trimmed.replace(/-/g, "");
        return `TO_TIMESTAMP('${compact}000000', 'YYYYMMDDHH24MISS')`;
      }

      return `'${trimmed}'`;
    })
    .join(",");

  return `(${values})`;
}
