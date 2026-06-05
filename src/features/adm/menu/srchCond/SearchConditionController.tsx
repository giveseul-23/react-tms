import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { searchConditionApi } from "@/features/adm/menu/srchCond/SearchConditionApi";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  SearchConditionModel,
  GridKey,
} from "@/features/adm/menu/srchCond/SearchConditionModel";
import { MENU_CD } from "@/features/adm/menu/srchCond/SearchCondition";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

const DEFAULT_NEW_ROW = {
  MENU_CD: "",
  MENU_NM: "",
  DB_CLMN_NM: "",
  DSPLY_SEQ: "",
  MSG_CD: "",
  USE_YN: "Y",
  DSPLY_TP: "",
  DATA_TP: "",
  RNG_SRCH_YN: "N",
  MDTR_YN: "N",
  SRCH_OPRT: "",
  SRCH_OPRT_FIX_YN: "N",
  DFT_VAL: "",
  DT_SRCH_MAX_DAY: "",
  SQL_ID: "",
  SQL_KEY_PARAM: "",
  SQL_PARAM1: "",
  SQL_PARAM2: "",
  SQL_PARAM3: "",
  DATA_CNT_PER_PAGE: "",
  MIN_INP_LEN: "",
  OPR_USE_YN: "N",
  OPR_IN: "",
  OPR_NOT_IN: "",
  OPR_EQL: "",
  OPR_LIKE: "",
  DT_TP: "",
  DT_CRTE_TP: "",
  DATA_SLCT_TP: "",
  CHD_RLT_ID: "",
  SRCH_COND_TTL_WDT: 400,
  SRCH_COND_FLD_WDT: 350,
  SRCH_COND_FLD_DFT_VAL: "",
  SRCH_COND_ALL_YN: "",
  POPUP_DAT_SLCT_TP: "",
  FLTR_CMPO_NM: "",
  FLTR_REF_COL_NM: "",
  DFT_DB_CLMN_CD: "",
  CMB_DLSP_TP: "",
  ORG_DB_CLMN_NM: "",
  ORG_DSPLY_SEQ: "",
};

type ControllerProps = {
  model: SearchConditionModel;
};

export function useSearchConditionController({ model }: ControllerProps) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) => searchConditionApi.getList(params),
      save: (payload) =>
        searchConditionApi.save({
          dsSave: payload.dsSave,
          MENU_CD,
        }),
    },
  });
  const { menuName } = useMenuMeta();

  const handleAdd = useCallback(() => {
    base.addRow("main", { ...DEFAULT_NEW_ROW });
  }, [base]);

  const handleSave = useCallback(
    () =>
      base.saveGrid("main", (payload) =>
        searchConditionApi.save({
          dsSave: payload.dsSave,
          MENU_CD,
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
        fetchFn: () => searchConditionApi.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [handleAdd, handleSave, model.filtersRef, model.grids.main.rows],
  );

  return {
    fetchList: base.fetchList,
    onSearchCallback: base.onSearchCallback,
    mainActions,
  };
}
