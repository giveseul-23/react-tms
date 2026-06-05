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
  /** 엑셀 헤더 텍스트 덮어쓰기 — 미지정 시 headerName 사용. (화면 컬럼명과 다른 헤더가 필요할 때) */
  excelColName?: string;
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

// 체크박스(Y/N) 컬럼 판별 — 그리드 컨벤션(type:"check") + 센차(xtype/editorType) 모두 인식.
export function isCheckboxColumn(col: ColumnDefine): boolean {
  const editorType = col.editorType ?? (col as any).edityType;
  return (
    col.type === "check" ||
    col.xtype === "excheckcolumn" ||
    editorType === "check"
  );
}

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

    if (isCheckboxColumn(col)) {
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

  const { checkboxColumns, dateColumns } = setColumnsForExcel(columns);

  const headerCols: string[] = [];
  const colNames: string[] = [];
  const colWidths: number[] = [];
  const colAligns: string[] = [];

  for (const col of columns) {
    if (col.headerName === "No" || col.excelPrint === false) continue;
    if (!col.field) continue;

    headerCols.push(col.excelColName ?? col.headerName ?? col.field);
    colNames.push(col.field);
    colWidths.push(col.width ?? defaultColWidth);
    // Y/N 체크박스 컬럼은 무조건 center (align 명시보다 우선).
    const colAlign = isCheckboxColumn(col)
      ? "center"
      : ((col.align as string) ?? resolveDefaultAlign(col));
    colAligns.push(colAlign);
  }

  // 콤보(코드→명 변환) 대상 — getExcelColumns 가 codeLabels(코드→명)를 붙여준 codeKey 컬럼.
  // 서버는 EXCEL_COL_COMBOCOLS 의 각 컬럼에 대해 allDataMap.get(컬럼명) 으로 데이터를 찾으므로,
  // 데이터를 함께 보내는 컬럼만 포함해야 한다(없으면 서버 NPE).
  const comboCols = collectComboCodeColumns(columns)
    .map((c) => c.field as string)
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

// align prop 미지정 시의 기본 정렬 — 그리드(processColumnDef)의 규칙과 동일하게 맞춘다.
//   DTTM 필드: date형(type date/datetime, fieldType date)일 때만 center, 아니면 left
//   type date/datetime / fieldType date → center
//   numeric(type numeric / dataType number / cellDataType number) → right
//   _STS 접미(type/cellStyle 미지정 시) → center
//   그 외 → left
function resolveDefaultAlign(col: ColumnDefine): string {
  const type = col.type;
  const c = col as any;
  const isDate =
    type === "date" || type === "datetime" || c.fieldType === "date";
  const isNumeric =
    type === "numeric" ||
    c.dataType === "number" ||
    c.cellDataType === "number";
  const field = (col.field ?? c.colId ?? "") as string;

  if (field.includes("DTTM")) return isDate ? "center" : "left";
  if (isDate) return "center";
  if (isNumeric) return "right";
  if (!c.cellStyle && !type && field.endsWith("_STS")) return "center";
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

// codeKey 컬럼 중 codeLabels(코드→명 맵)가 붙어 데이터를 보낼 수 있는 컬럼만 모은다.
type ComboCodeColumn = ColumnDefine & { codeLabels: Record<string, string> };
function collectComboCodeColumns(columns: ColumnDefine[]): ComboCodeColumn[] {
  return columns.filter(
    (c) =>
      c.field &&
      (c as any).codeLabels &&
      c.excelPrint !== false &&
      c.headerName !== "No",
  ) as ComboCodeColumn[];
}

// (B) 서버 변환용 코드 데이터 — { [컬럼field]: [{CODE,NAME}, ...] }.
// 서버 replaceComboValueToName 가 allDataMap.get(컬럼field) 로 읽어 코드→명 치환(filtered:"N").
function buildComboCodeData(
  columns: ColumnDefine[],
): Record<string, { CODE: string; NAME: string }[]> {
  const out: Record<string, { CODE: string; NAME: string }[]> = {};
  for (const c of collectComboCodeColumns(columns)) {
    out[c.field as string] = Object.entries(c.codeLabels).map(
      ([CODE, NAME]) => ({ CODE, NAME }),
    );
  }
  return out;
}

// (A) codeKey 컬럼 코드→라벨 치환 — getExcelColumns 가 컬럼에 붙여준 codeLabels(코드→명) 사용.
// 서버 "Y"(보이는 데이터) 분기는 dsSave 를 그대로 출력하므로, 여기서 라벨로 바꿔 보내면 라벨이 찍힌다.
function applyCodeLabels(
  rows: Record<string, unknown>[],
  columns: ColumnDefine[],
): Record<string, unknown>[] {
  const codeCols = columns.filter(
    (c) => c.field && (c as any).codeLabels,
  ) as (ColumnDefine & { codeLabels: Record<string, string> })[];
  if (codeCols.length === 0) return rows;
  return rows.map((row) => {
    const out = { ...row };
    for (const c of codeCols) {
      const v = out[c.field as string];
      if (v == null || v === "") continue;
      const label = c.codeLabels[String(v)];
      if (label != null) out[c.field as string] = label;
    }
    return out;
  });
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
  /** 검색 조건 — filtered:"N"(전체조회) 시 서버가 SEARCH_URL 재조회에 쓰도록 PARAM_MAP 최상위에 실어줌. */
  extraParams?: Record<string, unknown>;
  /** 콤보 코드→명 데이터 — { [컬럼field]: [{CODE,NAME}] }. 서버가 재조회 결과 코드 치환에 사용. */
  codeData?: Record<string, unknown>;
}): Promise<void> {
  const {
    excelInfo,
    rows,
    filtered,
    menuCd,
    fileName,
    searchUrl = "",
    extraParams = {},
    codeData = {},
  } = opts;

  await commonApi.saveUserTempData(
    {
      // codeData 를 먼저 펼치고 검색조건(extraParams)을 나중에 → field 명 충돌 시 검색조건이 우선(재조회 정확성 보존).
      ...codeData,
      ...extraParams,
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

// fetchFn 이 실제로 보낸 요청 파라미터를 axios 응답 config 에서 추출.
// 검색 API 는 POST body(config.data) 또는 query(config.params) 로 조건을 보낸다.
// page/limit 은 전체조회를 막지 않도록 제외.
function extractRequestParams(config: any): Record<string, unknown> {
  if (!config) return {};
  let body: Record<string, unknown> = {};
  const raw = config.data;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        body = parsed;
      }
    } catch {
      /* JSON 이 아니면 무시 */
    }
  } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    body = raw;
  }
  const query =
    config.params && typeof config.params === "object" ? config.params : {};
  const { page: _page, limit: _limit, ...rest } = { ...query, ...body };
  return rest;
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
  // 서버가 filtered:"N"(전체조회) 시 SEARCH_URL 로 동일 조건 재조회하도록 검색 파라미터 동봉.
  const extraParams = extractRequestParams(searchResponse?.config);

  await runCommonExcelDownload({
    excelInfo,
    rows,
    filtered: "N",
    menuCd: menuCd,
    fileName: String(menuName).replaceAll(" ", "_") + Date.now(),
    searchUrl,
    extraParams,
    codeData: buildComboCodeData(columns),
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
    rows: applyCodeLabels(rows, columns),
    filtered: "Y",
    menuCd: menuCd,
    fileName: String(menuName).replaceAll(" ", "_") + Date.now(),
    searchUrl,
  });
}
