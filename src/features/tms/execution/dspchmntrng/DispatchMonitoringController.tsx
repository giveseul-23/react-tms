import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchMonitoringApi as api } from "./DispatchMonitoringApi.ts";
import type { DispatchMonitoringModel, GridKey } from "./DispatchMonitoringModel.ts";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar.tsx";
import { MENU_CODE } from "./DispatchMonitoring";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface ControllerArgs {
  model: DispatchMonitoringModel;
}

export function useDispatchMonitoringController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [model, menuName],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
