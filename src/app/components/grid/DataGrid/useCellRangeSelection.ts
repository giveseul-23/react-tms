// app/components/grid/useCellRangeSelection.ts
// ag-grid 셀 드래그 범위 선택 + Ctrl+C 복사(TSV) 동작.
// ag-grid 가 행 선택/refresh 시 셀 DOM 을 재렌더하면서 cell-range-bg 클래스/
// inline box-shadow 를 지워버리는 문제 보완을 위해 MutationObserver 로 재적용.

import { useEffect, useRef } from "react";

type Coords = { rowIndex: number; colIndex: number };

export function useCellRangeSelection({
  containerRef,
  gridApiRef,
  enabled = true,
  onRangeRowsChange,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  gridApiRef: React.MutableRefObject<any>;
  /** false 면 셀 범위선택/복사 비활성 (예: 전체 행 드래그 그리드와 충돌 방지). */
  enabled?: boolean;
  /** 셀 범위에 포함된 "행 데이터" 변경 통지 — summaryScope:"selected" 집계 등에 사용. */
  onRangeRowsChange?: (rows: any[]) => void;
}) {
  const selectedCellsRef = useRef<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<Coords | null>(null);
  const columnOrderRef = useRef<string[]>([]);

  // 최신 콜백을 ref 로 추적 — effect deps([enabled]) 재실행 없이 사용
  const onRangeRowsChangeRef = useRef(onRangeRowsChange);
  onRangeRowsChangeRef.current = onRangeRowsChange;

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    function getCellCoords(el: HTMLElement) {
      const cell = el.classList.contains("ag-cell")
        ? el
        : el.closest<HTMLElement>(".ag-cell");
      const row = el.closest<HTMLElement>("[row-index]");
      if (!cell || !row) return null;

      const colId = cell.getAttribute("col-id");
      if (!colId) return null;

      const rowIndex = parseInt(row.getAttribute("row-index") ?? "-1", 10);
      const colIndex = columnOrderRef.current.indexOf(colId);
      if (rowIndex < 0 || colIndex < 0) return null;
      return { rowIndex, colIndex };
    }

    function getRangeKeys(a: Coords, b: Coords) {
      const keys = new Set<string>();
      for (
        let r = Math.min(a.rowIndex, b.rowIndex);
        r <= Math.max(a.rowIndex, b.rowIndex);
        r++
      ) {
        for (
          let cl = Math.min(a.colIndex, b.colIndex);
          cl <= Math.max(a.colIndex, b.colIndex);
          cl++
        ) {
          keys.add(`${r}:${cl}`);
        }
      }
      return keys;
    }

    function applyHighlight() {
      // 선택 범위의 경계(min/max row, col) 계산
      const keys = selectedCellsRef.current;

      // 범위 선택(2개 이상) 시 AG Grid 셀 포커스 아웃라인 제거
      if (keys.size > 1) {
        const api = gridApiRef.current;
        if (api && !api.isDestroyed?.()) {
          api.clearFocusedCell();
        }
      }

      let minR = Infinity,
        maxR = -Infinity,
        minC = Infinity,
        maxC = -Infinity;
      keys.forEach((k) => {
        const [r, c] = k.split(":").map(Number);
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      });

      // 테마 색상에서 primary RGB 값 읽기
      const primaryRgb = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim(); // e.g. "0 186 237"
      const rgb = primaryRgb.replace(/ /g, ",");
      const borderColor = `rgba(${rgb},0.5)`;

      if (!container) return;
      container.querySelectorAll<HTMLElement>(".ag-cell").forEach((cell) => {
        const coords = getCellCoords(cell);
        if (!coords) return;
        const { rowIndex: r, colIndex: c } = coords;
        const selected = keys.has(`${r}:${c}`);

        if (!selected) {
          cell.classList.remove("cell-range-bg");
          cell.style.boxShadow = "";
          return;
        }

        // 배경은 CSS 클래스로 적용 (theme.css 의 ag-row-selected !important 를 이기는 specificity)
        cell.classList.add("cell-range-bg");

        // 외곽 테두리만 그리기: 선택 범위의 가장자리 셀만 해당 방향에 선 표시
        const borders: string[] = [];
        if (r === minR) borders.push(`inset 0 1px 0 0 ${borderColor}`);
        if (r === maxR) borders.push(`inset 0 -1px 0 0 ${borderColor}`);
        if (c === minC) borders.push(`inset 1px 0 0 0 ${borderColor}`);
        if (c === maxC) borders.push(`inset -1px 0 0 0 ${borderColor}`);
        cell.style.boxShadow = borders.join(", ");
      });

      emitRangeRows();
    }

    // 셀 범위에 포함된 행(중복 제거) → 행 데이터 배열을 통지. 동일 선택이면 skip.
    let lastRowSig = "";
    function emitRangeRows() {
      const cb = onRangeRowsChangeRef.current;
      if (!cb) return;
      const cells = selectedCellsRef.current;
      const rowIdx = new Set<number>();
      cells.forEach((k) => rowIdx.add(Number(k.split(":")[0])));
      const sorted = [...rowIdx].sort((a, b) => a - b);
      // 셀 1개만(단순 포커스)이면 범위 아님 → 집계 비대상(빈 배열). 2개 이상이 범위.
      const sig = cells.size > 1 ? sorted.join(",") : "";
      if (sig === lastRowSig) return;
      lastRowSig = sig;
      const api = gridApiRef.current;
      const rows =
        sig && api && !api.isDestroyed?.()
          ? sorted
              .map((r) => api.getDisplayedRowAtIndex(r)?.data)
              .filter((d) => d != null)
          : [];
      cb(rows);
    }

    function tsvFromSelection() {
      const keys = selectedCellsRef.current;
      if (keys.size === 0) return null;
      let minR = Infinity,
        maxR = -Infinity,
        minC = Infinity,
        maxC = -Infinity;
      keys.forEach((k) => {
        const [r, cl] = k.split(":").map(Number);
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (cl < minC) minC = cl;
        if (cl > maxC) maxC = cl;
      });
      const api = gridApiRef.current;
      if (!api) return null;
      const colIdToField: Record<string, string> = {};
      api.getColumns()?.forEach((col: any) => {
        colIdToField[col.getColId()] = col.getColDef().field ?? col.getColId();
      });

      const lines: string[] = [];
      for (let r = minR; r <= maxR; r++) {
        const node = api.getDisplayedRowAtIndex(r);
        const cells: string[] = [];
        for (let cl = minC; cl <= maxC; cl++) {
          const colId = columnOrderRef.current[cl];
          const field = colIdToField[colId] ?? colId;
          const val = node?.data?.[field];
          cells.push(val != null ? String(val) : "");
        }
        lines.push(cells.join("\t"));
      }
      return lines.join("\n");
    }

    const onMouseDown = (e: MouseEvent) => {
      const api = gridApiRef.current;
      if (api && !api.isDestroyed?.()) {
        const cols =
          api
            .getColumns()
            ?.map((col: any) => col.getColId())
            .filter(Boolean) ?? [];
        if (cols.length > 0) columnOrderRef.current = cols;
      }

      const cell = (e.target as HTMLElement).closest<HTMLElement>(".ag-cell");
      if (!cell) {
        selectedCellsRef.current = new Set();
        dragStartRef.current = null;
        applyHighlight();
        if (api && !api.isDestroyed?.()) {
          api.clearFocusedCell();
        }
        return;
      }
      const coords = getCellCoords(cell);
      if (!coords) return;

      if (e.shiftKey && dragStartRef.current) {
        selectedCellsRef.current = getRangeKeys(dragStartRef.current, coords);
      } else {
        dragStartRef.current = coords;
        selectedCellsRef.current = new Set([
          `${coords.rowIndex}:${coords.colIndex}`,
        ]);
        isDraggingRef.current = true;
      }
      applyHighlight();
    };

    const onMouseOver = (e: MouseEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current) return;
      const cell = (e.target as HTMLElement).closest<HTMLElement>(".ag-cell");
      if (!cell) return;
      const coords = getCellCoords(cell);
      if (!coords) return;
      selectedCellsRef.current = getRangeKeys(dragStartRef.current, coords);
      applyHighlight();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onScroll = () => requestAnimationFrame(applyHighlight);

    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "c") return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (selectedCellsRef.current.size === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const tsv = tsvFromSelection();
      if (!tsv) return;
      navigator.clipboard.writeText(tsv).then(
        () => {},
        (err) => console.warn("[Copy] writeText failed", err),
      );
    };

    const onDocumentMouseDown = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        selectedCellsRef.current = new Set();
        dragStartRef.current = null;
        applyHighlight();
        const api = gridApiRef.current;
        if (api && !api.isDestroyed?.()) {
          api.clearFocusedCell();
        }
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mousedown", onDocumentMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    container.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKeyDown, true);

    // ag-grid 가 행 선택/refresh 시 셀 DOM 을 재렌더하면서
    // cell-range-bg 클래스/inline box-shadow 를 지워버리는 문제 보완 —
    // 선택 셀이 있는 동안만 DOM 변경을 감지해 highlight 재적용
    let rafId: number | null = null;
    const reapply = () => {
      if (selectedCellsRef.current.size === 0) return;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        applyHighlight();
      });
    };
    const observer = new MutationObserver(reapply);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mousedown", onDocumentMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKeyDown, true);
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  return { columnOrderRef };
}
