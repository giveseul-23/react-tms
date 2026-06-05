import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { Lang } from "@/app/services/common/Lang";
import { rangeMgmtApi as api } from "./RangeMgmtApi";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./RangeMgmtColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { RangeMgmtModel, GridKey } from "./RangeMgmtModel";

interface ControllerArgs {
  model: RangeMgmtModel;
}

export function useRangeMgmtController({ model }: ControllerArgs) {
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
          fetch: (r) => api.getDetailList({ RNG_CD: r.RNG_CD }),
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

  const onAddMain = useCallback(() => {
    base.resetGrids(["detail"]);
    base.addRow("main", {
      USE_YN: "Y",
    });
  }, [base]);

  const onAddDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_RNG_CD"))) return;
    base.addRow("detail", {
      RNG_CD: main.RNG_CD,
      USE_YN: "Y",
    });
  }, [model, base]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.saveMain, {
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base],
  );

  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.saveDetail, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getDetailList({ RNG_CD: main.RNG_CD }),
        },
      }),
    [base],
  );

  const menuName = Lang.get("MENU_RNG_MGMT");

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: Lang.get("MENU_RNG_MGMT"),
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, menuName, model],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
      makeExcelGroupAction({
        columns: DETAIL_COLUMN_DEFS,
        menuName: Lang.get("MENU_RNG_MGMT"),
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main
            ? api.getDetailList({ RNG_CD: main.RNG_CD })
            : Promise.resolve({ data: { result: [] } });
        },
        rows: model.grids.detail.rows,
      }),
    ],
    [onAddDetail, onSaveDetail, menuName, model],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
