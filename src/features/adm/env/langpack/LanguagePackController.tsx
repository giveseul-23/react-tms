import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { langPackApi } from "@/features/adm/env/langpack/LanguagePackApi";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { LanguagePackModel, GridKey } from "./LanguagePackModel";
import { MAIN_COLUMN_DEFS } from "./LanguagePackColumns";

type ControllerProps = {
  menuCd: string;
  model: LanguagePackModel;
};

export function useLanguagePackController({
  menuCd,
  model,
}: ControllerProps) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) => langPackApi.getLangPackList(menuCd, { ...params }),
      save: (payload) =>
        langPackApi.saveLangPack({
          dsSave: payload.dsSave,
          MENU_CD: menuCd,
        }),
    },
  });

  const handleAdd = useCallback(() => {
    base.addRow("main", {
      MSG_CD: "",
      LANG_TP: "",
      MSG_DESC: "",
      APPL_CD: "",
    });
  }, [base]);

  const handleCopy = useCallback(() => {
    const selected = model.grids.main.selectedRef.current;
    const sources = selected ? [selected] : model.grids.main.rows;
    if (sources.length === 0) return;

    model.grids.main.setData((prev) => ({
      ...prev,
      rows: [
        ...sources.map((row: any) => ({
          ...row,
          MSG_CD: row.MSG_CD ?? "",
          LANG_TP: row.LANG_TP ?? "",
          MSG_DESC: row.MSG_DESC ?? "",
          APPL_CD: row.APPL_CD ?? "",
          CRE_USR_ID: "",
          CRE_DTTM: "",
          UPD_USR_ID: "",
          UPD_DTTM: "",
          EDIT_STS: "I",
        })),
        ...prev.rows,
      ],
      totalCount: prev.totalCount + sources.length,
    }));
  }, [model.grids.main]);

  const handleSave = useCallback(
    () =>
      base.saveGrid("main", (payload) =>
        langPackApi.saveLangPack({
          dsSave: payload.dsSave,
          MENU_CD: menuCd,
        }),
      ),
    [base, menuCd],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_COPY",
        label: "BTN_COPY",
        onClick: handleCopy,
      },
      makeAddAction({ onClick: handleAdd }),
      makeSaveAction({ onClick: handleSave }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS(),
        menuName: menuCd,
        fetchFn: () => langPackApi.getLangPackList(menuCd, model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [handleAdd, handleCopy, handleSave, menuCd, model.filtersRef, model.grids.main.rows],
  );

  return {
    fetchLanguagePackList: base.fetchList,
    onSearchCallback: base.onSearchCallback,
    mainActions,
  };
}
