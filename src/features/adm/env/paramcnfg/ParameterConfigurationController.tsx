import { useCallback, type MutableRefObject } from "react";
import { newRid } from "@/app/feature/useBaseModel";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { useGridAdd, useGridSave } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { useApiHandler } from "@/hooks/useApiHandler";
import { parameterConfigurationApi } from "./ParameterConfigurationApi";
import { MAIN_COLUMN_DEFS } from "./ParameterConfigurationColumns";
import type { ParameterConfigurationModel } from "./ParameterConfigurationModel";

type ControllerProps = {
  menuCd: string;
  model: ParameterConfigurationModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useParameterConfigurationController({
  menuCd,
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const { handleApi } = useApiHandler();

  const fetchParameterConfigurationList = useCallback(
    (params: Record<string, unknown>) =>
      parameterConfigurationApi.getParameterConfigurationList(menuCd, { ...params }),
    [menuCd],
  );

  const saveParameterConfiguration = useCallback(
    (payload: any) =>
      parameterConfigurationApi.saveParameterConfiguration({
        dsSave: payload.dsSave,
        MENU_CD: menuCd,
      }),
    [menuCd],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      const rows = Array.isArray(data?.rows)
        ? data.rows.map((row: any) =>
            row?.__rid__ ? row : { ...row, __rid__: newRid() },
          )
        : [];

      model.setGridData({
        ...data,
        rows,
      });
    },
    [model],
  );

  const handleAdd = useGridAdd({
    setRows: model.setGridData,
    newRow: {
      __rid__: newRid(),
      SYS_CNFG_CD: "",
      SYS_CNFG_VAL: "",
      SYS_CNFG_DESC: "",
      CNFG_USE_TP: "",
    },
    position: "top",
  });

  const handleSave = useGridSave({
    rows: model.gridData.rows,
    setRows: model.setGridData,
    saveFn: saveParameterConfiguration,
    onSaved: () => searchRef.current?.(),
  });

  const handleReloadServiceUtil = useCallback(
    () =>
      handleApi(
        parameterConfigurationApi.reloadServiceUtil({
          MENU_CD: menuCd,
          dsSave: [],
        }),
      ),
    [handleApi, menuCd],
  );

  const mainActions: ActionItem[] = [
    makeAddAction({ onClick: handleAdd }),
    makeSaveAction({ onClick: handleSave }),
    {
      type: "button",
      key: "BTN_PARAM_CONFIG_RELOAD",
      label: "BTN_PARAM_CONFIG_RELOAD",
      onClick: handleReloadServiceUtil,
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS(),
      menuName: "MENU_PARAM_CNFG",
      fetchFn: () =>
        parameterConfigurationApi.getParameterConfigurationList(
          menuCd,
          filtersRef.current,
        ),
      rows: model.gridData.rows,
    }),
  ];

  return {
    fetchParameterConfigurationList,
    onSearchCallback,
    mainActions,
  };
}
