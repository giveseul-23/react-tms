// 선언적 그리드 Controller 훅.
// config 와 model 을 받아 fetchList / handleSearch / cascade fetch /
// 그리드별 액션(add/save) 을 자동 생성. DataGrid 에 spread 할 props 묶음(`bind`) 도 제공.

import { useCallback, useMemo, MutableRefObject } from "react";
import { useApiHandler } from "@/hooks/useApiHandler";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/commonActions";
import { dirtyRows, toDsSave } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { EMPTY_GRID, type FeatureConfig } from "./types";
import type { GridModel } from "./useGridModel";

interface ControllerArgs {
  config: FeatureConfig;
  model: GridModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef?: MutableRefObject<Record<string, unknown>>;
}

export function useGridController({
  config,
  model,
  searchRef,
}: ControllerArgs) {
  const { handleApi } = useApiHandler();

  const gridKeys = useMemo(() => Object.keys(config.grids), [config.grids]);
  const firstGridKey = gridKeys[0];

  // ── fetchList: SearchFilters → 첫 그리드 API 호출 ─────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      const firstGrid = config.grids[firstGridKey];
      const apiName = firstGrid?.api?.fetch;
      if (!apiName || !config.api[apiName]) {
        return Promise.resolve({ data: { result: [] } });
      }
      const extra: Record<string, any> = {};
      if (config.fetchListExtraParams) {
        for (const [k, fn] of Object.entries(config.fetchListExtraParams)) {
          extra[k] = fn(model);
        }
      }
      return config.api[apiName]({ ...params, ...extra });
    },
    [config, model, firstGridKey],
  );

  // ── fan-out + chain 지원 cascade fetch.
  //    sourceKey 의 모든 직계 자식(fetchOnRowClickFrom === sourceKey)을 병렬 fetch.
  //    각 자식의 결과 첫 행으로 손자 cascade 재귀.
  const cascadeFromRow = useCallback(
    async (sourceKey: string, sourceRow: any) => {
      const directChildren = gridKeys.filter(
        (k) => config.grids[k].fetchOnRowClickFrom === sourceKey,
      );
      if (directChildren.length === 0) return;

      await Promise.all(
        directChildren.map(async (childKey) => {
          const gc = config.grids[childKey];

          // 비우기 (재조회 전 이전 데이터 클리어)
          model.grids[childKey].setData(
            gc.type === "paginated" ? EMPTY_GRID : [],
          );
          if (config.selections?.includes(childKey)) {
            model.selected[childKey]?.set(null);
          }

          if (!sourceRow) return;

          const apiName = gc.api?.fetch;
          if (!apiName || !config.api[apiName]) return;

          const params = gc.paramMap ? gc.paramMap(sourceRow, model) : {};
          try {
            const res: any = await config.api[apiName](params);
            const rows = res.data?.result ?? res.data?.data?.dsOut ?? [];
            if (gc.type === "paginated") {
              model.grids[childKey].setData({
                rows,
                totalCount: rows.length,
                page: 1,
                limit: 20,
              });
            } else {
              model.grids[childKey].setData(rows);
            }
            const firstChildRow = rows[0];
            if (
              firstChildRow &&
              config.selections?.includes(childKey)
            ) {
              model.selected[childKey]?.set(firstChildRow);
            }
            // 손자 cascade 재귀
            if (firstChildRow) {
              await cascadeFromRow(childKey, firstChildRow);
            }
          } catch (err) {
            console.error(
              `[useGridController] cascade fetch failed (${childKey})`,
              err,
            );
          }
        }),
      );
    },
    [config, model, gridKeys],
  );

  // ── handleSearch: SearchFilters 결과를 첫 그리드에 set + cascade ──
  const handleSearch = useCallback(
    async (data: any) => {
      // 1. 첫 그리드 set
      model.grids[firstGridKey].setData(data);
      // 2. selection 모두 초기화
      for (const k of config.selections ?? []) {
        model.selected[k]?.set(null);
      }
      // 3. 첫 행 자동 선택 + cascade
      const firstRow = data.rows?.[0];
      if (!firstRow) {
        // 후속 그리드 비움
        for (const key of gridKeys.slice(1)) {
          const gc = config.grids[key];
          model.grids[key].setData(gc.type === "paginated" ? EMPTY_GRID : []);
        }
        return;
      }
      if (config.selections?.includes(firstGridKey)) {
        model.selected[firstGridKey]?.set(firstRow);
      }
      await cascadeFromRow(firstGridKey, firstRow);
    },
    [config, model, gridKeys, firstGridKey, cascadeFromRow],
  );

  // ── 그리드별 행 클릭 핸들러 ────────────────────────────────
  const handleRowClickedByGrid = useMemo(() => {
    const out: Record<string, (row: any) => void> = {};
    for (const sourceKey of gridKeys) {
      out[sourceKey] = (row: any) => {
        if (config.selections?.includes(sourceKey)) {
          model.selected[sourceKey]?.set(row);
        }
        cascadeFromRow(sourceKey, row);
      };
    }
    return out;
  }, [config, model, gridKeys, cascadeFromRow]);

  // ── 그리드별 액션 (add / save / extra) ──────────────────────
  const actionsByGrid = useMemo(() => {
    const out: Record<string, ActionItem[]> = {};
    for (const [key, gc] of Object.entries(config.grids)) {
      const actions: ActionItem[] = [];

      // 추가
      if (gc.newRow) {
        const handleAdd = () => {
          const newRow = { ...gc.newRow!(model), EDIT_STS: "I" };
          if (gc.type === "paginated") {
            model.grids[key].setData((prev: any) => ({
              ...prev,
              rows: [...(prev?.rows ?? []), newRow],
            }));
          } else {
            model.grids[key].setData((prev: any[]) => [...(prev ?? []), newRow]);
          }
        };
        actions.push(makeAddAction({ onClick: handleAdd }));
      }

      // 저장
      if (gc.api?.save) {
        const apiName = gc.api.save;
        const handleSave = () => {
          const rows =
            gc.type === "paginated"
              ? model.grids[key].ref.current?.rows ?? []
              : model.grids[key].ref.current ?? [];
          const dirty = dirtyRows(rows);
          if (dirty.length === 0) return;
          handleApi(
            config.api[apiName]({ dsSave: toDsSave(dirty) }),
            "저장되었습니다.",
          ).then(() => {
            // 첫 그리드면 전체 재조회, 아니면 본인 cascade 만
            if (key === firstGridKey) {
              searchRef.current?.();
            }
          });
        };
        actions.push(makeSaveAction({ onClick: handleSave }));
      }

      if (gc.extraActions?.length) actions.push(...gc.extraActions);

      out[key] = actions;
    }
    return out;
  }, [config, model, handleApi, firstGridKey, searchRef]);

  // ── DataGrid 에 spread 할 props 묶음 ─────────────────────────
  // 반환 타입에 actions/columnDefs/rowData 등 필수 props 포함시켜
  // 호출부에서 <DataGrid {...ctrl.bind(...)} /> 시 TS 가 props 누락이라 오해하지 않게.
  type BindResult = {
    layoutType: "plain";
    columnDefs: any[];
    rowData: any[];
    actions: ActionItem[];
    rowSelection: string;
    onRowClicked?: (row: any) => void;
    totalCount?: number;
    currentPage?: number;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
    onPageChange?: (page: number) => void;
    autoSelectFirstRow?: boolean;
    rowKeys?: string | string[];
    subTitle?: string;
    [key: string]: any;
  };

  const bind = useCallback(
    (
      gridKey: string,
      columnDefs: ((setRowData?: any) => any[]) | any[],
      overrides?: Record<string, any>,
    ): BindResult => {
      const gc = config.grids[gridKey];
      const grid = model.grids[gridKey];
      const cols =
        typeof columnDefs === "function" ? columnDefs(grid.setData) : columnDefs;

      const props: BindResult = {
        layoutType: "plain",
        columnDefs: cols,
        rowData: grid.rows,
        actions: actionsByGrid[gridKey] ?? [],
        rowSelection: "single",
        onRowClicked: handleRowClickedByGrid[gridKey],
      };

      if (gc.type === "paginated") {
        const data = grid.data as any;
        props.totalCount = data?.totalCount ?? 0;
        props.currentPage = data?.page ?? 1;
        props.pageSize = model.pageSize;
        props.onPageSizeChange = model.setPageSize;
        props.onPageChange = (page: number) => searchRef.current?.(page);
      }

      if (gc.rowKey) {
        props.autoSelectFirstRow = gc.autoSelectFirstRow ?? true;
        props.rowKeys = gc.rowKey;
      }

      if (gc.subTitle) props.subTitle = gc.subTitle;

      return { ...props, ...(overrides ?? {}) };
    },
    [config, model, actionsByGrid, handleRowClickedByGrid, searchRef],
  );

  return {
    fetchList,
    handleSearch,
    handleRowClicked: handleRowClickedByGrid,
    actions: actionsByGrid,
    bind,
  };
}
