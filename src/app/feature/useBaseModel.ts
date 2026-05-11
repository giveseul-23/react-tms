// src/app/feature/useBaseModel.ts
//
// 센차 ViewModel.stores 대응. 그리드 N개의 store(데이터) + selection(선택행)을
// menuCode 한 인자로 자동 셋업.
//
// 핵심:
//   - grid 슬롯은 lazy 등록 — DataGrid 가 setData/setSelected 호출하는 순간 state 에 등록
//   - storageKey prefix 는 menuCode 에서 자동 변환 (MENU_FOO_BAR → foo-bar)
//   - storageKeys 는 outer/top/bottom/layout 4종 자동 제공
//   - layout 토글값은 localStorage 동기화 자동
//   - searchRef / filtersRef 도 자체 생성 + 노출 (View 의 useRef 두 개 불필요)
//   - bind() 가 onPageChange 자동 spread (searchRef 트리거)
//
// 타입 안전성을 위해 generic K 로 그리드 이름 유니언을 명시 권장:
//   const m = useBaseModel<"main" | "sub01" | "sub02" | "sub03">(MENU_CODE);
//   m.grids.main ✓ / m.grids.man ✗ (compile error)

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export const EMPTY_GRID: GridData = {
  rows: [],
  totalCount: 0,
  page: 1,
  limit: 20,
};

export interface GridSlot {
  data: GridData;
  rows: any[];
  setData: (updater: SetStateAction<GridData>) => void;
  ref: { readonly current: GridData };
  selected: any;
  setSelected: (row: any) => void;
  selectedRef: { readonly current: any };
}

export interface StorageKeys {
  outer: string;
  top: string;
  bottom: string;
  layout: string;
}

/** DataGrid 에 spread 할 표준 props 묶음. */
export interface BoundGridProps {
  layoutType: "plain";
  rowData: any[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageSizeChange: Dispatch<SetStateAction<number>>;
  onPageChange: (page: number) => void;
  rowSelection: "single";
  /** standardAudit 자동 추가 ON — 끄거나 부분 토글하려면 View 에서 audit prop 다시 명시. */
  audit: true;
  /** audit delete 컬럼이 사용할 setter — DataGrid 내부에서 자동 사용. */
  setRowData: (updater: SetStateAction<GridData>) => void;
}

export type BaseModel<K extends string = string> = {
  grids: Record<K, GridSlot>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  layout: LayoutType;
  setLayout: Dispatch<SetStateAction<LayoutType>>;
  storageKeys: StorageKeys;
  /** SearchFilters 의 검색 트리거 — model.searchRef.current?.() 로 호출 */
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  /** SearchFilters 의 마지막 검색 조건 — 엑셀 다운 등 재사용 */
  filtersRef: MutableRefObject<Record<string, unknown>>;
  /** DataGrid 에 spread 용 — `<DataGrid {...model.bind("main")} ... />` */
  bind: (gridKey: K) => BoundGridProps;
};

interface BaseModelOptions {
  pageSize?: number;
  defaultLayout?: LayoutType;
}

// ── menuCode → storageKey prefix 변환 ─────────────────────────
//   "MENU_LGSTGRP_OPR_CONFIG_MST" → "lgstgrp-opr-config-mst"
function menuCodeToPrefix(menuCode: string): string {
  return menuCode.replace(/^MENU_/i, "").toLowerCase().replace(/_/g, "-");
}

// ── localStorage 안전 접근 ────────────────────────────────────
function readLayout(key: string): LayoutType | null {
  try {
    if (typeof window === "undefined") return null;
    const v = window.localStorage.getItem(key);
    return v === "side" || v === "vertical" ? v : null;
  } catch {
    return null;
  }
}

function writeLayout(key: string, value: LayoutType): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function useBaseModel<K extends string = string>(
  menuCode: string,
  options?: BaseModelOptions,
): BaseModel<K> {
  const [pageSize, setPageSize] = useState(options?.pageSize ?? 500);

  // ── SearchFilters 와 외부의 통신 채널 ────────────────────────
  // SearchFilters 가 마운트 후 자기 handleSearch 를 searchRef.current 에 주입.
  // 외부(View/Controller)는 이 ref 를 통해 검색 트리거 / 마지막 조건 read.
  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  // ── storageKeys 자동 생성 ────────────────────────────────────
  const storageKeys = useMemo<StorageKeys>(() => {
    const prefix = menuCodeToPrefix(menuCode);
    return {
      outer: `${prefix}-outer`,
      top: `${prefix}-top`,
      bottom: `${prefix}-bottom`,
      layout: `${prefix}-layout`,
    };
  }, [menuCode]);

  // ── layout state — localStorage 동기화 ──────────────────────
  const layoutKey = storageKeys.layout;
  const [layout, setLayoutState] = useState<LayoutType>(() => {
    const saved = readLayout(layoutKey);
    return saved ?? options?.defaultLayout ?? "side";
  });

  const setLayout = useCallback<Dispatch<SetStateAction<LayoutType>>>(
    (updater) => {
      setLayoutState((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: LayoutType) => LayoutType)(prev)
            : updater;
        writeLayout(layoutKey, next);
        return next;
      });
    },
    [layoutKey],
  );

  // ── 모든 그리드 데이터 / selection 을 단일 객체 state 로 ────
  // (Rules of Hooks 준수 + lazy 등록 — set 호출 시점에 키 추가됨)
  const [allData, setAllData] = useState<Record<string, GridData>>({});
  const allDataRef = useRef(allData);
  allDataRef.current = allData;

  const [allSel, setAllSel] = useState<Record<string, any>>({});
  const allSelRef = useRef(allSel);
  allSelRef.current = allSel;

  const setSlotData = useCallback(
    (key: string, updater: SetStateAction<GridData>) => {
      setAllData((prev) => {
        const slot = prev[key] ?? EMPTY_GRID;
        const next =
          typeof updater === "function"
            ? (updater as (s: GridData) => GridData)(slot)
            : updater;
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const setSlotSelected = useCallback((key: string, row: any) => {
    setAllSel((prev) => ({ ...prev, [key]: row }));
  }, []);

  // ── grids: Proxy 로 lazy 슬롯 제공 ──────────────────────────
  // 첫 접근 시 EMPTY_GRID 반환, set 시점에 state 에 등록.
  // 슬롯 객체는 키별로 캐시 — Proxy.get 호출마다 같은 reference 를 반환해
  // 소비자의 useMemo / 의존성 비교가 불필요하게 무효화되지 않도록 한다.
  const grids = useMemo(() => {
    const slotCache: Record<string, GridSlot> = {};
    const handler: ProxyHandler<Record<string, GridSlot>> = {
      get(_target, prop) {
        if (typeof prop !== "string") return undefined;
        const k = prop;
        if (slotCache[k]) return slotCache[k];

        const slot: GridSlot = {
          get data() {
            return allDataRef.current[k] ?? EMPTY_GRID;
          },
          get rows() {
            return allDataRef.current[k]?.rows ?? EMPTY_GRID.rows;
          },
          setData: (updater: SetStateAction<GridData>) => setSlotData(k, updater),
          ref: {
            get current() {
              return allDataRef.current[k] ?? EMPTY_GRID;
            },
          },
          get selected() {
            return allSelRef.current[k] ?? null;
          },
          setSelected: (row: any) => setSlotSelected(k, row),
          selectedRef: {
            get current() {
              return allSelRef.current[k] ?? null;
            },
          },
        };
        slotCache[k] = slot;
        return slot;
      },
    };
    return new Proxy({} as Record<string, GridSlot>, handler) as Record<
      K,
      GridSlot
    >;
  }, [setSlotData, setSlotSelected]);

  // ── bind: DataGrid spread 헬퍼 ──────────────────────────────
  // onPageChange 도 자동 spread — searchRef.current?.(page) 트리거.
  // 페이지네이션 없는 그리드(cascade 로 받는 sub 등)는 totalCount=0 이라
  // DataGrid 가 페이지네이션 영역을 그리지 않음 (사용자 영향 없음).
  const onPageChange = useCallback(
    (page: number) => searchRef.current?.(page),
    [],
  );

  const bind = useCallback(
    (gridKey: K): BoundGridProps => {
      const slot = (grids as Record<string, GridSlot>)[gridKey as string];
      return {
        layoutType: "plain",
        rowData: slot.rows,
        totalCount: slot.data.totalCount,
        currentPage: slot.data.page,
        pageSize,
        onPageSizeChange: setPageSize,
        onPageChange,
        rowSelection: "single",
        audit: true,
        setRowData: slot.setData,
      };
    },
    [grids, pageSize, setPageSize, onPageChange],
  );

  return {
    grids,
    pageSize,
    setPageSize,
    layout,
    setLayout,
    storageKeys,
    searchRef,
    filtersRef,
    bind,
  };
}
