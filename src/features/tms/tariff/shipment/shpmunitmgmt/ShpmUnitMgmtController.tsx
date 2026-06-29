import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { shpmUnitMgmtApi as api } from "./ShpmUnitMgmtApi";
import { MAIN_COLUMN_DEFS } from "./ShpmUnitMgmtColumns";
import { MENU_CODE } from "./ShpmUnitMgmt";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ShpmUnitMgmtModel, GridKey } from "./ShpmUnitMgmtModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface ControllerArgs {
  model: ShpmUnitMgmtModel;
}

export function useShpmUnitMgmtController({ model }: ControllerArgs) {
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
    base.addRow("main", {
      DIV_CD: srch.SRCH_DIV_DIV_CD ?? srch.SRCH_DIV_CD ?? "",
      DIV_NM: srch.SRCH_DIV_DIV_NM ?? srch.SRCH_DIV_NM ?? "",
      LGST_GRP_CD:
        srch.SRCH_LGST_LGST_GRP_CD ?? srch.SRCH_LGST_GRP_CD ?? "",
      LGST_GRP_NM:
        srch.SRCH_LGST_LGST_GRP_NM ?? srch.SRCH_LGST_GRP_NM ?? "",
      RDNG_RCD: "9999",
    });
  }, [base, model.rawFiltersRef]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.saveMain, {
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base],
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
