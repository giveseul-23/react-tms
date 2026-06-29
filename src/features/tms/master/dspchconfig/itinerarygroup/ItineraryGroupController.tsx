import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { Lang } from "@/app/services/common/Lang";
import { itineraryGroupApi as api } from "./ItineraryGroupApi";
import { MENU_CODE } from "./ItineraryGroup";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ItineraryGroupModel, GridKey } from "./ItineraryGroupModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface ControllerArgs {
  model: ItineraryGroupModel;
}

export function useItineraryGroupController({ model }: ControllerArgs) {
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
    const srchObj = model.rawFiltersRef.current;
    base.addRow("main", {
      DIV_CD: srchObj.SRCH_TI_DIV_CD ?? "",
      LGST_GRP_CD: srchObj.SRCH_TI_LGST_GRP_CD ?? "",
      LGST_GRP_NM: srchObj.SRCH_TI_LGST_GRP_NM ?? "",
    });
  }, [base, model.rawFiltersRef]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        confirmOnDelete: Lang.get("MSG_CHK_DELETE"),
      }),
    [base],
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
        rows: () => model.grids.main.rows,
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
