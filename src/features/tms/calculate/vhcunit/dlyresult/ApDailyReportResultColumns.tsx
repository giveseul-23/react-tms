// 차량일일실적결과 (서버 ApDailyReportResultMain) 컬럼 정의.
// audit 컬럼 없음 — View 에서 audit={false}.
// CREATION_YN === 'N' 행은 빨강 배경/글자 (센차 onRenderer 대응).

import { CENTER } from "@/app/components/grid/columns/commonFormatters";

// 센차 Util.getBackgroundRedColor / getRedColor 대응
const NOT_CREATED_BG = "#FEECEC";
const NOT_CREATED_FG = "red";

// CREATION_YN === 'N' 이면 빨강, 아니면 base 스타일
const notCreatedStyle =
  (base: Record<string, string> = {}) =>
  (p: any): Record<string, string> => {
    if (p?.data?.CREATION_YN === "N") {
      return { ...base, backgroundColor: NOT_CREATED_BG, color: NOT_CREATED_FG };
    }
    return base;
  };

export const MAIN_COLUMN_DEFS = [
  {
    type: "date",
    headerName: "LBL_DLVRY_DATE",
    field: "DLVRY_DT",
    width: 200,
    align: "center",
    cellStyle: notCreatedStyle(CENTER),
  },
  {
    type: "text",
    headerName: "LBL_DAYS",
    field: "LANG_DESC",
    width: 200,
    align: "center",
    cellStyle: notCreatedStyle(CENTER),
  },
  {
    type: "combo",
    headerName: "LBL_CREATION_YN",
    field: "CREATION_YN",
    width: 200,
    align: "center",
    codeKey: "creationYn",
    cellStyle: notCreatedStyle(CENTER),
  },
  {
    type: "text",
    headerName: "LBL_DTL_DESC",
    field: "MSG",
    flex: 1,
    minWidth: 40,
    align: "left",
    cellStyle: notCreatedStyle(),
  },
];
