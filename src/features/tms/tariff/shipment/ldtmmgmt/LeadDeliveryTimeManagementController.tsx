import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { leadDeliveryTimeManagementApi as api } from "./LeadDeliveryTimeManagementApi";
import { MAIN_COLUMN_DEFS } from "./LeadDeliveryTimeManagementColumns";
import { MENU_CODE } from "./LeadDeliveryTimeManagement";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  LeadDeliveryTimeManagementModel,
  GridKey,
} from "./LeadDeliveryTimeManagementModel";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

const stripSep = (v: any) => String(v ?? "").replace(/[\s\-:/T]/g, "");

interface ControllerArgs {
  model: LeadDeliveryTimeManagementModel;
}

export function useLeadDeliveryTimeManagementController({
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
    },
    [model.grids.main],
  );

  const onAddMain = useCallback(() => {
    const srch = model.rawFiltersRef.current ?? {};
    const divCd = srch.SRCH_DIV_DIV_CD ?? srch.SRCH_DIV_CD ?? "";
    const lgstGrpCd =
      srch.SRCH_LGST_LGST_GRP_CD ?? srch.SRCH_LGST_GRP_CD ?? "";

    if (!divCd || !lgstGrpCd) {
      base.alert(Lang.get("MSG_SEL_SEARCH_CONFISION"), Lang.get("TTL_ALERT"));
      return;
    }

    base.addRow("main", {
      DIV_CD: divCd,
      LGST_GRP_CD: lgstGrpCd,
    });
  }, [base, model.rawFiltersRef]);

  const checkBeforeSave = useCallback(() => {
    const rows = model.grids.main.ref.current?.rows ?? [];
    const modified = rows.filter(
      (r: any) =>
        r.EDIT_STS === "I" ||
        r.EDIT_STS === "U" ||
        r.EDIT_STS === "D" ||
        r.delStatus === true,
    );

    for (const row of modified) {
      if (
        row.FRM_DT &&
        row.TO_DT &&
        stripSep(row.TO_DT) < stripSep(row.FRM_DT)
      ) {
        base.alert(Lang.get("MSG_INPUT_DATE_VALIDATION"), Lang.get("TTL_ERR"));
        return false;
      }
    }
    return true;
  }, [model, base]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        beforeSave: checkBeforeSave,
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base, checkBeforeSave],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, menuName, model],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
