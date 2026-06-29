import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import {
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { stoShipmentDispatchApi as api } from "./StoShipmentDispatchApi";
import { MENU_CODE } from "./StoShipmentDispatch";
import type { GridKey, StoShipmentDispatchModel } from "./StoShipmentDispatchModel";

interface Args {
  model: StoShipmentDispatchModel;
}

export function useStoShipmentDispatchController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback((params: Record<string, unknown>) => {
    const nextParams = { ...params };
    delete (nextParams as any).BOOKING;
    return api.getList(nextParams);
  }, []);

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(data?.rows?.[0] ?? null);
    },
    [model.grids.main],
  );

  const onMainGridClick = useCallback(
    (row: any) => model.grids.main.setSelected(row ?? null),
    [model.grids.main],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [base, menuName, model.filtersRef, model.grids.main],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
