import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridUtils/rowStatus";
import { tariffChargeServiceApi as api } from "./TariffChargeServiceApi";
import { MAIN_COLUMN_DEFS } from "./TariffChargeServiceColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  TariffChargeServiceModel,
  GridKey,
} from "./TariffChargeServiceModel";
import { Lang } from "@/app/services/common/Lang";

interface ControllerArgs {
  model: TariffChargeServiceModel;
}

export function useTariffChargeServiceController({ model }: ControllerArgs) {
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
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base, validateBeforeSave],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: Lang.get("MENU_DSPTCH_SERVICE_MGMT"),
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
