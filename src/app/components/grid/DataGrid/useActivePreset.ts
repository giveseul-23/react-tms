// app/components/grid/DataGrid/useActivePreset.ts
// 탭/프리셋이 활성화된 경우 해당 탭의 값으로, 없으면 기본 props 로 도출되는
// active* 메모이즈 모음. audit 자동 추가, summable 합계, processColumnDef 적용까지.

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
  actions,
  onCellValueChanged,
  onRowClicked,
  codeMap,
  audit,
  setRowData,
  openPopup,
  closePopup,
  readOnly,
}: {
  layoutType: "tab" | "plain";
  activeTab: string | null;
  presets?: Record<string, GridPreset<TRow>>;
  columnDefs: (ColDef<TRow> | ColGroupDef<TRow>)[];
  rowData?: TRow[] | Record<string, TRow[]>;
  overrideRowData?: TRow[];
  actions?: ActionItem[];
  onCellValueChanged?: (params: any) => void;
  onRowClicked?: (row: TRow) => void;
  codeMap?: Record<string, Record<string, string>>;
  audit?: AuditOpts;
  setRowData?: (updater: any) => void;
  openPopup?: (payload: any) => void;
  closePopup?: () => void;
  readOnly?: boolean;
}) {
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
    // 함수 자체의 호출 결과는 동일하므로 deps 에서 제외 (stale closure 무해).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutType, activeTab, presets, columnDefs, audit]);

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

  // summable: true 컬럼의 합계를 pinnedBottomRowData 로 생성
  const summaryRow = useMemo(() => {
    const collectSummable = (cols: any[]): any[] => {
      const out: any[] = [];
      for (const c of cols) {
        if (c?.summable && c.field) out.push(c);
        if (Array.isArray(c?.children))
          out.push(...collectSummable(c.children));
      }
      return out;
    };
    const summable = collectSummable(activeColumnDefs as any[]);
    if (summable.length === 0) return undefined;

    const row: Record<string, any> = {};
    for (const col of summable) {
      const field = col.field as string;
      const total = (activeRowData as any[]).reduce((acc: number, r: any) => {
        const v = r?.[field];
        const n =
          typeof v === "number"
            ? v
            : Number(String(v ?? "").replaceAll(",", ""));
        return Number.isNaN(n) ? acc : acc + n;
      }, 0);
      row[field] = total;
    }
    return [row];
  }, [activeColumnDefs, activeRowData]);

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
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeColumnDefs, activeCodeMap, setRowData, openPopup, closePopup, readOnly],
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
