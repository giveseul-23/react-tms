import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeSaveAction } from "@/app/components/grid/actions/commonActions";
import { divisionDefaultApi as api } from "./DivisionDefaultApi";
import type { DivisionDefaultModel, GridKey } from "./DivisionDefaultModel";

interface Args {
  model: DivisionDefaultModel;
}

export function useDivisionDefaultController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch ────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getDivisionDefaultList(params),
    [],
  );

  // ── 메인 행 클릭 — detail cascade ──────────────────────────────
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) =>
            api.getDivisionDefaultDetailList({ CNFG_CD: r.CNFG_CD }),
        },
      ]),
    [base],
  );

  // ── 메인 조회 콜백 — 첫 행 자동 선택 + cascade ─────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── Save ──────────────────────────────────────────────────────
  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.saveDetail, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) =>
            api.getDivisionDefaultDetailList({ CNFG_CD: main.CNFG_CD }),
        },
      }),
    [base],
  );

  // ── 그리드별 actions ──────────────────────────────────────────

  const detailActions = useMemo(
    () => [makeSaveAction({ onClick: onSaveDetail })],
    [onSaveDetail],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    detailActions,
  };
}
