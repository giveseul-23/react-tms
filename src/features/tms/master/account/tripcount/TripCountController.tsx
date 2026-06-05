import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { tripCountApi as api } from "./TripCountApi";
import { MENU_CODE } from "./TripCount";
import { MAIN_COLUMN_DEFS } from "./TripCountColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { TripCountModel, GridKey } from "./TripCountModel";
import { Lang } from "@/app/services/common/Lang";

interface ControllerArgs {
  model: TripCountModel;
}

export function useTripCountController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });

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
    base.addRow("main", { TRIP_CNT: 2 });
  }, [base]);

  const onSaveMain = useCallback(() => base.saveGrid("main", api.save), [base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: Lang.get("MENU_TRIPCNT_MGMT"),
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