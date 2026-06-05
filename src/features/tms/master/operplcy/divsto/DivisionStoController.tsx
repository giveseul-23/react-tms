import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { Lang } from "@/app/services/common/Lang";
import { divisionStoApi as api } from "./DivisionStoApi";
import type { DivisionStoModel, GridKey } from "./DivisionStoModel";

interface ControllerArgs {
  model: DivisionStoModel;
}

export function useDivisionStoController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { resetGrids } = base;

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const fetchDetail = useCallback(
    (mainRow: any) => api.getDetailList({ DIV_CD: mainRow.DIV_CD }),
    [],
  );

  const loadDetail = useCallback(
    async (mainRow: any) => {
      resetGrids(["detail"]);
      if (!mainRow?.DIV_CD) return;
      await base.searchSub("detail", fetchDetail(mainRow));
    },
    [base, fetchDetail, resetGrids],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: fetchDetail,
        },
      ]),
    [base, fetchDetail],
  );

  const onSearchCallback = useCallback(
    async (data: any) => {
      model.grids.main.setData(data);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;
      if (firstMain) {
        model.grids.main.setSelected(firstMain);
        await loadDetail(firstMain);
      } else {
        resetGrids(["detail"]);
      }
    },
    [loadDetail, model.grids.main, resetGrids],
  );

  const onAddDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_DIVISION_CODE"))) return;
    base.addRow("detail", {
      DIV_CD: main.DIV_CD,
      STO_DIV_CRE_TCD: "STO_DIV_CRE",
    });
  }, [base, model.grids.main.selectedRef]);

  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.saveDetail, {
        afterSave: {
          cascadeFrom: "main",
          fetch: fetchDetail,
        },
      }),
    [base, fetchDetail],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
    ],
    [onAddDetail, onSaveDetail],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    detailActions,
  };
}
