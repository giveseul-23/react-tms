// 선언적 그리드 Model 훅.
// config.grids 에 정의된 모든 그리드의 state/ref + selection state/ref 를
// 자동 생성하고, 화면별 추가 state(extras) 를 평탄하게 합쳐 반환.

import { useState, useRef, useCallback, useMemo } from "react";
import { EMPTY_GRID, type FeatureConfig, type GridData } from "./types";

export interface GridSlot {
  /** raw state — paginated: GridData, array: any[] */
  data: GridData | any[];
  /** rows 정규화 — paginated.rows 또는 배열 그대로 */
  rows: any[];
  /** state setter (updater 함수 또는 값) */
  setData: (updater: any) => void;
  /** 최신 값 ref (closure 회피용) */
  ref: { current: any };
}

export interface SelectionSlot {
  /** 선택된 행 (state) */
  row: any;
  /** 선택 setter */
  set: (row: any) => void;
  /** 최신 값 ref */
  ref: { current: any };
}

export type GridModel = {
  pageSize: number;
  setPageSize: (size: number) => void;
  /** 그리드 key → GridSlot */
  grids: Record<string, GridSlot>;
  /** 선택 추적 그리드 key → SelectionSlot */
  selected: Record<string, SelectionSlot>;
  /** 첫 그리드 외 모두 초기화 (서브 그리드 + 모든 selection) */
  resetSubGrids: () => void;
  /** 모든 그리드 데이터 ref (초기화 등에 사용) */
  gridDataRef: { current: Record<string, any> };
  /** extras 가 spread 되어 평탄하게 모델에 합쳐짐 */
  [key: string]: any;
};

export function useGridModel(config: FeatureConfig): GridModel {
  const [pageSize, setPageSize] = useState(config.pageSize ?? 500);

  // ── 모든 그리드 데이터를 단일 객체 state로 (Rules of Hooks 준수) ──
  const initialData = useMemo(() => {
    const init: Record<string, any> = {};
    for (const [key, gc] of Object.entries(config.grids)) {
      init[key] = gc.type === "paginated" ? EMPTY_GRID : [];
    }
    return init;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [allData, setAllData] = useState<Record<string, any>>(initialData);
  const allDataRef = useRef<Record<string, any>>(initialData);

  const setSlot = useCallback((key: string, updater: any) => {
    setAllData((prev) => {
      const slot = prev[key];
      const next = typeof updater === "function" ? updater(slot) : updater;
      const merged = { ...prev, [key]: next };
      allDataRef.current = merged;
      return merged;
    });
  }, []);

  // ── 선택된 행 state + ref ──
  const [allSelected, setAllSelected] = useState<Record<string, any>>({});
  const allSelectedRef = useRef<Record<string, any>>({});

  const setSelected = useCallback((key: string, row: any) => {
    setAllSelected((prev) => ({ ...prev, [key]: row }));
    allSelectedRef.current = { ...allSelectedRef.current, [key]: row };
  }, []);

  // ── reset: 첫 그리드 외 모두 비움 ──
  const resetSubGrids = useCallback(() => {
    const keys = Object.keys(config.grids);
    setAllData((prev) => {
      const next = { ...prev };
      for (const key of keys.slice(1)) {
        const gc = config.grids[key];
        next[key] = gc.type === "paginated" ? EMPTY_GRID : [];
      }
      allDataRef.current = next;
      return next;
    });
    setAllSelected({});
    allSelectedRef.current = {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 화면별 추가 state ──
  const extras = config.extras?.() ?? {};

  // ── 그리드별/선택별 인터페이스 객체 ──
  const grids = useMemo<Record<string, GridSlot>>(() => {
    const out: Record<string, GridSlot> = {};
    for (const [key, gc] of Object.entries(config.grids)) {
      const data = allData[key];
      out[key] = {
        data,
        rows: gc.type === "paginated" ? data?.rows ?? [] : data ?? [],
        setData: (updater: any) => setSlot(key, updater),
        ref: {
          get current() {
            return allDataRef.current[key];
          },
        },
      };
    }
    return out;
  }, [allData, setSlot, config.grids]);

  const selected = useMemo<Record<string, SelectionSlot>>(() => {
    const out: Record<string, SelectionSlot> = {};
    for (const key of config.selections ?? []) {
      out[key] = {
        row: allSelected[key] ?? null,
        set: (row: any) => setSelected(key, row),
        ref: {
          get current() {
            return allSelectedRef.current[key] ?? null;
          },
        },
      };
    }
    return out;
  }, [allSelected, setSelected, config.selections]);

  return {
    pageSize,
    setPageSize,
    grids,
    selected,
    resetSubGrids,
    gridDataRef: allDataRef,
    ...extras,
  };
}
