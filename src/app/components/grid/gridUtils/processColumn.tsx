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
import type { ColDef, ColGroupDef } from "ag-grid-community";

import { Lang } from "@/app/services/common/Lang";
import { Util } from "@/app/services/common/Util";
import { ComboCellEditor } from "@/app/components/grid/cellEditors/ComboCellEditor";
import { PasswordCellEditor } from "@/app/components/grid/cellEditors/PasswordCellEditor";
import { commitRowChange } from "./rowStatus";

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
  "isPrimaryKey",
  "insertable",
  "inputType",
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
  codeMap?: Record<string, Record<string, string>>,
  setRowData?: (updater: any) => void,
): any[] | undefined {
  if (!Array.isArray(children)) return children;
  return children.map((child) => {
    const withRenderer = injectCodeRenderer(child, codeMap) as any;
    const withEditor = injectComboEditor(
      withRenderer,
      codeMap,
      setRowData,
    ) as any;
    const withCheck = injectCheckRenderer(withEditor, setRowData) as any;
    const withPolicy = applyEditPolicy(withCheck) as any;
    return stripCustomKeys({
      ...withPolicy,
      headerName: translate(withPolicy),
      children: walkChildren(withPolicy.children, codeMap, setRowData),
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
            return value ? "●●●●●●" : "";
          },
        }),
  } as AnyCol;
}


/** 외부 export — 우리 커스텀 키 (type, align, codeKey 등) 를 ag-grid 에
 *  그대로 노출하지 않도록 strip 한 결과를 반환. 내부 분기에서는 type 등을
 *  활용하지만 ag-grid 에는 표준 키만 전달. */
export function processColumnDef(
  col: AnyCol,
  opts: ProcessOptions = {},
): AnyCol {
  return stripCustomKeys(processColumnDefRaw(col, opts));
}

/** insertable / editable 을 EDIT_STS 기반 editable 함수로 변환.
 *   - insertable + editable → 항상 편집 가능
 *   - insertable 만        → 추가 상태(EDIT_STS:"I") 행에서만 편집
 *   - editable 만          → 수정 상태(EDIT_STS:"I" 아닌 행) 에서만 편집
 *   - 둘 다 없음/false     → 변경 안 함 (편집 불가) */
function applyEditPolicy(col: AnyCol): AnyCol {
  const c = col as any;
  const ins = c.insertable === true;
  const edt = c.editable === true;
  if (!ins && !edt) return col;
  let editableFn: any;
  if (ins && edt) editableFn = true;
  else if (ins) editableFn = (p: any) => p.data?.EDIT_STS === "I";
  else editableFn = (p: any) => p.data?.EDIT_STS !== "I";
  return { ...c, editable: editableFn } as AnyCol;
}

function processColumnDefRaw(
  col: AnyCol,
  opts: ProcessOptions = {},
): AnyCol {
  const codeMap = opts.codeMap;

  // codeKey → cellRenderer (라벨 표시) + type "combo" 면 cellEditor (dropdown) 주입
  // + type "check" 면 체크박스 cellRenderer 주입  
  const prepared = applyEditPolicy(
    injectPasswordEditor(
      injectCheckRenderer(
        injectComboEditor(
          injectCodeRenderer(col, codeMap),
          codeMap,
          opts.setRowData,
        ),
        opts.setRowData,
      ),
      opts.setRowData,
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

  const translatedChildren = walkChildren(
    (prepared as any).children,
    codeMap,
    opts.setRowData,
  );

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

  // DTTM 필드: 자동 포맷 + 정렬(align prop > type:"date" → center > 미지정)
  if (field.includes("DTTM")) {
    const isDateTypedDttm =
      (colDef as any).type === "date" || (colDef as any).fieldType === "date";
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

  // type:"date" / fieldType:"date" → 가운데 정렬 (align prop 우선) + YYYY-MM-DD 슬라이스
  if (
    (colDef as any).type === "date" ||
    (colDef as any).fieldType === "date"
  ) {
    const userDateCellStyle = (colDef as any).cellStyle;
    const baseDateCellStyle =
      userDateCellStyle && typeof userDateCellStyle === "object"
        ? userDateCellStyle
        : {};
    const finalDateAlign = alignProp ?? "center";
    return {
      ...prepared,
      headerName: translate(prepared),
      valueFormatter: (params: any) => {
        const v = params?.value;
        if (v == null || v === "") return "";
        return String(v).slice(0, 10);
      },
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
              typeof v === "number"
                ? v
                : Number(String(v).replaceAll(",", ""));
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
