import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/commonActions";
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
  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── Add ───────────────────────────────────────────────────────
  const onAddDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "설정항목")) return;
    base.addRow("detail", { CNFG_CD: main.CNFG_CD });
  }, [model, base]);

  // ── Save ──────────────────────────────────────────────────────
  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.saveDivisionDefaultList),
    [base],
  );

  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.saveDivisionDefaultDetailList, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) =>
            api.getDivisionDefaultDetailList({ CNFG_CD: main.CNFG_CD }),
        },
      }),
    [base],
  );

  // ── 그리드별 actions ──────────────────────────────────────────
  const mainActions = useMemo(
    () => [
      makeAddAction({ onClick: () => base.addRow("main", { CNFG_CD: "", CNFG_NM: "" }) }),
      makeSaveAction({ onClick: onSaveMain }),
    ],
    [base, onSaveMain],
  );

  const detailActions = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
    ],
    [onAddDetail, onSaveDetail],
  );

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
