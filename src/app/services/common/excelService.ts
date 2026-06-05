// excelService.ts
//
// 공통 엑셀 다운로드 서비스. 컬럼 → 엑셀 파라미터 조립 + 3단계 다운로드 흐름.
// 서버 호출은 commonApi 의 공통 3단계 API(saveUserTempData → commonExcelDownPrepare
// → downloadCommonExcel)로 통일한다. (기능별 gridExcelAll 사본 사용 안 함)

import { commonApi } from "@/app/services/common/commonApi";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface ColumnDefine {
  headerName?: string;
  field?: string;
  excelPrint?: boolean;
  xtype?: string;
  editType?: string;
  // 오타 수정: edityType → editorType (기존 코드 호환을 위해 둘 다 허용)
  editorType?: string;
  dataIndex?: string;
  width?: number;
  align?: string;
  type?: string;
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

    // 오타 수정: edityType → editorType (기존 데이터 호환)
    const editorType = col.editorType ?? (col as any).edityType;

    if (col.xtype === "excheckcolumn" || editorType === "check") {
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
// AG Grid 컬럼 → 엑셀 파라미터 조립
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
    if (col.headerName === "No" || col.excelPrint === false) continue;
    if (!col.field) continue;

    headerCols.push(col.headerName ?? col.field);
    colNames.push(col.field);
    colWidths.push(col.width ?? defaultColWidth);
    const colAlign = (col.align as string) ?? resolveDefaultAlign(col);
    colAligns.push(colAlign);
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

function resolveDefaultAlign(col: ColumnDefine): string {
  const DATE_TYPES = ["date", "month", "datetime", "time"];
  if (col.editType && DATE_TYPES.includes(col.editType)) return "center";
  if (col.type === "numeric") return "right";
  if (col.type === "string") return "left";
  return "left";
}

// ────────────────────────────────────────────
// 엑셀 다운로드 (공통 3단계)
// ────────────────────────────────────────────

interface DownExcelOptions {
  columns: ColumnDefine[];
  searchParams?: Record<string, unknown>;
  menuName?: string;
  /** 서버 임시데이터 키 — 미지정 시 menuName 으로 폴백 (3단계 모두 동일 값 사용). */
  menuCd?: string;
  comboStores?: Record<string, ComboOption[]>;
  fetchFn: (params: any) => Promise<any>;
}

async function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 공통 3단계 흐름: 임시저장 → 준비 → blob 다운로드.
// 서버는 1단계 body 를 세션(PARAM_MAP)에 저장하고, 2단계 prepare 에서 그걸 읽는다.
//   - excelInfoMap = PARAM_MAP.EXCEL_INFO  → DOWN_EXCEL_FILTERED_ROWS 는 EXCEL_INFO 안에서 읽음
//   - searchUrl    = PARAM_MAP.SEARCH_URL  → EXCEL_INFO 와 형제(최상위)에서 읽음
async function runCommonExcelDownload(opts: {
  excelInfo: Partial<ExcelParams>;
  rows: Record<string, unknown>[];
  filtered: "Y" | "N";
  menuCd: string;
  fileName: string;
  searchUrl?: string;
}): Promise<void> {
  const { excelInfo, rows, filtered, menuCd, fileName, searchUrl = "" } = opts;

  await commonApi.saveUserTempData(
    {
      EXCEL_INFO: { ...excelInfo, DOWN_EXCEL_FILTERED_ROWS: filtered },
      ...(searchUrl ? { SEARCH_URL: searchUrl } : {}),
      dsSave: rows,
    },
    { MENU_CD: menuCd, CURRENT_MENUNAME: fileName },
  );

  const prepare = await commonApi.commonExcelDownPrepare(menuCd);
  if ((prepare.data as any)?.success === false) {
    throw new Error((prepare.data as any)?.msg ?? "엑셀 다운로드 준비 실패");
  }

  const response = await commonApi.downloadCommonExcel(menuCd);
  await triggerDownload(
    new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName,
  );
}

export async function downExcelSearch({
  columns,
  searchParams = {},
  menuName = "download",
  menuCd,
  fetchFn,
}: DownExcelOptions): Promise<void> {
  const excelInfo = getColumnInfoForExcelDown(columns, { menuName });
  const searchResponse = await fetchFn(searchParams);
  const rows = searchResponse.data?.result ?? searchResponse.data?.rows ?? [];
  // fetchFn 이 실제 호출한 API URL 을 SEARCH_URL 로 전달 — 어떤 api 든 자동.
  // (axios 응답의 config.url = 요청 시 넘긴 상대 경로, 예 "/menuService/searchByReact")
  const searchUrl: string = searchResponse?.config?.url ?? "";

  await runCommonExcelDownload({
    excelInfo,
    rows,
    filtered: "N",
    menuCd: menuCd ?? menuName,
    fileName: menuName,
    searchUrl,
  });
}

export async function downExcelSearched({
  columns,
  rows,
  menuName = "download",
  menuCd,
  searchUrl = "",
}: {
  columns: ColumnDefine[];
  rows: Record<string, unknown>[];
  menuName?: string;
  menuCd?: string;
  searchUrl?: string;
}): Promise<void> {
  const excelInfo = getColumnInfoForExcelDown(columns, { menuName });

  await runCommonExcelDownload({
    excelInfo,
    rows,
    filtered: "Y",
    menuCd: menuCd ?? menuName,
    fileName: menuName,
    searchUrl,
  });
}
