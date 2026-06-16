import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { cfChargeApi as api } from "./CfChargeApi";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { CfChargeModel, GridKey } from "./CfChargeModel";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { MENU_CODE } from "./CfCharge";

interface ControllerArgs {
  model: CfChargeModel;
}

export function useCfChargeController({ model }: ControllerArgs) {
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

  const checkBeforeSave = useCallback(() => {
    const rows = model.grids.main.ref.current?.rows ?? [];

    const modifiedRows = rows.filter(
      (row: any) => row.EDIT_STS === "I" || row.EDIT_STS === "U",
    );

    if (modifiedRows.length === 0) return true;

    for (const row of modifiedRows) {
      const chgCd = row.CHG_CD ?? "";

      if (chgCd.length > 0 && /^[0-9]/.test(chgCd)) {
        base.alert(Lang.get("MSG_VALID_CHARGE_CODE"));
        return false;
      }
    }
    return true;
  }, [model, base]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        beforeSave: checkBeforeSave,
        confirmOnDelete: Lang.get("MSG_CHK_DELETE"),
      }),
    [base, checkBeforeSave],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, menuName, model.grids.main, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
