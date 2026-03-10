// excelUtils.ts 상단
import { tenderApi } from "@/app/services/tender/tenderApi";
// excelUtils.ts

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface ColumnDefine {
  headerName?: string; // AG Grid
  field?: string; // AG Grid
  excelPrint?: boolean;
  xtype?: string;
  editType?: string;
  edityType?: string;
  dataIndex?: string;
  width?: number;
  align?: string;
  [key: string]: unknown;
}

export interface SearchConditionItem {
  dataType: "STRING";
  rowStatus: "normal";
  type: "TEXT";
  val0: string;
  val1: string;
  val2: string;
  val3: unknown;
  val4: string;
}

export interface ComboOption {
  NAME: string;
  CODE: string;
}

export interface CodeDataItem {
  key: string;
  data: ComboOption[];
}

export interface ExcelParams {
  DOWN_EXCEL_FILTERED_ROWS: "Y" | "N";
  SEARCH_URL: string;
  MENU_CD: string;
  EXCEL_SHEET_TITLE: string;
  EXCEL_HEADERCOLS: string;
  EXCEL_HEADER_DEPTH: number;
  EXCEL_REQUIRED_HEADERS: string;
  EXCEL_COLNAMES: string;
  EXCEL_COL_WIDTH: string;
  EXCEL_EDIT_FALSE_COLS: string;
  EXCEL_FIXED_COLS: string;
  EXCEL_DATE_COLS: string;
  EXCEL_DATE_COLS_FORMAT: string;
  EXCEL_NUMBER_COLS: string;
  EXCEL_COL_ALIGN: string;
  EXCEL_COL_HIDDEN: string;
  EXCEL_COL_COMBOCOLS: string;
  EXCEL_COL_CHECKCOLS: string;
  DS_JSONDATA?: Record<string, unknown>;
  [key: string]: unknown;
}

// ────────────────────────────────────────────
// 컬럼을 종류별로 분류
// ────────────────────────────────────────────

export function setColumnsForExcel(columns: ColumnDefine[]): {
  checkboxColumns: ColumnDefine[];
  comboColumns: ColumnDefine[];
  dateColumns: ColumnDefine[];
  columnDefines: ColumnDefine[];
} {
  const checkboxColumns: ColumnDefine[] = [];
  const comboColumns: ColumnDefine[] = [];
  const dateColumns: ColumnDefine[] = [];
  const columnDefines: ColumnDefine[] = [];

  const DATE_TYPES = ["date", "month", "datetime", "time"];

  for (const col of columns) {
    if (col.excelPrint === false) continue;
    if (col.headerName === "No") continue;

    if (col.xtype === "excheckcolumn" || col.edityType === "check") {
      checkboxColumns.push(col);
    } else if (col.editType === "combo") {
      comboColumns.push(col);
    } else if (col.editType != null && DATE_TYPES.includes(col.editType)) {
      dateColumns.push(col);
    } else {
      columnDefines.push(col);
    }
  }

  return { checkboxColumns, comboColumns, dateColumns, columnDefines };
}

// ────────────────────────────────────────────
// 검색 파라미터 → dsSearchCondition 변환
// ────────────────────────────────────────────

export function changeParamsToSearchCondition(
  params: Record<string, unknown>,
): SearchConditionItem[] {
  return Object.entries(params).map(([key, value]) => ({
    dataType: "STRING",
    rowStatus: "normal",
    type: "TEXT",
    val0: key,
    val1: "라벨",
    val2: "=",
    val3: value,
    val4: "",
  }));
}

// ────────────────────────────────────────────
// AG Grid 컬럼 → 엑셀 파라미터 조립
// (ExtJS getColumnInfoForExcelDown 대체)
// ────────────────────────────────────────────

export function getColumnInfoForExcelDown(
  columns: ColumnDefine[],
  options: {
    menuName?: string;
    fixedCols?: string;
    defaultColWidth?: number;
  } = {},
): Partial<ExcelParams> {
  const {
    menuName = "메뉴명",
    fixedCols = "",
    defaultColWidth = 100,
  } = options;

  const { checkboxColumns, comboColumns, dateColumns } =
    setColumnsForExcel(columns);

  const headerCols: string[] = [];
  const colNames: string[] = [];
  const colWidths: number[] = [];
  const colAligns: string[] = [];

  for (const col of columns) {
    // No 컬럼, excelPrint=false, cellRenderer만 있고 field 없는 컬럼 제외
    if (col.headerName === "No" || col.excelPrint === false) continue;
    if (!col.field) continue; // ← field 없으면 엑셀에 못 씀

    headerCols.push(col.headerName ?? col.field);
    colNames.push(col.field);
    colWidths.push(col.width ?? defaultColWidth);
    colAligns.push((col.align as string) ?? "left");
  }

  const comboCols = comboColumns
    .map((c) => c.field ?? c.dataIndex ?? "")
    .filter(Boolean)
    .join(",");

  const checkCols = checkboxColumns
    .map((c) => c.field ?? c.dataIndex ?? "")
    .filter(Boolean)
    .join(",");

  const dateCols = dateColumns
    .map((c) => c.field ?? c.dataIndex ?? "")
    .filter(Boolean)
    .join(",");

  return {
    EXCEL_SHEET_TITLE: menuName,
    EXCEL_HEADERCOLS: encodeURI(headerCols.join(",")),
    EXCEL_HEADER_DEPTH: 1,
    EXCEL_REQUIRED_HEADERS: "",
    EXCEL_COLNAMES: encodeURI(colNames.join(",")),
    EXCEL_COL_WIDTH: encodeURI(colWidths.join(",")),
    EXCEL_EDIT_FALSE_COLS: "",
    EXCEL_FIXED_COLS: fixedCols,
    EXCEL_DATE_COLS: dateCols,
    EXCEL_DATE_COLS_FORMAT: "",
    EXCEL_NUMBER_COLS: "",
    EXCEL_COL_ALIGN: encodeURI(colAligns.join(",")),
    EXCEL_COL_HIDDEN: "",
    EXCEL_COL_COMBOCOLS: comboCols,
    EXCEL_COL_CHECKCOLS: checkCols,
  };
}

// ────────────────────────────────────────────
// 콤보 컬럼 코드 데이터 추출
// (ExtJS getColumnsCodeData 대체)
// ────────────────────────────────────────────

export function getColumnsCodeData(
  comboColumns: ColumnDefine[],
  comboStores: Record<string, ComboOption[]>,
): CodeDataItem[] {
  return comboColumns
    .map((col) => {
      const key = col.field ?? col.dataIndex ?? "";
      return { key, data: comboStores[key] ?? [] };
    })
    .filter((item) => item.key !== "");
}

// ────────────────────────────────────────────
// 엑셀 다운로드 메인 함수
// 1단계: prepare API 호출 (세션 저장)
// 2단계: commonExcelDown 으로 파일 다운로드
// ────────────────────────────────────────────

interface DownExcelOptions {
  columns: ColumnDefine[];
  searchParams?: Record<string, unknown>;
  menuName?: string;
  comboStores?: Record<string, ComboOption[]>;
  fetchFn: (params: any) => Promise<any>; // ← 추가, searchUrl 제거
}

// excelUtils.ts
export async function downExcelSearch({
  columns,
  searchParams = {},
  menuName = "download",
  comboStores = {},
  fetchFn, // ← API 함수를 주입받음
}: DownExcelOptions): Promise<void> {
  const { comboColumns } = setColumnsForExcel(columns);
  const excelInfo = getColumnInfoForExcelDown(columns, { menuName });

  // 1단계: 전달받은 fetchFn으로 전체 데이터 조회
  const searchResponse = await fetchFn(searchParams);
  const rows = searchResponse.data?.result ?? searchResponse.data?.rows ?? [];

  // 2단계: 엑셀 다운로드
  const payload = {
    fileName: menuName,
    rows,
    EXCEL_INFO: excelInfo,
  };

  const response = await tenderApi.gridExcelAll(payload);

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${menuName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 현재 그리드에 보이는 데이터로 엑셀 다운 (센차 downExcelSearched 대체)
export async function downExcelSearched({
  columns,
  rows,
  menuName = "download",
}: {
  columns: ColumnDefine[];
  rows: Record<string, unknown>[];
  menuName?: string;
}): Promise<void> {
  const excelInfo = getColumnInfoForExcelDown(columns, { menuName });

  const payload = {
    fileName: menuName,
    rows,
    EXCEL_INFO: excelInfo,
  };

  const response = await tenderApi.gridExcelAll(payload);

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${menuName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
