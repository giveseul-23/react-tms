import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { processApi as api } from "./ProcessApi";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ProcessModel, GridKey } from "./ProcessModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { MENU_CODE } from "./Process";

interface ControllerArgs {
  model: ProcessModel;
}

export function useProcessController({ model }: ControllerArgs) {
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

  const onAddMain = useCallback(() => {
    base.addRow("main", {});
  }, [base]);

  const onSaveMain = useCallback(() => base.saveGrid("main", api.save), [base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, model],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
