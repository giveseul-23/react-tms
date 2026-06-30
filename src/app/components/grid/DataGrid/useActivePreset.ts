// app/components/grid/DataGrid/useActivePreset.ts
// 탭/프리셋이 활성화된 경우 해당 탭의 값으로, 없으면 기본 props 로 도출되는
// active* 메모이즈 모음. audit 자동 추가, summaryType 집계행, processColumnDef 적용까지.

import { useMemo } from "react";
import type { ColDef, ColGroupDef } from "ag-grid-community";
import type { GridPreset } from "./types";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { processColumnDef } from "../gridCommon";
import { standardAudit } from "../columns/commonColumns";

type AuditOpts =
  | boolean
  | {
      delete?: boolean;
      rowStatus?: boolean;
      insertPerson?: boolean;
      insertDate?: boolean;
      updatePerson?: boolean;
      updateTime?: boolean;
    };

export function useActivePreset<TRow>({
  layoutType,
  activeTab,
  presets,
  columnDefs,
  rowData,
  overrideRowData,
  selectedRows,
  actions,
  onCellValueChanged,
  onRowClicked,
  codeMap,
  audit,
  setRowData,
  openPopup,
  closePopup,
  readOnly,
  model,
}: {
  layoutType: "tab" | "plain";
  activeTab: string | null;
  presets?: Record<string, GridPreset<TRow>>;
  columnDefs: (ColDef<TRow> | ColGroupDef<TRow>)[];
  rowData?: TRow[] | Record<string, TRow[]>;
  overrideRowData?: TRow[];
  /** summaryScope:"selected" 집계용 — 현재 선택 행 전체 */
  selectedRows?: TRow[];
  actions?: ActionItem[];
  onCellValueChanged?: (params: any) => void;
  onRowClicked?: (row: TRow) => void;
  codeMap?: Record<string, Record<string, string>>;
  audit?: AuditOpts;
  setRowData?: (updater: any) => void;
  openPopup?: (payload: any) => void;
  closePopup?: () => void;
  readOnly?: boolean;
  model?: any;
}) {
  // audit 이 인라인 객체({ delete:false } 등)면 매 render 마다 새 reference →
  // deps 에 그대로 두면 컬럼이 매번 재생성됨. 내용 기준 stable key 로 비교.
  const auditKey =
    audit && typeof audit === "object" ? JSON.stringify(audit) : audit;

  const activeColumnDefs = useMemo(() => {
    const base =
      layoutType === "tab" && activeTab && presets
        ? presets[activeTab].columnDefs ?? []
        : columnDefs;

    // audit === undefined / false → 자동 추가 안 함 (기존 화면 호환)
    if (!audit) return base;

    const auditOpts = typeof audit === "object" ? audit : undefined;
    return [...base, ...(standardAudit(setRowData, auditOpts) as any[])];
    // setRowData 는 model.bind() Proxy 가 매번 새 함수 reference 를 반환 →
    // deps 에 두면 finalColumnDefs 가 매 render 마다 재생성되어 ag-grid 가
    // columnEverythingChanged 를 폭주시키고 cellEditor mount 를 차단함.
    // audit 도 인라인 객체면 동일 문제 → auditKey(직렬화) 로 비교.
    // 함수/객체의 결과는 동일하므로 deps 에서 제외 (stale closure 무해).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutType, activeTab, presets, columnDefs, auditKey]);

  const activeRowData = useMemo(() => {
    // escape hatch: 외부 rowData 직접 주입
    if (overrideRowData !== undefined) return overrideRowData;
    if (
      layoutType === "tab" &&
      activeTab &&
      rowData &&
      !Array.isArray(rowData)
    ) {
      return rowData[activeTab] ?? [];
    }
    return Array.isArray(rowData) ? rowData : [];
  }, [layoutType, activeTab, rowData, overrideRowData]);

  // summaryType: "sum"|"avg"|"count"|"min"|"max" 컬럼을 pinnedBottomRowData 로 생성.
  //  summaryScope: "all"(기본, 전체 행) | "selected"(선택 행) — 하단 고정 집계행.
  const summaryRow = useMemo(() => {
    type SummaryType = "sum" | "avg" | "count" | "min" | "max";
    type SummaryScope = "all" | "selected";
    const resolveType = (c: any): SummaryType | undefined =>
      (c?.summaryType as SummaryType) ?? undefined;
    const collect = (
      cols: any[],
    ): Array<{ field: string; type: SummaryType; scope: SummaryScope }> => {
      const out: Array<{
        field: string;
        type: SummaryType;
        scope: SummaryScope;
      }> = [];
      for (const c of cols) {
        const type = resolveType(c);
        if (type && c.field)
          out.push({
            field: c.field,
            type,
            scope: c?.summaryScope === "selected" ? "selected" : "all",
          });
        if (Array.isArray(c?.children)) out.push(...collect(c.children));
      }
      return out;
    };
    const targets = collect(activeColumnDefs as any[]);
    if (targets.length === 0) return undefined;

    const toNumber = (v: unknown) => {
      const n =
        typeof v === "number"
          ? v
          : Number(String(v ?? "").replaceAll(",", ""));
      return Number.isNaN(n) ? null : n;
    };

    const allRows = activeRowData as any[];
    const selRows = (selectedRows ?? []) as any[];
    const row: Record<string, any> = {};
    for (const { field, type, scope } of targets) {
      const srcRows = scope === "selected" ? selRows : allRows;
      const nums = srcRows
        .map((r) => toNumber(r?.[field]))
        .filter((n): n is number => n != null);
      switch (type) {
        case "count":
          row[field] = srcRows.length;
          break;
        case "min":
          row[field] = nums.length ? Math.min(...nums) : 0;
          break;
        case "max":
          row[field] = nums.length ? Math.max(...nums) : 0;
          break;
        case "avg":
          row[field] = nums.length
            ? nums.reduce((acc, n) => acc + n, 0) / nums.length
            : 0;
          break;
        case "sum":
        default:
          row[field] = nums.reduce((acc, n) => acc + n, 0);
          break;
      }
    }
    return [row];
  }, [activeColumnDefs, activeRowData, selectedRows]);

  const activeActions = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].actions ?? actions ?? [];
    }
    return actions ?? [];
  }, [layoutType, activeTab, presets, actions]);

  const activeOnCellValueChanged = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].onCellValueChanged ?? onCellValueChanged;
    }
    return onCellValueChanged;
  }, [layoutType, activeTab, presets, onCellValueChanged]);

  const activeOnRowClicked = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].onRowClicked ?? onRowClicked;
    }
    return onRowClicked;
  }, [layoutType, activeTab, presets, onRowClicked]);

  // ─── 첫행 자동선택 키 / 활성여부 결정 ──────────────────────────────
  // 키: columnDefs 에 isPrimaryKey:true 인 컬럼들의 field 자동 추출.
  // 활성: onRowClicked 가 있고 PK 컬럼이 1개 이상일 때 true.
  const effectiveRowKeys = useMemo<string[]>(() => {
    const keys: string[] = [];
    for (const c of activeColumnDefs as any[]) {
      if (c?.isPrimaryKey && c.field) keys.push(c.field);
    }
    return keys;
  }, [activeColumnDefs]);

  const effectiveAutoSelect = useMemo<boolean>(
    () => !!activeOnRowClicked && effectiveRowKeys.length > 0,
    [activeOnRowClicked, effectiveRowKeys],
  );

  const activeCodeMap = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].codeMap ?? codeMap;
    }
    return codeMap;
  }, [layoutType, activeTab, presets, codeMap]);

  const activeRender =
    layoutType === "tab" && activeTab && presets
      ? presets[activeTab].render
      : undefined;

  /** 컬럼 변환은 gridCommon.processColumnDef 가 처리. (Lang/align/type/DTTM/date/numeric/_STS) */
  const finalColumnDefs = useMemo(
    () =>
      activeColumnDefs.map((col) =>
        processColumnDef(col, {
          codeMap: activeCodeMap,
          rowCountForNo: activeRowData.length,
          setRowData,
          openPopup,
          closePopup,
          readOnly,
          model,
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeColumnDefs, activeCodeMap, setRowData, openPopup, closePopup, readOnly, model],
  );

  return {
    activeColumnDefs,
    activeRowData,
    summaryRow,
    activeActions,
    activeOnCellValueChanged,
    activeOnRowClicked,
    effectiveRowKeys,
    effectiveAutoSelect,
    activeCodeMap,
    activeRender,
    finalColumnDefs,
  };
}
