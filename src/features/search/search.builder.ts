import { CONDITION_ICON_MAP } from "@/app/components/Search/conditionIcons";

export type SearchCondition = {
  key: string;
  operator: keyof typeof CONDITION_ICON_MAP;
  dataType?: "DATE" | "STRING" | "NUMBER";
  value?: string;
};

export function buildSearchCondition(searchCon: SearchCondition): string {
  const { key, operator, dataType, value } = searchCon;

  if (!value && operator !== "notUsed") return "";

  let returnStr = " AND ";

  // 🔥 숫자 타입이면 콤마 제거
  const normalizedValue =
    dataType === "NUMBER" ? (value ?? "").replace(/,/g, "") : (value ?? "");

  // 문자열일 때만 escape
  const safeValue =
    dataType === "NUMBER"
      ? normalizedValue
      : normalizedValue.replace(/'/g, "''");

  switch (operator) {
    case "equal":
      returnStr +=
        dataType === "NUMBER"
          ? `${key} = ${safeValue}`
          : `${key} = '${safeValue}'`;
      break;

    case "notEqual":
      returnStr +=
        dataType === "NUMBER"
          ? `(${key} <> ${safeValue} OR ${key} IS NULL)`
          : `(${key} <> '${safeValue}' OR ${key} IS NULL)`;
      break;

    case "percent":
      returnStr += `UPPER(${key}) LIKE '%' || UPPER('${safeValue}') || '%'`;
      break;

    case "parentheses":
      returnStr += `${key} IN ${buildInQuery(safeValue, dataType)}`;
      break;

    case "chevronRight":
      returnStr +=
        dataType === "NUMBER"
          ? `${key} > ${safeValue}`
          : `${key} > '${safeValue}'`;
      break;

    case "chevronLeft":
      returnStr +=
        dataType === "NUMBER"
          ? `${key} < ${safeValue}`
          : `${key} < '${safeValue}'`;
      break;

    case "chevronLast":
      returnStr +=
        dataType === "NUMBER"
          ? `${key} >= ${safeValue}`
          : `${key} >= '${safeValue}'`;
      break;

    case "chevronFirst":
      returnStr +=
        dataType === "NUMBER"
          ? `${key} <= ${safeValue}`
          : `${key} <= '${safeValue}'`;
      break;

    case "notUsed":
      returnStr += `${key} IS NULL`;
      break;

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

      return `'${trimmed}'`;
    })
    .join(",");

  return `(${values})`;
}
