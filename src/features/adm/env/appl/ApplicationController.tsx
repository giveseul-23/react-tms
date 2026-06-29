import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { applicationApi } from "./ApplicationApi";
import type { ApplicationModel, GridKey } from "./ApplicationModel";

import { MENU_CD } from "./Application";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

type ControllerProps = {
  model: ApplicationModel;
};

export function useApplicationController({ model }: ControllerProps) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) =>
        applicationApi.getApplicationList(MENU_CD, { ...params }),
      save: (payload) =>
        applicationApi.saveApplication({
          dsSave: payload.dsSave,
          MENU_CD: MENU_CD,
        }),
    },
  });
  const { menuName } = useMenuMeta();

  const handleAdd = useCallback(() => {
    base.addRow("main", {
      APPL_CD: "",
      APPL_NM: "",
      USE_YN: "Y",
    });
  }, [base]);

  const handleSave = useCallback(
    () =>
      base.saveGrid("main", (payload) =>
        applicationApi.saveApplication({
          ...payload,
          MENU_CD: MENU_CD,
        }),
      ),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleAdd }),
      makeSaveAction({ onClick: handleSave }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () =>
          applicationApi.getApplicationList(MENU_CD, model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [handleAdd, handleSave, model.filtersRef, model.grids.main.rows],
  );

  return {
    fetchApplicationList: base.fetchList,
    onSearchCallback: base.onSearchCallback,
    mainActions,
  };
}
