import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { fuelEfficiencyApi as api } from "./FuelEfficiencyApi";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./FuelEfficiencyColumns";
import { FuelEfficiencyPop } from "./popup/FuelEfficiencyPop";
import type { FuelEfficiencyModel, GridKey } from "./FuelEfficiencyModel";

const MENU_CD = "MENU_FUEL_EFFICIENCY_MGMT";
const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

function ymdToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function ymdAddDays(ymd: string, days: number): string {
  const s = String(ymd).replace(/-/g, "");
  if (s.length !== 8) return ymdToday();
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6)) - 1;
  const d = Number(s.slice(6, 8));
  const dt = new Date(y, m, d + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

function normYmd(v: unknown): string {
  return String(v ?? "").replace(/-/g, "");
}

function srchLgstGrpCd(filters: Record<string, unknown>): string {
  return String(
    filters.SRCH_LGST_GRP_CD ?? filters.LGST_GRP_CD ?? "",
  ).trim();
}

interface Args {
  model: FuelEfficiencyModel;
}

export function useFuelEfficiencyController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();
  const { resetGrids, searchSub, requireParentRow } = base;

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const fetchSub01 = useCallback(
    (mainRow: any) => {
      if (!mainRow?.FE_ID) return EMPTY_RESULT;
      const filters = model.filtersRef.current ?? {};
      return api.getLgstList({
        FE_ID: mainRow.FE_ID,
        LGST_GRP_CD: srchLgstGrpCd(filters),
      });
    },
    [model.filtersRef],
  );

  const fetchSub02 = useCallback(
    (sub01Row: any) => {
      const main = model.grids.main.selectedRef.current;
      if (!main?.FE_ID || !sub01Row?.LGST_GRP_CD) return EMPTY_RESULT;
      return api.getVehTpList({
        FE_ID: main.FE_ID,
        LGST_GRP_CD: sub01Row.LGST_GRP_CD,
      });
    }, [model.grids.main]);

  const cascadeFromSub01 = useCallback(
    async (row: any) => {
      model.grids.sub01.setSelected(row);
      resetGrids(["sub02"]);
      if (!row) return;
      await searchSub("sub02", fetchSub02(row));
    },
    [model.grids.sub01, resetGrids, searchSub, fetchSub02],
  );

  const cascadeFromMain = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      resetGrids(["sub01", "sub02"]);
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
      resetGrids(["sub01", "sub02"]);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;
      if (firstMain) {
        onMainGridClick(firstMain);
      }
    },
    [model.grids.main, resetGrids, onMainGridClick],
  );

  const validateMainRows = useCallback(() => {
    for (const row of model.grids.main.rows) {
      if (
        row.EDIT_STS !== ROW_STATUS.INSERT &&
        row.EDIT_STS !== ROW_STATUS.UPDATE
      ) {
        continue;
      }
      const from = normYmd(row.FRM_DTTM);
      const to = normYmd(row.TO_DTTM);
      if (from && to && from > to) {
        base.alert(
          Lang.get("MSG_VALID_RANGE_CHK", Lang.get("LBL_FROM_DATE"), Lang.get("LBL_TO_DATE")),
        );
        return false;
      }
    }
    return true;
  }, [base, model.grids.main.rows]);

  const onAddMain = useCallback(() => {
    const today = ymdToday();
    base.addRow("main", {
      FE_ID: `FE_${today}`,
      FRM_DTTM: today,
      TO_DTTM: ymdAddDays(today, 1),
    });
    const added = model.grids.main.selectedRef.current;
    if (added) void cascadeFromMain(added);
  }, [base, model.grids.main, cascadeFromMain]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        beforeSave: validateMainRows,
        afterSave: "refresh",
      }),
    [base, validateMainRows],
  );

  const onCopyFe = useCallback(() => {
    const selected = model.grids.main.selectedRef.current;
    if (!selected?.FE_ID) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    const today = ymdToday();
    openPopup({
      title: "MENU_FUEL_EFFICIENCY_MGMT",
      width: "sm",
      content: (
        <FuelEfficiencyPop
          defaultFeId={`FE_${today}`}
          defaultFrmDttm={today}
          defaultToDttm=""
          onClose={closePopup}
          onApply={(values) => {
            closePopup();
            void base.callAjax(
              api.addCopy({
                COPY_FE_ID: selected.FE_ID,
                FE_ID: values.FE_ID,
                FRM_DTTM: values.FRM_DTTM,
                TO_DTTM: values.TO_DTTM,
              }),
            ).then(() => base.search());
          }}
        />
      ),
    });
  }, [base, model.grids.main, openPopup, closePopup]);

  const onAddVehTp = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    const sub01 = model.grids.sub01.selectedRef.current;
    if (!requireParentRow(main, Lang.get("LBL_FUEL_EFFICIENCY_ID"))) return;
    if (!requireParentRow(sub01, Lang.get("LBL_LOGISTICS_GROUP_CODE"))) return;

    openPopup({
      title: "LBL_VEHICLE_TYPE_CODE",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectVehTpNotexistFe"
          rowSelection="multiple"
          extraParams={{
            keyParam: String(main.FE_ID ?? ""),
            sqlParam1: String(sub01.LGST_GRP_CD ?? ""),
          }}
          onClose={closePopup}
          onApply={(picked: any) => {
            closePopup();
            const items = Array.isArray(picked) ? picked : [picked];
            const existing = new Set(
              (model.grids.sub02.rows ?? []).map((r: any) =>
                String(r.VEH_TP_CD ?? ""),
              ),
            );
            for (const item of items) {
              const code = String(item.CODE ?? "");
              if (!code || existing.has(code)) continue;
              existing.add(code);
              base.addRow("sub02", {
                FE_ID: main.FE_ID,
                LGST_GRP_CD: sub01.LGST_GRP_CD,
                VEH_TP_CD: code,
                VEH_TP_NM: item.NAME ?? "",
                FUEL_EFFICIENCY: 0.1,
              });
            }
          }}
        />
      ),
    });
  }, [base, model.grids, requireParentRow, openPopup, closePopup]);

  const onSaveSub02 = useCallback(
    () =>
      base.saveGrid("sub02", api.saveVehTp, {
        afterSave: {
          cascadeFrom: "sub01",
          fetch: fetchSub02,
        },
      }),
    [base, fetchSub02],
  );

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
        type: "button",
        key: "LBL_COPY",
        label: "LBL_COPY",
        onClick: onCopyFe,
      },
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      mainExcelDown,
    ],
    [onCopyFe, onAddMain, onSaveMain, mainExcelDown],
  );

  const subActions = useMemo(
    () => ({
      sub01: [
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
        makeAddAction({ onClick: onAddVehTp }),
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
    }),
    [
      fetchSub01,
      fetchSub02,
      model.grids.main,
      model.grids.sub01,
      model.grids.sub02.rows,
      onAddVehTp,
      onSaveSub02,
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
