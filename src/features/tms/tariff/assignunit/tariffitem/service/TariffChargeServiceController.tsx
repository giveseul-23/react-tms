import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridUtils/rowStatus";
import { tariffChargeServiceApi as api } from "./TariffChargeServiceApi";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  TariffChargeServiceModel,
  GridKey,
} from "./TariffChargeServiceModel";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { MENU_CODE } from "./TariffChargeService";

interface ControllerArgs {
  model: TariffChargeServiceModel;
}

export function useTariffChargeServiceController({ model }: ControllerArgs) {
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

  const validateBeforeSave = useCallback(() => {
    const rows = model.grids.main.ref.current?.rows ?? [];
    for (const row of dirtyRows(rows)) {
      const cd = String(row.SUBCHG_CD ?? "").trim();
      if (cd && !Number.isNaN(Number(cd.charAt(0)))) {
        base.alert(Lang.get("MSG_VALID_CHARGE_CODE"));
        return false;
      }
    }
    return true;
  }, [base, model.grids.main]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        beforeSave: validateBeforeSave,
      }),
    [base, validateBeforeSave],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
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
