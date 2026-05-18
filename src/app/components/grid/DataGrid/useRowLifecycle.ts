// app/components/grid/useRowLifecycle.ts
// rowData / selection 변화에 따라 ag-grid 측을 동기화하는 4가지 effect 묶음.
//   1) controller 가 박은 selectedRow → ag-grid 시각 선택
//   2) autoFirstRow: PK 매칭으로 이전 선택 복원
//   3) 신규 행(EDIT_STS:"I") 추가 시 자동 스크롤
//   4) 신규 행에 type:"check" 컬럼의 defaultYn 자동 적용

import { useEffect, useRef } from "react";

export function useRowLifecycle<TRow>({
  gridApiRef,
  selectedRow,
  activeRowData,
  activeColumnDefs,
  effectiveAutoSelect,
  effectiveRowKeys,
  activeOnRowClicked,
  setRowData,
  selectedRowRef,
  prevSelectedRef,
}: {
  gridApiRef: React.MutableRefObject<any>;
  selectedRow?: any;
  activeRowData: TRow[];
  activeColumnDefs: any[];
  effectiveAutoSelect: boolean;
  effectiveRowKeys: string[];
  activeOnRowClicked?: (row: TRow) => void;
  setRowData?: (updater: any) => void;
  selectedRowRef: React.MutableRefObject<TRow | null>;
  prevSelectedRef: React.MutableRefObject<TRow | null>;
}) {
  const prevRowCountRef = useRef(0);

  // ─── controller 가 박은 selectedRow 를 ag-grid 시각 선택으로 자동 반영 ─
  // model.bind() 가 selectedRow 를 spread → controller 의 setSelected(row) 결과가
  // ag-grid 의 row hi-light 까지 도달. ag-grid api 호출이 발화하는 onSelectionChanged
  // 는 source="api" 라 handleSelectionChanged 가 무시 — 무한 루프 없음.
  useEffect(() => {
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return;
    if (selectedRow == null) {
      if (api.getSelectedRows().length > 0) api.deselectAll();
      return;
    }
    const id = (selectedRow as any).__rid__;
    if (!id) return;
    // rowData 변경과 selection 변경이 같은 batch 에 들어오면 ag-grid 의 새 row node 가
    // 아직 mount 되지 않은 시점일 수 있어 getRowNode 가 null. 한 frame 지연 후 시도.
    requestAnimationFrame(() => {
      if (api.isDestroyed?.()) return;
      const node = api.getRowNode(id);
      if (!node) return;
      if (!node.isSelected()) node.setSelected(true, true);
      // selected 된 row 가 viewport 밖이면 스크롤. 이미 보이면 no-op.
      api.ensureNodeVisible(node, "middle");
    });
  }, [selectedRow, activeRowData, gridApiRef]);

  // ─── 자동 첫행 선택 (이전 선택을 PK 로 보존, 없으면 첫 표시 행) ─────
  useEffect(() => {
    if (!effectiveAutoSelect) return;
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return;
    if (!activeRowData?.length) return;

    requestAnimationFrame(() => {
      if (api.isDestroyed?.()) return;

      const keys = effectiveRowKeys;
      // selected (state 기반, model auto-sync 로 최신) 를 우선, 없으면 prevSelectedRef.
      // 추가 → 셀에 PK 입력 → 저장 → 재조회 흐름에서 selected 가 최신 PK 를 가리킴.
      const prev = (selectedRowRef.current ?? prevSelectedRef.current) as any;

      // PK 매칭만 시도. 매칭 실패 시 아무 동작 안 함 — 첫 행 fallback 은 명시적 자동선택을
      // 안 한 화면(예: onSearchCallback 에서 onMainGridClick 호출 안 함)의 의도를 존중.
      if (!prev || !keys.length) {
        return;
      }

      let target: any = null;
      api.forEachNode((n: any) => {
        if (target || !n.data) return;
        if (keys.every((k) => n.data[k] === prev[k])) target = n;
      });

      if (target && !target.isSelected()) {
        target.setSelected(true);
        activeOnRowClicked?.(target.data);
      }
    });
  }, [
    activeRowData,
    effectiveAutoSelect,
    effectiveRowKeys,
    activeOnRowClicked,
    gridApiRef,
    selectedRowRef,
    prevSelectedRef,
  ]);

  // ─── 행 추가 시 자동 스크롤 + 포커스 (EDIT_STS:"I" 인 새 마지막 행) ─────
  useEffect(() => {
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return;

    const currCount = activeRowData?.length ?? 0;
    const prevCount = prevRowCountRef.current;
    prevRowCountRef.current = currCount;

    if (currCount <= prevCount || currCount === 0) return;
    const lastRow = activeRowData[currCount - 1] as any;
    if (lastRow?.EDIT_STS !== "I") return;

    requestAnimationFrame(() => {
      if (api.isDestroyed?.()) return;
      const lastIndex = currCount - 1;
      api.ensureIndexVisible(lastIndex, "bottom");
    });
  }, [activeRowData, gridApiRef]);

  // ─── 신규 행 (EDIT_STS:"I") 에 컬럼 default 자동 적용 ───────────────
  // type:"check" 컬럼의 defaultYn (없으면 "N") 을 신규 행의 해당 field 가
  // 비어있을 때 자동으로 채움. 사용자가 토글 안 해도 저장 시 default 포함.
  // 이미 default 가 박힌 행은 setRowData 가 same prev 반환 → re-render 없음 (무한루프 가드).
  useEffect(() => {
    if (!setRowData) return;
    const defaults: Record<string, string> = {};
    for (const col of activeColumnDefs as any[]) {
      if (col?.type === "check" && col?.field) {
        defaults[col.field] = col.defaultYn ?? "N";
      }
    }
    if (Object.keys(defaults).length === 0) return;

    setRowData((prev: any) => {
      if (!prev?.rows) return prev;
      let changed = false;
      const newRows = prev.rows.map((r: any) => {
        if (r.EDIT_STS !== "I") return r;
        const updates: Record<string, any> = {};
        for (const [f, v] of Object.entries(defaults)) {
          if (r[f] === undefined || r[f] === null || r[f] === "") {
            updates[f] = v;
          }
        }
        if (Object.keys(updates).length === 0) return r;
        changed = true;
        return { ...r, ...updates };
      });
      return changed ? { ...prev, rows: newRows } : prev;
    });
  }, [activeRowData, activeColumnDefs, setRowData]);
}
