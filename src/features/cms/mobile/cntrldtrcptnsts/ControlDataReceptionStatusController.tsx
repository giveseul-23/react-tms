import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { controlDataReceptionStatusApi as api } from "./ControlDataReceptionStatusApi";
import { MENU_CODE } from "./ControlDataReceptionStatus";
import { MAIN_COLUMN_DEFS } from "./ControlDataReceptionStatusColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  ControlDataReceptionStatusModel,
  GridKey,
} from "./ControlDataReceptionStatusModel";
import { Lang } from "@/app/services/common/Lang";

interface ControllerArgs {
  model: ControlDataReceptionStatusModel;
}

export function useControlDataReceptionStatusController({
  model,
}: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
    },
    [model.grids.main],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: Lang.get("MENU_CTRL_DATA_RCPTN_STS"),
        fetchFn: () => api.getList(model.filtersRef.current ?? {}),
        rows: model.grids.main.rows,
      }),
    ],
    [model.filtersRef, model.grids.main.rows],
  );

  void base;

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
