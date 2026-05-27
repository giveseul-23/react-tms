import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { Lang } from "@/app/services/common/Lang";
import { qtyItineraryApi as api } from "./QtyItineraryApi";
import { MAIN_COLUMN_DEFS } from "./QtyItineraryColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { QtyItineraryModel, GridKey } from "./QtyItineraryModel";

interface ControllerArgs {
  model: QtyItineraryModel;
}

export function useQtyItineraryController({ model }: ControllerArgs) {
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
    const srch = model.rawFiltersRef.current ?? {};
    const lgstGrpCd = srch.SRCH_A_LGST_GRP_CD ?? "";
    if (!lgstGrpCd) return;

    base.addRow("main", {
      DIV_CD: srch.SRCH_A_DIV_CD ?? "",
      DIV_NM: srch.SRCH_A_DIV_NM ?? "",
      LGST_GRP_CD: lgstGrpCd,
      LGST_GRP_NM: srch.SRCH_A_LGST_GRP_NM ?? "",
      USE_YN: "Y",
    });
  }, [base, model.rawFiltersRef]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
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
        menuName: Lang.get("MENU_QTY_ITNR"),
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
