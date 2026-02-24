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

  const safeValue =
    typeof value === "string" ? value.replace(/'/g, "''") : (value ?? "");

  switch (operator) {
    case "equal":
      returnStr += `${key} = '${safeValue}'`;
      break;

    case "notEqual":
      returnStr += `(${key} <> '${safeValue}' OR ${key} IS NULL)`;
      break;

    case "percent":
      returnStr += `UPPER(${key}) LIKE '%' || UPPER('${safeValue}') || '%'`;
      break;

    case "parentheses":
      returnStr += `${key} IN ${buildInQuery(safeValue)}`;
      break;

    case "chevronRight":
      returnStr += `${key} > '${safeValue}'`;
      break;

    case "chevronLeft":
      returnStr += `${key} < '${safeValue}'`;
      break;

    case "chevronLast":
      returnStr += `${key} >= '${safeValue}'`;
      break;

    case "chevronFirst":
      returnStr += `${key} <= '${safeValue}'`;
      break;

    case "notUsed":
      returnStr += `${key} IS NULL`;
      break;

    default:
      return "";
  }

  return returnStr;
}

function buildInQuery(val: string): string {
  if (!val) return "()";

  const tokens = val.split(",");

  const values = tokens
    .map((t) => `'${t.trim().replace(/'/g, "''")}'`)
    .join(",");

  return `(${values})`;
}
