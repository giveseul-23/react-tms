import { useCallback, type MutableRefObject } from "react";
import { newRid } from "@/app/feature/useBaseModel";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { useGridAdd, useGridSave } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { applicationApi } from "./ApplicationApi";
import { MAIN_COLUMN_DEFS } from "./ApplicationColumns";
import type { ApplicationModel } from "./ApplicationModel";

type ControllerProps = {
  menuCd: string;
  model: ApplicationModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useApplicationController({
  menuCd,
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchApplicationList = useCallback(
    (params: Record<string, unknown>) =>
      applicationApi.getApplicationList(menuCd, { ...params }),
    [menuCd],
  );

  const saveApplication = useCallback(
    (payload: any) =>
      applicationApi.saveApplication({
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
    newRow: { __rid__: newRid(), APPL_CD: "", APPL_NM: "", USE_YN: "Y" },
    position: "top",
  });

  const handleSave = useGridSave({
    rows: model.gridData.rows,
    setRows: model.setGridData,
    saveFn: saveApplication,
    onSaved: () => searchRef.current?.(),
  });

  const mainActions: ActionItem[] = [
    makeAddAction({ onClick: handleAdd }),
    makeSaveAction({ onClick: handleSave }),
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS(),
      menuName: "MENU_APPLICATION",
      fetchFn: () => applicationApi.getApplicationList(menuCd, filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  return {
    fetchApplicationList,
    onSearchCallback,
    mainActions,
  };
}
