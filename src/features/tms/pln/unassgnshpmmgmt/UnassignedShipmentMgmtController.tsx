import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { unassignedShipmentMgmtApi as api } from "./UnassignedShipmentMgmtApi";
import { MENU_CODE } from "./UnassignedShipmentMgmt";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  UnassignedShipmentMgmtModel,
  GridKey,
} from "./UnassignedShipmentMgmtModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface ControllerArgs {
  model: UnassignedShipmentMgmtModel;
}

export function useUnassignedShipmentMgmtController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) => base.handleRowClick("main", row),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [model, menuName],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
