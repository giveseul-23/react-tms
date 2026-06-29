import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { controlDataReceptionStatusApi as api } from "./ControlDataReceptionStatusApi";
import { MENU_CODE } from "./ControlDataReceptionStatus";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  ControlDataReceptionStatusModel,
  GridKey,
} from "./ControlDataReceptionStatusModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface ControllerArgs {
  model: ControlDataReceptionStatusModel;
}

export function useControlDataReceptionStatusController({
  model,
}: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

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
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current ?? {}),
        rows: () => model.grids.main.rows,
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
