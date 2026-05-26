import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { applicationApi } from "./ApplicationApi";
import { MAIN_COLUMN_DEFS } from "./ApplicationColumns";
import type { ApplicationModel, GridKey } from "./ApplicationModel";

type ControllerProps = {
  menuCd: string;
  model: ApplicationModel;
};

export function useApplicationController({
  menuCd,
  model,
}: ControllerProps) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) => applicationApi.getApplicationList(menuCd, { ...params }),
      save: (payload) =>
        applicationApi.saveApplication({
          dsSave: payload.dsSave,
          MENU_CD: menuCd,
        }),
    },
  });

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
          dsSave: payload.dsSave,
          MENU_CD: menuCd,
        }),
      ),
    [base, menuCd],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleAdd }),
      makeSaveAction({ onClick: handleSave }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS(),
        menuName: menuCd,
        fetchFn: () => applicationApi.getApplicationList(menuCd, model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [handleAdd, handleSave, menuCd, model.filtersRef, model.grids.main.rows],
  );

  return {
    fetchApplicationList: base.fetchList,
    onSearchCallback: base.onSearchCallback,
    mainActions,
  };
}
