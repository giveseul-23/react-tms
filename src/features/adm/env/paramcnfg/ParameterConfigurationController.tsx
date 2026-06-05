import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { parameterConfigurationApi } from "./ParameterConfigurationApi";
import { MENU_CD } from "./ParameterConfiguration";
import { MAIN_COLUMN_DEFS } from "./ParameterConfigurationColumns";
import { Lang } from "@/app/services/common/Lang";

import type { ParameterConfigurationModel, GridKey } from "./ParameterConfigurationModel";

type ControllerProps = {
  model: ParameterConfigurationModel;
};

export function useParameterConfigurationController({ model }: ControllerProps) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) =>
        parameterConfigurationApi.getParameterConfigurationList(MENU_CD, { ...params }),
      save: (payload) =>
        parameterConfigurationApi.saveParameterConfiguration({
          dsSave: payload.dsSave,
          MENU_CD: MENU_CD,
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
        parameterConfigurationApi.saveParameterConfiguration({
          dsSave: payload.dsSave,
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
        columns: MAIN_COLUMN_DEFS,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: Lang.get("MENU_CD"),
        fetchFn: () =>
          parameterConfigurationApi.getParameterConfigurationList(MENU_CD, model.filtersRef.current),
        rows: model.grids.main.rows,
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
