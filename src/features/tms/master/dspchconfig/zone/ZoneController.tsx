import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { zoneApi as api } from "./ZoneApi";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./ZoneColumns";
import type { GridKey, ZoneModel } from "./ZoneModel";
import { Lang } from "@/app/services/common/Lang";

const MENU_CD = "MENU_ZONE_MGMT";

interface Args {
  model: ZoneModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useZoneController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { resetGrids, searchSub } = base;

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const fetchSub01 = useCallback(
    (row: any) =>
      api.getZoneCodeList({
        DIV_CD: row.DIV_CD,
        LGST_GRP_CD: row.LGST_GRP_CD,
      }),
    [],
  );

  const fetchSub02 = useCallback(
    (row: any) => {
      if (!row || String(row.EDIT_STS ?? "").trim() === "I") {
        return EMPTY_RESULT;
      }
      return api.getZoneCodeDetailList({
        DIV_CD: row.DIV_CD,
        LGST_GRP_CD: row.LGST_GRP_CD,
        ZN_CD: row.ZN_CD,
        CTRY_CD: row.CTRY_CD,
      });
    }, []);

  const fetchSub03 = useCallback((row: any) => {
    if (!row || String(row.EDIT_STS ?? "").trim() === "I") {
      return EMPTY_RESULT;
    }
    return api.getZoneCodeLocationList({
      DIV_CD: row.DIV_CD,
      LGST_GRP_CD: row.LGST_GRP_CD,
      ZN_CD: row.ZN_CD,
    });
  }, []);

  const cascadeFromSub01 = useCallback(
    async (row: any) => {
      model.grids.sub01.setSelected(row);
      resetGrids(["sub02", "sub03"]);
      if (!row) return;
      await Promise.all([
        searchSub("sub02", fetchSub02(row)),
        searchSub("sub03", fetchSub03(row)),
      ]);
    },
    [model.grids.sub01, resetGrids, searchSub, fetchSub02, fetchSub03],
  );

  const cascadeFromMain = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      resetGrids(["sub01", "sub02", "sub03"]);
      if (!row) return;

      const sub01Rows = await searchSub("sub01", fetchSub01(row));
      const firstSub01 =
        model.grids.sub01.ref.current?.rows?.[0] ?? sub01Rows?.[0] ?? null;
      if (firstSub01) {
        await cascadeFromSub01(firstSub01);
      }
    },
    [
      model.grids.main,
      model.grids.sub01,
      resetGrids,
      searchSub,
      fetchSub01,
      cascadeFromSub01,
    ],
  );

  const onSub01GridClick = useCallback(
    (row: any) => {
      void cascadeFromSub01(row);
    },
    [cascadeFromSub01],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      void cascadeFromMain(row);
    },
    [cascadeFromMain],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;

      if (firstMain) {
        onMainGridClick(firstMain);
      } else {
        resetGrids(["sub01", "sub02", "sub03"]);
      }
    },
    [model.grids.main, onMainGridClick, resetGrids],
  );

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_LOGISTICS_GROUP_CODE"))) return;
    base.resetGrids(["sub02", "sub03"]);
    base.addRow("sub01", {
      DIV_CD: main.DIV_CD,
      LGST_GRP_CD: main.LGST_GRP_CD,
    });
    const added = model.grids.sub01.selectedRef.current;
    if (added) void cascadeFromSub01(added);
  }, [base, model.grids.main, cascadeFromSub01]);

  const onAddSub02 = useCallback(() => {
    const sub01 = model.grids.sub01.selectedRef.current;
    if (!base.requireParentRow(sub01, Lang.get("LBL_ZONE_CD"))) return;
    base.addRow("sub02", {
      DIV_CD: sub01.DIV_CD,
      LGST_GRP_CD: sub01.LGST_GRP_CD,
      ZN_CD: sub01.ZN_CD,
      CTRY_CD: sub01.CTRY_CD,
    });
  }, [base, model.grids.sub01]);

  const onAddSub03 = useCallback(() => {
    const sub01 = model.grids.sub01.selectedRef.current;
    if (!base.requireParentRow(sub01, Lang.get("LBL_ZONE_CD"))) return;
    if (String(sub01.EDIT_STS ?? "").trim() === "I") return;

    // TODO: 팝업
  }, [base, model.grids.sub01]);

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", api.saveZoneCode, {
        afterSave: {
          cascadeFrom: "main",
          fetch: fetchSub01,
        },
      }),
    [base, fetchSub01],
  );

  const onSaveSub02 = useCallback(
    () =>
      base.saveGrid("sub02", api.saveZoneCodeDetail, {
        afterSave: {
          cascadeFrom: "sub01",
          fetch: fetchSub02,
        },
      }),
    [base, fetchSub02],
  );

  const onSaveSub03 = useCallback(
    () =>
      base.saveGrid("sub03", api.saveZoneLocation, {
        afterSave: {
          cascadeFrom: "sub01",
          fetch: fetchSub03,
        },
      }),
    [base, fetchSub03],
  );

  // TODO: 엑셀 템플릿 다운로드
  const onExcelTemplateDownload = useCallback(() => { }, []);

  // TODO: 엑셀 업로드
  const onExcelUpload = useCallback(() => { }, []);

  const mainExcelDown = useMemo(
    () =>
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: MENU_CD,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    [model.filtersRef, model.grids.main.rows],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "group",
        key: "BTN_EXCEL",
        label: "BTN_EXCEL",
        items: [
          ...(mainExcelDown.items ?? []),
          {
            type: "button",
            key: "BTN_EXCEL_UP",
            label: "BTN_EXCEL_UP",
            onClick: onExcelUpload,
          },
          {
            type: "button",
            key: "BTN_EXCEL_TEMPLATE_DOWNLOAD",
            label: "BTN_EXCEL_TEMPLATE_DOWNLOAD",
            onClick: onExcelTemplateDownload,
          },
        ],
      },
    ],
    [mainExcelDown, onExcelUpload, onExcelTemplateDownload],
  );

  const subActions = useMemo(
    () => ({
      sub01: [
        makeAddAction({ onClick: onAddSub01 }),
        makeSaveAction({ onClick: onSaveSub01 }),
        makeExcelGroupAction({
          columns: SUB01_COLUMN_DEFS,
          menuName: MENU_CD,
          fetchFn: () => {
            const main = model.grids.main.selectedRef.current;
            return main ? fetchSub01(main) : EMPTY_RESULT;
          },
          rows: model.grids.sub01.rows,
        }),
      ],
      sub02: [
        makeAddAction({ onClick: onAddSub02 }),
        makeSaveAction({ onClick: onSaveSub02 }),
        makeExcelGroupAction({
          columns: SUB02_COLUMN_DEFS,
          menuName: MENU_CD,
          fetchFn: () => {
            const sub01 = model.grids.sub01.selectedRef.current;
            return sub01 ? fetchSub02(sub01) : EMPTY_RESULT;
          },
          rows: model.grids.sub02.rows,
        }),
      ],
      sub03: [
        makeAddAction({ onClick: onAddSub03 }),
        makeSaveAction({ onClick: onSaveSub03 }),
      ],
    }),
    [
      fetchSub01,
      fetchSub02,
      model.grids.main,
      model.grids.sub01,
      model.grids.sub02.rows,
      onAddSub01,
      onAddSub02,
      onAddSub03,
      onSaveSub01,
      onSaveSub02,
      onSaveSub03,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    mainActions,
    subActions,
  };
}
