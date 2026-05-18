// app/components/grid/autosize.ts
// 컬럼 자동 너비 계산 유틸. canvas 텍스트 측정 기반으로 헤더/셀 텍스트의
// 최적 width 를 산출해 ag-grid api 로 적용한다.

import type { ColDef, ColGroupDef } from "ag-grid-community";

const GRID_FONT =
  "11px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
let _canvas: HTMLCanvasElement | null = null;

export function measureTextWidth(text: string): number {
  if (typeof document === "undefined") return text.length * 7;
  if (!_canvas) _canvas = document.createElement("canvas");
  const ctx = _canvas.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = GRID_FONT;
  return ctx.measureText(text).width;
}

export const CELL_PADDING = 24;
export const HEADER_PADDING = 32;
export const MIN_COL_WIDTH = 80;

/** cellRenderer 가 반환한 React element 에서 텍스트만 추출 */
export function extractTextFromElement(element: any): string {
  if (element == null) return "";
  if (typeof element === "string" || typeof element === "number")
    return String(element);
  if (typeof element === "boolean") return "";
  if (element?.props?.children != null) {
    const children = element.props.children;
    if (Array.isArray(children))
      return children.map(extractTextFromElement).join("");
    return extractTextFromElement(children);
  }
  return "";
}

export function calcOptimalWidths<TRow>(
  columnDefs: (ColDef<TRow> | ColGroupDef<TRow>)[],
  rowData: TRow[],
): Record<string, number> {
  const widthMap: Record<string, number> = {};

  for (const col of columnDefs) {
    if (!("field" in col) && !("colId" in col)) continue;

    const colDef = col as ColDef<TRow>;
    const key = (colDef.colId ?? colDef.field ?? "") as string;
    if (!key) continue;

    const headerText = colDef.headerName ?? key;
    const headerWidth = measureTextWidth(headerText) + HEADER_PADDING;

    let maxDataWidth = 0;
    for (const row of rowData) {
      const raw = (row as any)[colDef.field as string];
      let str: string;

      if ((colDef as any).cellRenderer) {
        // cellRenderer(코드→라벨 등)가 있으면 렌더 결과에서 텍스트 추출
        try {
          const rendered = (colDef as any).cellRenderer({
            value: raw,
            data: row,
          });
          str = extractTextFromElement(rendered) || String(raw ?? "");
        } catch {
          str = raw == null ? "" : String(raw);
        }
      } else if ((colDef as any).valueFormatter) {
        try {
          str =
            (colDef as any).valueFormatter({ value: raw, data: row }) ??
            String(raw ?? "");
        } catch {
          str = raw == null ? "" : String(raw);
        }
      } else {
        str =
          raw == null
            ? ""
            : typeof raw === "object"
              ? JSON.stringify(raw)
              : String(raw);
      }

      const w = measureTextWidth(str) + CELL_PADDING;
      if (w > maxDataWidth) maxDataWidth = w;
    }

    widthMap[key] = Math.max(headerWidth, maxDataWidth, MIN_COL_WIDTH);
  }

  return widthMap;
}

export function applyColumnWidths(api: any, widthMap: Record<string, number>) {
  const cols = api.getColumns?.() ?? [];
  const updates: Array<{ key: string; newWidth: number }> = [];

  for (const col of cols) {
    const colId = col.getColId?.();
    const matched = widthMap[colId];
    if (!colId || !matched) continue;
    updates.push({ key: colId, newWidth: matched });
  }
  if (updates.length > 0) api.setColumnWidths?.(updates);
}
