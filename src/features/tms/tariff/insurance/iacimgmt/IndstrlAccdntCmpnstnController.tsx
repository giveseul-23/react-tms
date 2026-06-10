import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { indstrlAccdntCmpnstnApi as api } from "./IndstrlAccdntCmpnstnApi";
import { MENU_CODE } from "./IndstrlAccdntCmpnstn";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  IndstrlAccdntCmpnstnModel,
  GridKey,
} from "./IndstrlAccdntCmpnstnModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { Lang } from "@/app/services/common/Lang";
import IaciCreatePop from "./popup/IaciCreatePop";

interface Args {
  model: IndstrlAccdntCmpnstnModel;
}

const stripSep = (v: any) => String(v ?? "").replace(/[\s\-:/T]/g, "");
const todayCompact = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

export function useIndstrlAccdntCmpnstnController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onRateRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("rate", row, [
        {
          to: "chg",
          fetch: (r) =>
            api.getChgList({ INSRNC_ID: r.INSRNC_ID, AP_PROC_TP: r.AP_PROC_TP }),
        },
      ]),
    [base],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["rate", "chg"]);
      if (!row) return;
      const rateRows = await base.searchSub(
        "rate",
        api.getRateList({ DIV_CD: row.DIV_CD, LGST_GRP_CD: row.LGST_GRP_CD }),
      );
      if (rateRows[0]) onRateRowClicked(rateRows[0]);
    },
    [model, base, onRateRowClicked],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 보험료 일괄 등록 (월대 20 / 용차·회당 10) ──────────────
  const onCreateBatch = useCallback(
    (e: any, apProcTp: "10" | "20", chgSqlProp: string, title: string) => {
      const rows = e?.data ?? [];
      if (rows.length === 0) {
        base.alert(Lang.get("MSG_LOGISTICSGROUP_SELECT_CHK"), Lang.get("TTL_ERR"));
        return;
      }
      openPopup({
        title: title,
        width: "lg",
        content: (
          <IaciCreatePop
            apProcTp={apProcTp}
            chgSqlProp={chgSqlProp}
            onConfirm={(params) => {
              closePopup();
              const saveRows = rows.map((r: any) => ({ ...r, ...params, rowStatus: "I" }));
              base.callAjax(api.saveBatch(saveRows)).then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, openPopup, closePopup],
  );

  // ── rate(sub01) 추가/저장 ──────────────────────────────────
  const onAddRate = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    base.addRow("rate", {
      DIV_CD: main.DIV_CD,
      LGST_GRP_CD: main.LGST_GRP_CD,
      LGST_GRP_NM: main.LGST_GRP_NM,
      DEDUCTION_RATE: 0.303,
      INSURANCE_RATE: 0.018,
      RDNG_RCD1: "9999",
      EXTRA_RATE1: 1,
      SPPT_RATE: 0.5,
      BUD_RATE: 0.5,
      EXTRA_RATE2: 1,
      RDNG_RCD2: "0300",
    });
  }, [model.grids.main, base]);

  const onSaveRate = useCallback(
    () =>
      base.saveGrid("rate", api.saveRate, {
        beforeSave: () => {
          const rows = model.grids.rate.rows ?? [];
          if (
            rows.some(
              (r: any) =>
                r.EDIT_STS === "I" &&
                r.FRM_DTTM &&
                r.TO_DTTM &&
                stripSep(r.FRM_DTTM) > stripSep(r.TO_DTTM),
            )
          ) {
            base.alert(Lang.get("MSG_INPUT_DATE_VALIDATION"), Lang.get("TTL_ERR"));
            return false;
          }
          if (
            rows.some(
              (r: any) =>
                (r.EDIT_STS === "D" || r.delStatus === true) &&
                r.FRM_DTTM &&
                stripSep(r.FRM_DTTM) < todayCompact(),
            )
          ) {
            base.alert(
              Lang.get("MSG_TEMP_OIL_PRICE_DELETE_VALIDATION"),
              Lang.get("TTL_ERR"),
            );
            return false;
          }
          return true;
        },
        afterSave: {
          cascadeFrom: "main",
          fetch: (m: any) =>
            api.getRateList({ DIV_CD: m.DIV_CD, LGST_GRP_CD: m.LGST_GRP_CD }),
        },
      }),
    [base, model.grids.rate],
  );

  // ── chg(sub02) 추가/저장 ───────────────────────────────────
  const onAddChg = useCallback(() => {
    const rate = model.grids.rate.selectedRef.current;
    if (!rate) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    const sqlId =
      rate.AP_PROC_TP === "20" ? "selectIaciChgDfCodeName" : "selectIaciChgCodeName";
    openPopup({
      title: "LBL_AP_CTG",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId={sqlId}
          extraParams={{ keyParam: rate.LGST_GRP_CD }}
          rowSelection="multiple"
          onApply={(picked: any) => {
            closePopup();
            const list = Array.isArray(picked) ? picked : [picked];
            const existing = new Set(
              (model.grids.chg.rows ?? [])
                .filter((r: any) => r.EDIT_STS === "I")
                .map((r: any) => r.CHG_CD),
            );
            base.addRow(
              "chg",
              list
                .filter((p: any) => !existing.has(p.CODE))
                .map((p: any) => ({
                  INSRNC_ID: rate.INSRNC_ID,
                  CHG_CD: p.CODE,
                  CHG_NM: p.NAME,
                })),
            );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [model.grids.rate, model.grids.chg, base, openPopup, closePopup]);

  const onSaveChg = useCallback(
    () =>
      base.saveGrid("chg", api.saveChg, {
        afterSave: {
          cascadeFrom: "rate",
          fetch: (r: any) =>
            api.getChgList({ INSRNC_ID: r.INSRNC_ID, AP_PROC_TP: r.AP_PROC_TP }),
        },
      }),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_DF_CREATE",
        label: "BTN_DF_CREATE",
        onClick: (e: any) =>
          onCreateBatch(e, "20", "selectIaciDfChgPop", "BTN_DF_CREATE"),
      },
      {
        type: "button",
        key: "BTN_TEMP_AP_CREATE",
        label: "BTN_TEMP_AP_CREATE",
        onClick: (e: any) =>
          onCreateBatch(e, "10", "selectIaciChgPop", "BTN_TEMP_AP_CREATE"),
      },
    ],
    [onCreateBatch],
  );

  const rateActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddRate }),
      makeSaveAction({ onClick: onSaveRate }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.rate.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getRateList(model.filtersRef.current),
        rows: model.grids.rate.rows,
      }),
    ],
    [onAddRate, onSaveRate, menuName, model.filtersRef, model.grids.rate],
  );

  const chgActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddChg }),
      makeSaveAction({ onClick: onSaveChg }),
    ],
    [onAddChg, onSaveChg],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onRateRowClicked,
    mainActions,
    rateActions,
    chgActions,
  };
}
