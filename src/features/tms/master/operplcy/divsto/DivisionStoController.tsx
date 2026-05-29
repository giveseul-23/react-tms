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

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) => api.getDetailList({ DIV_CD: r.DIV_CD }),
        },
      ]),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
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
          fetch: (main) => api.getDetailList({ DIV_CD: main.DIV_CD }),
        }
      }),
    [base],
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
