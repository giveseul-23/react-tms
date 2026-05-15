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
  useEffect,
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
  /** setData 가 객체로 직접 set 될 때마다 +1. 함수형 updater 호출(편집/내부 mutation)은 변경 없음.
   *  DataGrid 가 이 값 변화 시에만 autoSize 재실행 → 셀 편집 시 가로 스크롤 유지. */
  autoSizeKey: number;
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
  /** 객체 set (조회 결과 도착 등) 시점에만 +1 — DataGrid 가 autoSize 재실행 트리거. */
  autoSizeKey: number;
  /** ag-grid 의 사용자 액션 selection 변경을 model.selectedRef 로 동기화. */
  onSelectionChanged: (row: any | null) => void;
  /** controller 가 setSelected(row) 로 박은 행을 ag-grid 시각 선택으로 자동 반영. */
  selectedRow: any;
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

// ── row 안정 id (__rid__) 자동 부여 ────────────────────────────
// ag-grid 의 getRowId 가 사용. row 가 cell 편집으로 새 객체 reference 가 되어도
// __rid__ 가 같으면 ag-grid 가 같은 row 로 인식 → 부분 redraw → 스크롤 위치 보존.
// payload 에는 toDsSave 가 strip 해서 보내지 않음.
let _ridCounter = 0;
export function newRid(): string {
  _ridCounter += 1;
  return `r${_ridCounter}`;
}
function ensureRid(data: GridData): GridData {
  if (!data?.rows?.length) return data;
  let touched = false;
  const rows = data.rows.map((r: any) => {
    if (r && r.__rid__) return r;
    touched = true;
    return { ...r, __rid__: newRid() };
  });
  return touched ? { ...data, rows } : data;
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

  // ── autoSizeKey: 객체로 직접 set 될 때만 증가 ─────────────────
  // 함수형 updater 호출(commitRowChange, addRow 등 내부 mutation)은 제외 → DataGrid 의
  // autoSize useEffect 가 그 변경에는 발화하지 않아 셀 편집 시 가로 스크롤이 유지된다.
  const [allAutoSizeKey, setAllAutoSizeKey] = useState<Record<string, number>>({});
  const allAutoSizeKeyRef = useRef(allAutoSizeKey);
  allAutoSizeKeyRef.current = allAutoSizeKey;

  const setSlotData = useCallback(
    (key: string, updater: SetStateAction<GridData>) => {
      if (typeof updater !== "function") {
        // 객체 직접 set (조회 결과 도착, resetGrids 등) — ref 도 동기 업데이트.
        // handleSearch → setData → 즉시 onMainGridClick 흐름에서
        // dirty 체크가 새 데이터를 보도록 보장.
        const withRid = ensureRid(updater);
        allDataRef.current = { ...allDataRef.current, [key]: withRid };
        setAllData((prev) => ({ ...prev, [key]: withRid }));
        setAllAutoSizeKey((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
        return;
      }
      // 함수형 updater (셀 편집, addRow 등) — 기존대로 prev 기반 합성
      setAllData((prev) => {
        const slot = prev[key] ?? EMPTY_GRID;
        const raw = (updater as (s: GridData) => GridData)(slot);
        return { ...prev, [key]: ensureRid(raw) };
      });
    },
    [],
  );

  const setSlotSelected = useCallback((key: string, row: any) => {
    setAllSel((prev) => ({ ...prev, [key]: row }));
  }, []);

  // ── selected reference auto-sync ─────────────────────────────
  // 셀 편집 등으로 rows 의 row 객체가 새 reference 로 교체되면, allSel 의 해당 항목도
  // 같은 __rid__ 의 새 row 로 swap. selected.CNFG_CD 등 PK 값이 항상 최신을 가리켜
  // 저장 후 autoSelectFirstRow 의 PK 매칭이 정상 동작하도록.
  useEffect(() => {
    setAllSel((prev) => {
      let changed = false;
      const next: Record<string, any> = {};
      for (const k of Object.keys(prev)) {
        const sel = prev[k];
        if (!sel?.__rid__) {
          next[k] = sel;
          continue;
        }
        const rows = allData[k]?.rows ?? [];
        const newRow = rows.find((r: any) => r.__rid__ === sel.__rid__);
        if (newRow && newRow !== sel) {
          next[k] = newRow;
          changed = true;
        } else {
          next[k] = sel;
        }
      }
      return changed ? next : prev;
    });
  }, [allData]);

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
          get autoSizeKey() {
            return allAutoSizeKeyRef.current[k] ?? 0;
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
        autoSizeKey: slot.autoSizeKey,
        onSelectionChanged: slot.setSelected,
        selectedRow: slot.selected,
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
