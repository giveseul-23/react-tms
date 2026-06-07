import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { commonCodeApi } from "./CommonCodeApi";
import type { CommonCodeModel, GridKey } from "./CommonCodeModel";

interface Args {
  model: CommonCodeModel;
}

import { MENU_CD } from "./CommonCode";

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useCommonCodeController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      const srchObj = model.rawFiltersRef.current;
      return commonCodeApi.getCommonCodeList(MENU_CD, {
        ...params,
        CMMN_DTL_CD_SQL: srchObj.CMMN_DTL_CD,
        CMMN_DTL_NM_SQL: srchObj.LANG_DESC,
      });
    },
    [model.rawFiltersRef],
  );

  const fetchSub01 = useCallback(
    (row: any) =>
      commonCodeApi.getCommonCodeDetailList(MENU_CD, {
        CMMN_CD: row.CMMN_CD,
      }),
    [],
  );

  const fetchSub02 = useCallback(
    (row: any) =>
      commonCodeApi.getCommonCodeLangList(MENU_CD, {
        CMMN_CD: row.CMMN_CD,
        CMMN_DTL_CD: row.CMMN_DTL_CD,
      }),
    [],
  );

  const loadSub02 = useCallback(
    async (sub01Row: any) => {
      base.resetGrids(["sub02"]);
      if (!sub01Row) return;

      const sub02Rows = await base.searchSub("sub02", fetchSub02(sub01Row));
      const firstSub02 =
        model.grids.sub02.ref.current?.rows?.[0] ?? sub02Rows?.[0];
      if (firstSub02) {
        model.grids.sub02.setSelected(firstSub02);
      }
    },
    [base, fetchSub02, model.grids.sub02],
  );

  const loadSub01 = useCallback(
    async (mainRow: any) => {
      base.resetGrids(["sub01", "sub02"]);
      if (!mainRow) return;

      const sub01Rows = await base.searchSub("sub01", fetchSub01(mainRow));
      const firstSub01 =
        model.grids.sub01.ref.current?.rows?.[0] ?? sub01Rows?.[0];
      if (firstSub01) {
        model.grids.sub01.setSelected(firstSub01);
        await loadSub02(firstSub01);
      }
    },
    [base, fetchSub01, loadSub02, model.grids.sub01],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row ?? null);
      await loadSub01(row);
    },
    [loadSub01, model.grids.main],
  );

  const onSub01GridClick = useCallback(
    async (row: any) => {
      model.grids.sub01.setSelected(row ?? null);
      await loadSub02(row);
    },
    [loadSub02, model.grids.sub01],
  );

  const onSearchCallback = useCallback(
    async (data: any) => {
      model.grids.main.setData(data);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;
      if (firstMain) {
        model.grids.main.setSelected(firstMain);
        await loadSub01(firstMain);
      } else {
        base.resetGrids(["sub01", "sub02"]);
      }
    },
    [base, loadSub01, model.grids.main],
  );

  const onAddMain = useCallback(() => {
    base.resetGrids(["sub01", "sub02"]);
    base.addRow("main", {
      CMMN_CD: "",
      CMMN_CD_NM: "",
      APPL_CD: "",
      USE_YN: "Y",
    });
  }, [base]);

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "Common code")) return;

    base.resetGrids(["sub02"]);
    base.addRow("sub01", {
      CMMN_CD: main.CMMN_CD,
      CMMN_DTL_CD: "",
      DSPLY_SEQ: 0,
      USE_YN: "Y",
      CNFG_VAL1: "",
      CNFG_VAL2: "",
      CNFG_VAL3: "",
    });
  }, [base, model.grids.main]);

  const onAddSub02 = useCallback(() => {
    const sub01 = model.grids.sub01.selectedRef.current;
    if (!base.requireParentRow(sub01, "Detail code")) return;

    const langCount = model.stores.codeLangList?.length ?? 0;
    const currentCount = model.grids.sub02.rows.length;
    if (langCount > 0 && currentCount >= langCount) {
      base.alert("Language rows are already fully added.");
      return;
    }

    base.addRow("sub02", {
      CMMN_CD: sub01.CMMN_CD,
      CMMN_DTL_CD: sub01.CMMN_DTL_CD,
      LANG_TP: "",
      LANG_DESC: "",
    });
  }, [
    base,
    model.grids.sub01,
    model.grids.sub02.rows.length,
    model.stores.codeLangList?.length,
  ]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", (payload) =>
        commonCodeApi.saveCommonCodeInfo({
          ...payload,
          MENU_CD,
        }),
      ),
    [base],
  );

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid(
        "sub01",
        (payload) =>
          commonCodeApi.saveDetailCommonCode({
            ...payload,
            MENU_CD,
          }),
        {
          afterSave: {
            cascadeFrom: "main",
            fetch: (main) => fetchSub01(main),
          },
        },
      ),
    [base, fetchSub01],
  );

  const onSaveSub02 = useCallback(
    () =>
      base.saveGrid(
        "sub02",
        (payload) =>
          commonCodeApi.saveDetailLangCommonCode({
            ...payload,
            MENU_CD,
          }),
        {
          afterSave: {
            cascadeFrom: "sub01",
            fetch: (sub01) => fetchSub02(sub01),
          },
        },
      ),
    [base, fetchSub02],
  );

  const reorderDisplaySequence = useCallback(() => {
    base
      .callAjax(commonCodeApi.reorderDisplaySequence(MENU_CD), "MSG_SAVE_CMPLT")
      .then(async () => {
        const main = model.grids.main.selectedRef.current;
        if (main) {
          await loadSub01(main);
        }
      });
  }, [base, loadSub01, model.grids.main]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () =>
          commonCodeApi.getCommonCodeList(MENU_CD, model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.filtersRef, model.grids.main, onAddMain, onSaveMain],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_ORDER_BY",
        label: "LBL_ORDER_BY",
        onClick: reorderDisplaySequence,
      },
      makeAddAction({ onClick: onAddSub01 }),
      makeSaveAction({ onClick: onSaveSub01 }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub01(main) : EMPTY_RESULT;
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [
      fetchSub01,
      model.grids.main.selectedRef,
      model.grids.sub01,
      onAddSub01,
      onSaveSub01,
      reorderDisplaySequence,
      menuName,
    ],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub02 }),
      makeSaveAction({ onClick: onSaveSub02 }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => {
          const sub01 = model.grids.sub01.selectedRef.current;
          return sub01 ? fetchSub02(sub01) : EMPTY_RESULT;
        },
        rows: model.grids.sub02.rows,
      }),
    ],
    [
      fetchSub02,
      model.grids.sub01.selectedRef,
      model.grids.sub02,
      onAddSub02,
      onSaveSub02,
      menuName,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    mainActions,
    sub01Actions,
    sub02Actions,
  };
}
