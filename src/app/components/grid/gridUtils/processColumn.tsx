// src/app/components/grid/gridUtils/processColumn.tsx
// Shared column transformation helpers for DataGrid and TreeGrid.
//
// 컬럼 정의(ColDef) 변환 로직 — DataGrid 와 TreeGrid 모두 동일하게 사용.
//
// 처리 항목:
//   - codeKey → cellRenderer 자동 주입 (codeMap 의 코드 → 라벨 변환)
//   - type "combo" + editable + codeKey → cellEditor 로 ComboCellEditor 자동 주입
//     (평소엔 라벨 텍스트, 편집 시엔 dropdown — 옵션은 codeMap[codeKey] 전체)
//   - headerName Lang.get (noLang:true 면 원문 유지)
//   - ColGroupDef.children 재귀 변환
//   - align prop → cellStyle.textAlign + headerClass (type 정렬보다 우선)
//   - type "numeric" → 우측 정렬 + decimalPlaces 자동 포맷 (align prop 우선)
//   - type "date" / fieldType "date" → 중앙 정렬 + YYYY-MM-DD 슬라이스 (align prop 우선)
//   - field 이름 *DTTM* → Util.formatDttm 자동 포맷 + (type:"date" 면 중앙 정렬)
//   - field 이름 *_STS* → 중앙 정렬 (cellStyle/type/align 미지정 시)
//   - type 미지정 → "text" 자동 주입
//   - disableMaxWidth:true → maxWidth null

import React from "react";
import { Search } from "lucide-react";
import type { ColDef, ColGroupDef } from "ag-grid-community";

import { Lang } from "@/app/services/common/Lang";
import { Util } from "@/app/services/common/Util";
import { ComboCellEditor } from "@/app/components/grid/cellEditors/ComboCellEditor";
import { PasswordCellEditor } from "@/app/components/grid/cellEditors/PasswordCellEditor";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { commitRowChange, commitRowChanges } from "./rowStatus";

// CommonPopup 은 내부에서 DataGrid 를 렌더 → 정적 import 시 순환참조.
// lazy 로 끊고, 팝업 셀이 실제로 열릴 때만 로드한다.
const CommonPopup = React.lazy(() =>
  import("@/app/components/popup/CommonPopup").then((m) => ({
    default: m.CommonPopup,
  })),
);

type AnyCol = ColDef<any> | ColGroupDef<any>;

export type ProcessOptions = {
  codeMap?: Record<string, Record<string, string>>;
  /** "No" 컬럼처럼 row 길이에 따른 width 가 필요한 경우 사용. (TreeGrid 는 미사용) */
  rowCountForNo?: number;
  /** ComboCellEditor 가 commit 시 React state 의 rows 배열을 갱신하기 위해 사용.
   *  ag-grid 의 cellEditor commit 흐름은 internal node.data 만 mutate 하고
   *  React state 까지 도달 못 해 stale row 로 reset 되는 케이스가 있음 →
   *  cellEditor 가 직접 setRowData 호출해 양쪽 동기화. */
  setRowData?: (updater: any) => void;
  /** type "popup"/"popuser" 셀이 팝업을 띄울 때 사용 — DataGrid 가 usePopup() 으로 주입. */
  openPopup?: (payload: {
    title?: string;
    content: React.ReactNode;
    width?: any;
  }) => void;
  closePopup?: () => void;
};

const HEADER_PADDING = 32;
const CELL_PADDING = 24;

// ag-grid 가 모르는 우리 커스텀 colDef 키들 — 내부 processColumn 분기에서만
// 활용하고 ag-grid 에 넘기기 전에 strip. 그대로 두면:
//   1) "invalid colDef property" 경고 발생
//   2) colDef.type 이 columnTypes 에 없으면 ag-grid 의 valueGetter 동작이
//      일관되지 않아 cellRenderer 의 params.value 가 undefined 로 들어옴
const CUSTOM_KEYS = new Set([
  "type",
  "align",
  "codeKey",
  "fieldType",
  "decimalPlaces",
  "disableMaxWidth",
  "noLang",
  "summable",
  "defaultYn",
  "dateUnit",
  "isPrimaryKey",
  "insertable",
  "inputType",
  "required",
  // popup / popuser 컬럼 전용
  "sqlId",
  "fetchFn",
  "nameField",
  "popupTitle",
  "popupWidth",
  "renderPopup",
  "keyParam",
  "extraParams",
]);

function stripCustomKeys<T extends Record<string, any>>(col: T): T {
  const out: Record<string, any> = {};
  for (const k of Object.keys(col)) {
    if (!CUSTOM_KEYS.has(k)) out[k] = col[k];
  }
  return out as T;
}

let canvasRef: HTMLCanvasElement | null = null;
function measureTextWidth(text: string): number {
  if (typeof document === "undefined") return text.length * 7;
  if (!canvasRef) canvasRef = document.createElement("canvas");
  const ctx = canvasRef.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = "11px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
  return ctx.measureText(text).width;
}

const translate = (col: any): string =>
  col?.noLang ? col.headerName : Lang.get(col.headerName);

function walkChildren(
  children: any[] | undefined,
  opts: ProcessOptions,
): any[] | undefined {
  if (!Array.isArray(children)) return children;
  const { codeMap, setRowData } = opts;
  return children.map((child) => {
    const withRenderer = injectCodeRenderer(child, codeMap) as any;
    const withEditor = injectComboEditor(
      withRenderer,
      codeMap,
      setRowData,
    ) as any;
    const withPassword = injectPasswordEditor(withEditor, setRowData) as any;
    const withCheck = injectCheckRenderer(withPassword, setRowData) as any;
    const withPopup = injectPopupCell(withCheck, opts) as any;
    const withDate = injectDateCell(withPopup, opts) as any;
    const withPolicy = applyEditPolicy(withDate) as any;
    const withRequired =
      (child as any).required === true
        ? mergeHeaderClass(withPolicy, "ag-header-required")
        : withPolicy;
    return stripCustomKeys({
      ...withRequired,
      headerName: translate(withRequired),
      children: walkChildren(withRequired.children, opts),
    });
  });
}

/** codeKey 가 있는 컬럼에 자동 cellRenderer 주입 (이미 cellRenderer 있으면 유지). */
function injectCodeRenderer(
  col: AnyCol,
  codeMap?: Record<string, Record<string, string>>,
): AnyCol {
  const codeKey = (col as any).codeKey as string | undefined;
  if (!codeKey || (col as any).cellRenderer) return col;
  return {
    ...col,
    cellRenderer: (params: any) => {
      const code = params.value;
      // 빈값(빈 문자열 / null / undefined) 은 회색 "―" 로 표시.
      // 실제 데이터는 그대로 두고 표시만 변경 — 저장 시 빈값 그대로 전송됨.
      if (code === "" || code == null) {
        return (
          <span className="px-2 py-0.5 rounded-lg text-xs text-gray-400">
            -
          </span>
        );
      }
      const label = codeMap?.[codeKey]?.[String(code)] ?? code;
      return <span className="px-2 py-0.5 rounded-lg text-xs">{label}</span>;
    },
  } as AnyCol;
}

/**
 * type "check" 컬럼에 체크박스 cellRenderer 자동 주입.
 *   - 표시: row[field] === "Y" → checked, 아니면 unchecked
 *   - 클릭: "Y" ↔ "N" 토글 → commitRowChange 로 React state 갱신 + EDIT_STS 마킹
 *   - 이미 cellRenderer 가 정의돼 있으면 유지
 *   - 신규 행의 default 값 자동 주입은 DataGrid 가 column.defaultYn 으로 처리
 */
function injectCheckRenderer(
  col: AnyCol,
  setRowData?: (updater: any) => void,
): AnyCol {
  const c = col as any;
  if (c.type !== "check") return col;
  if (c.cellRenderer) return col;
  const field = (c.field ?? c.colId) as string | undefined;
  if (!field) return col;
  return {
    ...col,
    cellRenderer: (params: any) => {
      const checked = params.value === "Y";
      return (
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            className="ag-input-field-input ag-checkbox-input"
            checked={checked}
            onChange={() => {
              const next = checked ? "N" : "Y";
              commitRowChange(setRowData, params.node?.data, field, next);
            }}
          />
        </div>
      );
    },
  } as AnyCol;
}

/**
 * type "combo" + codeKey 컬럼에 cellEditor 자동 주입.
 *   - 평소엔 위 injectCodeRenderer 가 라벨 텍스트로 표시
 *   - 편집 시엔 ComboCellEditor 가 codeMap[codeKey] 모든 코드/명을 dropdown 으로 노출
 *   - 이미 cellEditor 가 정의돼 있으면 유지
 */
function injectComboEditor(
  col: AnyCol,
  codeMap?: Record<string, Record<string, string>>,
  setRowData?: (updater: any) => void,
): AnyCol {
  const c = col as any;
  if (c.type !== "combo") return col;
  const codeKey = c.codeKey as string | undefined;
  if (!codeKey || c.cellEditor) return col;
  return {
    ...col,
    cellEditor: ComboCellEditor,
    cellEditorParams: {
      ...(c.cellEditorParams ?? {}),
      codeMap: codeMap?.[codeKey] ?? {},
      setRowData,
    },
    cellEditorPopup: c.cellEditorPopup ?? true,
  } as AnyCol;
}

function injectPasswordEditor(
  col: AnyCol,
  setRowData?: (updater: any) => void,
): AnyCol {
  const c = col as any;
  if (c.inputType !== "password") return col;

  return {
    ...col,
    ...(c.cellEditor ? {} : { cellEditor: PasswordCellEditor }),
    cellEditorParams: {
      ...(c.cellEditorParams ?? {}),
      setRowData,
    },
    ...(c.cellRenderer
      ? {}
      : {
          cellRenderer: (params: any) => {
            const value = String(params.value ?? "");
            return "*".repeat(Math.min(value.length, 6));
          },
        }),
  } as AnyCol;
}

/**
 * type "popup" / "popuser" 컬럼에 셀 렌더러(값 + 돋보기) 자동 주입.
 *   - 편집(돋보기 노출) 정책은 다른 컬럼 타입과 동일하게 insertable/editable + EDIT_STS 로 제어:
 *       insertable → 추가행(EDIT_STS "I"), editable → 수정행, 둘 다 → 항상, 둘 다 미지정 → 노출 안 함.
 *     편집 불가 행은 돋보기 없이 표시값(라벨/원값) 텍스트만 렌더.
 *   - 돋보기 클릭:
 *       popup   → CommonPopup(sqlId/fetchFn) 오픈. 선택 시 field=CODE, nameField=NAME write-back.
 *       popuser → 컬럼의 renderPopup({ row, commit, close }) 결과를 openPopup content 로 띄움.
 *   - 이미 cellRenderer 가 있으면 유지.
 */
function injectPopupCell(col: AnyCol, opts: ProcessOptions): AnyCol {
  const c = col as any;
  if (c.type !== "popup" && c.type !== "popuser") return col;
  if (c.cellRenderer) return col;
  const field = (c.field ?? c.colId) as string | undefined;
  if (!field) return col;

  const codeKey = c.codeKey as string | undefined;
  const isUser = c.type === "popuser";
  // 돋보기 노출(편집) 정책 — 다른 컬럼 타입과 동일 (resolveEditMode):
  //   둘 다 미지정 → 항상 노출, insertable → 추가행, editable → 수정행, 명시적 끔 → 노출 안 함.
  const mode = resolveEditMode(c);
  if (mode === "none") return col;

  return {
    ...col,
    // 팝업 셀은 ag-grid 네이티브 인라인 편집을 쓰지 않음 →
    // applyEditPolicy 의 기본값(true)이 인라인 에디터를 안 박도록 editable:false 로 strip.
    insertable: undefined,
    editable: false,
    cellRenderer: (params: any) => {
      if (!params.data || params.node?.rowPinned) return null;
      const { openPopup, closePopup, setRowData, codeMap } = opts;
      const raw = params.value;
      const display =
        raw === "" || raw == null
          ? ""
          : codeKey
            ? (codeMap?.[codeKey]?.[String(raw)] ?? raw)
            : raw;

      // 편집 가능 여부 (EDIT_STS 기반) — 안 되면 돋보기 없이 표시값만
      const editStsI = params.node?.data?.EDIT_STS === "I";
      const cellEditable = rowEditableByMode(mode, editStsI);
      if (!cellEditable) {
        return <span className="truncate">{display}</span>;
      }

      const row = params.node?.data;
      const close = () => closePopup?.();

      const onOpen = () => {
        if (!openPopup) return;
        if (isUser) {
          const content = c.renderPopup?.({
            row,
            commit: (patch: Record<string, any>) =>
              commitRowChanges(setRowData, row, patch),
            close,
          });
          if (content) {
            openPopup({
              title: c.popupTitle ?? c.headerName,
              width: c.popupWidth ?? "2xl",
              content,
            });
          }
        } else {
          openPopup({
            title: c.popupTitle ?? c.headerName,
            width: c.popupWidth ?? "2xl",
            content: (
              <React.Suspense fallback={null}>
                <CommonPopup
                  sqlId={c.sqlId}
                  fetchFn={c.fetchFn}
                  extraParams={{
                    ...(c.keyParam ? { keyParam: c.keyParam } : {}),
                    ...(c.extraParams ?? {}),
                  }}
                  onApply={(picked: any) => {
                    const patch: Record<string, any> = { [field]: picked.CODE };
                    if (c.nameField) patch[c.nameField] = picked.NAME;
                    commitRowChanges(setRowData, row, patch);
                    close();
                  }}
                  onClose={close}
                />
              </React.Suspense>
            ),
          });
        }
      };

      return (
        <div className="flex items-center gap-1 h-full w-full">
          <span className="flex-1 truncate">{display}</span>
          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 p-0.5 text-slate-400 hover:text-[rgb(var(--primary))]"
            aria-label="검색"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  } as AnyCol;
}

/** 외부 export — 우리 커스텀 키 (type, align, codeKey 등) 를 ag-grid 에
 *  그대로 노출하지 않도록 strip 한 결과를 반환. 내부 분기에서는 type 등을
 *  활용하지만 ag-grid 에는 표준 키만 전달. required:true 컬럼은 headerClass
 *  에 "ag-header-required" 가 자동 추가되어 헤더 텍스트 우측에 빨간 * 가 표시됨. */
export function processColumnDef(
  col: AnyCol,
  opts: ProcessOptions = {},
): AnyCol {
  const required = (col as any).required === true;
  const raw = processColumnDefRaw(col, opts);
  const withRequired = required
    ? mergeHeaderClass(raw, "ag-header-required")
    : raw;
  return stripCustomKeys(withRequired);
}

/** headerClass 에 클래스 한 개를 안전하게 머지. 기존이 string 이면 공백으로 합치고,
 *  배열이면 push, 함수이면 손대지 않는다(ag-grid 가 함수를 호출해 결과를 사용). */
function mergeHeaderClass(col: AnyCol, cls: string): AnyCol {
  const existing = (col as any).headerClass;
  let merged: any;
  if (!existing) merged = cls;
  else if (typeof existing === "string") merged = `${existing} ${cls}`;
  else if (Array.isArray(existing)) merged = [...existing, cls];
  else merged = existing;
  return { ...col, headerClass: merged } as AnyCol;
}

// ── 날짜 셀 picker: 표시값/저장값 포맷 변환 헬퍼 ──────────────────
//   화면의 저장 포맷은 검색 필터 컨벤션과 동일 (compact: 대시/콜론/T 제거).
//   DatePickerPopover 는 "YYYY-MM-DD" 또는 "YYYY-MM-DDTHH:MM:SS" 만 받음.
function pickerInputFromRaw(
  value: any,
  withTime: boolean,
  unit: "year" | "month" | "day" = "day",
): string {
  if (value == null || value === "") return "";
  const s = String(value).replace(/[\s\-:/T]/g, "");
  if (unit === "year") return s.length >= 4 ? s.slice(0, 4) : "";
  if (unit === "month")
    return s.length >= 6 ? `${s.slice(0, 4)}-${s.slice(4, 6)}` : "";
  if (s.length < 8) return "";
  const d = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  if (!withTime) return d;
  const t = s.slice(8, 14).padEnd(6, "0");
  return `${d}T${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4, 6)}`;
}

function pickerOutputToCompact(v: string): string {
  return v.replace(/[\s\-:T]/g, "");
}

// 단위별 표시 포맷 — 년: "YYYY", 년월: "YYYY-MM" (day 는 Util.formatDttm 사용).
function formatDateByUnit(value: any, unit: "year" | "month"): string {
  if (value == null || value === "") return "";
  const s = String(value).replace(/[\s\-:/T]/g, "");
  if (unit === "year") return s.slice(0, 4);
  return s.length >= 6 ? `${s.slice(0, 4)}-${s.slice(4, 6)}` : s;
}

/** type "date" / "datetime" + (insertable|editable) 컬럼에 picker cellRenderer 주입.
 *   - 셀 안에 DatePickerPopover (border-less) → 클릭 시 조회조건과 동일한 데이트피커.
 *   - withTime = (type === "datetime") 으로 시간 입력 토글.
 *   - type "date" 는 dateUnit 으로 단위 지정 — "year"(YYYY) / "month"(YYYYMM) / "day"(YYYYMMDD, 기본).
 *     단위별로 데이트피커 화면(연/년월/일)과 저장·표시 포맷이 달라진다.
 *   - 편집 가능 row 판단 (insertable/editable + EDIT_STS) → 안 되면 plain 텍스트.
 *   - ag-grid 의 default cellEditor 와 충돌 막기 위해 insertable/editable 을
 *     strip 해서 반환 → applyEditPolicy 가 editable:true 함수를 안 박음.
 *   - 이미 cellRenderer 가 있으면 유지. */
function injectDateCell(col: AnyCol, opts: ProcessOptions): AnyCol {
  const c = col as any;
  if (c.type !== "date" && c.type !== "datetime") return col;
  if (c.cellRenderer) return col;
  const field = (c.field ?? c.colId) as string | undefined;
  if (!field) return col;
  const mode = resolveEditMode(c);
  if (mode === "none") return col;

  const withTime = c.type === "datetime";
  // 선택 단위 — datetime 은 항상 day(+시간), date 는 dateUnit 으로 년/년월/년월일 지정.
  const unit: "year" | "month" | "day" =
    c.type === "datetime" ? "day" : ((c.dateUnit as any) ?? "day");
  const { setRowData } = opts;

  return {
    ...col,
    insertable: undefined,
    editable: false,
    cellRenderer: (params: any) => {
      if (!params.data || params.node?.rowPinned) return null;
      const row = params.node?.data;
      const editStsI = row?.EDIT_STS === "I";
      const cellEditable = rowEditableByMode(mode, editStsI);
      const raw = params.value;

      const display =
        unit === "day" ? Util.formatDttm(raw) : formatDateByUnit(raw, unit);
      if (!cellEditable) {
        return <span>{display}</span>;
      }
      // popup 셀과 동일한 [값 + 작은 아이콘 버튼] 패턴 — 텍스트 가리지 않음
      return (
        <div className="flex items-center gap-1 h-full w-full">
          <span className="flex-1 truncate">{display}</span>
          <DatePickerPopover
            value={pickerInputFromRaw(raw, withTime, unit)}
            onChange={(v: string) => {
              const next = v ? pickerOutputToCompact(v) : "";
              commitRowChange(setRowData, row, field, next);
            }}
            withTime={withTime}
            precision={unit}
            iconOnly
          />
        </div>
      );
    },
  } as AnyCol;
}

type EditMode = "always" | "insert" | "update" | "none" | "custom";

// insertable/editable 미지정 시 "기본 편집 ON" 으로 둘 입력 위젯 타입.
// 그 외 타입(text/numeric/combo/표시용 등)은 미지정이면 읽기전용 →
// 읽기전용 컬럼에 editable:false 를 일일이 안 달아도 안전(안전장치).
const DEFAULT_EDITABLE_TYPES = new Set([
  "date",
  "datetime",
  "popup",
  "popuser",
]);

/** insertable / editable + type 으로 편집 모드 결정.
 *   - 둘 다 미지정:
 *       입력 위젯 타입(date/datetime/popup/popuser) → "always" (기본 편집),
 *       그 외 타입 / field 없는 컬럼 → "none" (읽기전용 기본 — 안전장치).
 *   - 하나라도 명시하면 타입 무관하게 그 설정이 우선:
 *       insertable:true → "insert"(추가행), editable:true → "update"(수정행), 둘 다 true → "always",
 *       그 외(명시적 false 조합) → "none"
 *   - editable 이 함수/변수(boolean 아님) → "custom" (ag-grid 로 그대로 passthrough). */
function resolveEditMode(c: any): EditMode {
  if (
    typeof c.editable !== "undefined" &&
    c.editable !== true &&
    c.editable !== false
  ) {
    return "custom";
  }
  if (c.insertable === undefined && c.editable === undefined) {
    return (c.field || c.colId) && DEFAULT_EDITABLE_TYPES.has(c.type)
      ? "always"
      : "none";
  }
  const ins = c.insertable === true;
  const edt = c.editable === true;
  if (ins && edt) return "always";
  if (ins) return "insert";
  if (edt) return "update";
  return "none";
}

/** mode + EDIT_STS 로 해당 행 편집 가능 여부. */
function rowEditableByMode(mode: EditMode, editStsI: boolean): boolean {
  return mode === "insert" ? editStsI : mode === "update" ? !editStsI : true;
}

/** insertable / editable 을 EDIT_STS 기반 editable 함수로 변환 (resolveEditMode 정책). */
function applyEditPolicy(col: AnyCol): AnyCol {
  const c = col as any;
  const mode = resolveEditMode(c);
  if (mode === "custom" || mode === "none") return col;
  let editableFn: any;
  if (mode === "always") editableFn = true;
  else if (mode === "insert") editableFn = (p: any) => p.data?.EDIT_STS === "I";
  else editableFn = (p: any) => p.data?.EDIT_STS !== "I";
  return { ...c, editable: editableFn } as AnyCol;
}

function processColumnDefRaw(col: AnyCol, opts: ProcessOptions = {}): AnyCol {
  const codeMap = opts.codeMap;

  // codeKey → cellRenderer (라벨 표시) + type "combo" 면 cellEditor (dropdown) 주입
  // + type "check" 면 체크박스 cellRenderer 주입
  const prepared = applyEditPolicy(
    injectDateCell(
      injectPopupCell(
        injectCheckRenderer(
          injectPasswordEditor(
            injectComboEditor(
              injectCodeRenderer(col, codeMap),
              codeMap,
              opts.setRowData,
            ),
            opts.setRowData,
          ),
          opts.setRowData,
        ),
        opts,
      ),
      opts,
    ),
  );

  // "No" 컬럼 (DataGrid 전용 — rowCountForNo 가 없으면 일반 처리)
  if (
    "headerName" in prepared &&
    prepared.headerName === "No" &&
    typeof opts.rowCountForNo === "number"
  ) {
    const maxNum = String(opts.rowCountForNo || 1);
    const noWidth = Math.max(
      measureTextWidth("No") + HEADER_PADDING,
      measureTextWidth(maxNum) + CELL_PADDING,
    );
    return {
      ...prepared,
      headerName: "No",
      width: noWidth,
      minWidth: noWidth,
      maxWidth: noWidth,
      suppressHeaderMenuButton: true,
      sortable: false,
      filter: false,
      floatingFilter: false,
      getQuickFilterText: () => null,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-center",
      valueGetter: (params: any) =>
        params.node?.rowPinned === "bottom"
          ? "Total"
          : (params.node?.rowIndex ?? 0) + 1,
    } as AnyCol;
  }

  const alignProp = (prepared as any).align as
    | "left"
    | "center"
    | "right"
    | undefined;
  const alignBlock = alignProp
    ? {
        cellStyle: { textAlign: alignProp },
        headerClass: `ag-header-${alignProp}`,
      }
    : null;
  const typeBlock = (prepared as any).type ? {} : { type: "text" };

  const translatedChildren = walkChildren((prepared as any).children, opts);

  if ((prepared as any).disableMaxWidth === true) {
    return {
      ...prepared,
      maxWidth: null,
      headerName: translate(prepared),
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...(alignBlock ?? {}),
      ...typeBlock,
    } as AnyCol;
  }

  const colDef = prepared as ColDef<any>;
  const field = (colDef.field ?? colDef.colId ?? "") as string;

  // DTTM 필드: 자동 포맷 + 정렬(align prop > type:"date|datetime" → center > 미지정)
  if (field.includes("DTTM")) {
    const isDateTypedDttm =
      (colDef as any).type === "date" ||
      (colDef as any).type === "datetime" ||
      (colDef as any).fieldType === "date";
    const userDttmCellStyle = (colDef as any).cellStyle;
    const baseDttmCellStyle =
      userDttmCellStyle && typeof userDttmCellStyle === "object"
        ? userDttmCellStyle
        : {};
    const finalDttmAlign =
      alignProp ?? (isDateTypedDttm ? "center" : undefined);
    const dttmAlignBlock = finalDttmAlign
      ? {
          cellStyle: { ...baseDttmCellStyle, textAlign: finalDttmAlign },
          headerClass: `ag-header-${finalDttmAlign}`,
        }
      : null;
    return {
      ...prepared,
      headerName: translate(prepared),
      valueFormatter: (params: any) => Util.formatDttm(params.value),
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...(dttmAlignBlock ?? {}),
      ...typeBlock,
    } as AnyCol;
  }

  // type:"date" / "datetime" / fieldType:"date" → 가운데 정렬 (align prop 우선)
  //   date     → YYYY-MM-DD 까지만
  //   datetime → "YYYY-MM-DD HH:MM:SS" (T 는 공백으로) — Util.formatDttm 과 동일 톤
  if (
    (colDef as any).type === "date" ||
    (colDef as any).type === "datetime" ||
    (colDef as any).fieldType === "date"
  ) {
    const isDatetime = (colDef as any).type === "datetime";
    const dateUnit = (colDef as any).dateUnit as
      | "year"
      | "month"
      | "day"
      | undefined;
    const userDateCellStyle = (colDef as any).cellStyle;
    const baseDateCellStyle =
      userDateCellStyle && typeof userDateCellStyle === "object"
        ? userDateCellStyle
        : {};
    const finalDateAlign = alignProp ?? "center";
    return {
      ...prepared,
      headerName: translate(prepared),
      valueFormatter: (params: any) =>
        isDatetime
          ? Util.formatDttm(params?.value)
          : dateUnit === "year" || dateUnit === "month"
            ? formatDateByUnit(params?.value, dateUnit)
            : (() => {
                const v = params?.value;
                if (v == null || v === "") return "";
                const s = String(v);
                if (s.includes("-")) return s.slice(0, 10);
                if (s.length >= 8)
                  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
                return s;
              })(),
      cellStyle: { ...baseDateCellStyle, textAlign: finalDateAlign },
      headerClass: `ag-header-${finalDateAlign}`,
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...typeBlock,
    } as AnyCol;
  }

  // type:"numeric" → 우측 정렬 (align prop 우선) + decimalPlaces 포맷
  const isNumericType =
    (colDef as any).type === "numeric" ||
    (colDef as any).dataType === "number" ||
    (colDef as any).cellDataType === "number";
  if (isNumericType) {
    const decimalPlaces = (colDef as any).decimalPlaces as number | undefined;
    const hasCustomFormatter =
      typeof (colDef as any).valueFormatter === "function";
    const numberFormatter =
      !hasCustomFormatter && typeof decimalPlaces === "number"
        ? (params: any) => {
            const v = params?.value;
            if (v == null || v === "") return "";
            const n =
              typeof v === "number" ? v : Number(String(v).replaceAll(",", ""));
            if (Number.isNaN(n)) return String(v);
            return n.toLocaleString(undefined, {
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces,
            });
          }
        : undefined;
    const userCellStyle = (colDef as any).cellStyle;
    const baseCellStyle =
      userCellStyle && typeof userCellStyle === "object" ? userCellStyle : {};
    const finalAlign = alignProp ?? "right";
    return {
      ...prepared,
      headerName: translate(prepared),
      cellStyle: { ...baseCellStyle, textAlign: finalAlign },
      headerClass: `ag-header-${finalAlign}`,
      ...(numberFormatter ? { valueFormatter: numberFormatter } : {}),
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...typeBlock,
    } as AnyCol;
  }

  // _STS 접미 → 중앙 정렬 (cellStyle/type/align 미지정 시)
  if (
    !(colDef as any).cellStyle &&
    !(colDef as any).type &&
    !alignProp &&
    field.endsWith("_STS")
  ) {
    return {
      ...prepared,
      headerName: translate(prepared),
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-center",
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...typeBlock,
    } as AnyCol;
  }

  return {
    ...prepared,
    headerName: (prepared as any).headerName
      ? translate(prepared)
      : (prepared as any).headerName,
    ...(translatedChildren ? { children: translatedChildren } : {}),
    ...(alignBlock ?? {}),
    ...typeBlock,
  } as AnyCol;
}

/** 컬럼 배열 일괄 변환. */
export function processColumnDefs(
  cols: AnyCol[] | undefined,
  opts: ProcessOptions = {},
): AnyCol[] {
  return (cols ?? []).map((c) => processColumnDef(c, opts));
}
