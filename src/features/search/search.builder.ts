import { CONDITION_ICON_MAP } from "@/app/components/Search/conditionIcons";

export type SearchCondition = {
  key: string;
  operator: keyof typeof CONDITION_ICON_MAP;
  dataType?: "DATE" | "STRING" | "NUMBER";
  value?: string;
  sourceType?: "POPUP" | "NORMAL";
};

export function buildSearchCondition(searchCon: SearchCondition): string {
  let { key, operator, dataType, value, sourceType } = searchCon;

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

  const formatValue = (v: string): string => {
    if (dataType === "DATE") {
      return `TO_DATE('${v.replace(/-/g, "")}', 'YYYYMMDD')`;
    }
    if (dataType === "NUMBER") {
      return v;
    }
    return `'${v}'`;
  };

  // 🔥 dateRange 처리 (_FRM / _TO) — 날짜값에서 '-' 제거 (YYYYMMDD 형식)
  if (key.endsWith("_FRM")) {
    const baseKey = key.replace("_FRM", "");
    const dateValue = safeValue.replace(/-/g, "");
    returnStr +=
      dataType === "NUMBER"
        ? `${baseKey} >= TO_DATE(${dateValue}, 'YYYYMMDD')`
        : `${baseKey} >= TO_DATE('${dateValue}', 'YYYYMMDD')`;
    return returnStr;
  }

  if (key.endsWith("_TO")) {
    const baseKey = key.replace("_TO", "");
    const dateValue = safeValue.replace(/-/g, "");
    returnStr +=
      dataType === "NUMBER"
        ? `${baseKey} <= TO_DATE(${dateValue}, 'YYYYMMDD')`
        : `${baseKey} <= TO_DATE('${dateValue}', 'YYYYMMDD')`;
    return returnStr;
  }

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
        return `TO_DATE('${trimmed.replace(/-/g, "")}', 'YYYYMMDD')`;
      }

      return `'${trimmed}'`;
    })
    .join(",");

  return `(${values})`;
}
