import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { vehicleTypeApi as api } from "./VehicleTypeApi";
import { MAIN_COLUMN_DEFS } from "./VehicleTypeColumns";
import { AUTH, MENU_CODE } from "./VehicleType";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { VehicleTypeModel, GridKey } from "./VehicleTypeModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: VehicleTypeModel;
}

export function useVehicleTypeController({ model }: Args) {
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
    [model],
  );

  const handleAddRow = useCallback(() => {
    base.addRow("main", { USE_YN: "Y", ROOM_TEMP_YN: "N" });
  }, [base]);

  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.save),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleAddRow }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
        upload: { gridId: AUTH.grids.main, onUploaded: () => base.search() },
        templateDownload: { gridId: AUTH.grids.main, fileName: menuName },
      }),
    ],
    [base, handleAddRow, menuName, model, onSaveMain],
  );

  return {
    fetchList,
    onSearchCallback,
    handleAddRow,
    mainActions,
  };
}
