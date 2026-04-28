// src/app/components/grid/gridUtils/processColumn.tsx
//
// 컬럼 정의(ColDef) 변환 로직 — DataGrid 와 TreeGrid 모두 동일하게 사용.
//
// 처리 항목:
//   - codeKey → cellRenderer 자동 주입 (codeMap 의 코드 → 라벨 변환)
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

type AnyCol = ColDef<any> | ColGroupDef<any>;

export type ProcessOptions = {
  codeMap?: Record<string, Record<string, string>>;
  /** "No" 컬럼처럼 row 길이에 따른 width 가 필요한 경우 사용. (TreeGrid 는 미사용) */
  rowCountForNo?: number;
};

const HEADER_PADDING = 32;
const CELL_PADDING = 24;

let _canvas: HTMLCanvasElement | null = null;
function measureTextWidth(text: string): number {
  if (typeof document === "undefined") return text.length * 7;
  if (!_canvas) _canvas = document.createElement("canvas");
  const ctx = _canvas.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = "11px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
  return ctx.measureText(text).width;
}

const translate = (col: any): string =>
  col?.noLang ? col.headerName : Lang.get(col.headerName);

function walkChildren(
  children: any[] | undefined,
  codeMap?: Record<string, Record<string, string>>,
): any[] | undefined {
  if (!Array.isArray(children)) return children;
  return children.map((child) => {
    const codeKey = child?.codeKey as string | undefined;
    const withRenderer =
      codeKey && !child.cellRenderer
        ? {
            ...child,
            cellRenderer: (params: any) => {
              const code = params.value;
              const label = codeMap?.[codeKey]?.[String(code)] ?? code;
              return (
                <span className="px-2 py-0.5 rounded-lg text-xs">{label}</span>
              );
            },
          }
        : child;
    return {
      ...withRenderer,
      headerName: translate(withRenderer),
      children: walkChildren(withRenderer.children, codeMap),
    };
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
      const label = codeMap?.[codeKey]?.[String(code)] ?? code;
      return <span className="px-2 py-0.5 rounded-lg text-xs">{label}</span>;
    },
  } as AnyCol;
}

/** 한 컬럼 변환. 외부에서 잘 안 쓰이지만 export. */
export function processColumnDef(
  col: AnyCol,
  opts: ProcessOptions = {},
): AnyCol {
  const codeMap = opts.codeMap;

  // codeKey → cellRenderer
  const prepared = injectCodeRenderer(col, codeMap);

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
      suppressMenu: true,
      sortable: false,
      filter: false,
      floatingFilter: false,
      getQuickFilterText: () => null,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-center",
      valueGetter: (params: any) =>
        params.node?.rowPinned === "bottom"
          ? "합계"
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
