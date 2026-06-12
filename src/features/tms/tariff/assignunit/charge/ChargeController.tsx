import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { chargeApi as api } from "./ChargeApi";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ChargeModel, GridKey } from "./ChargeModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import ChargeAddPopup from "@/features/tms/tariff/popup/ChargeAddPopup";
import { MENU_CODE } from "./Charge";

interface Args {
  model: ChargeModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useChargeController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      if (row?.EDIT_STS === "I") {
        model.grids.main.setSelected(row);
        base.resetGrids(["sub01"]);
        return;
      }
      return base.handleRowClick("main", row, [
        {
          to: "sub01",
          fetch: (r) =>
            api.getCalcformulList({ TRF_CD: r.TRF_CD, CHG_CD: r.CHG_CD }),
        },
      ]);
    },
    [base, model.grids.main],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const checkSupersedeBeforeSave = useCallback((): boolean => {
    const rows = model.grids.main.rows ?? [];
    const modified = rows.filter(
      (r: any) => r.EDIT_STS === "I" || r.EDIT_STS === "U",
    );
    for (const row of modified) {
      const yn = row.SUPERSEDE_YN;
      const tp = row.SUPERSEDE_TP;
      if (
        (yn === "Y" || yn === true) &&
        (tp == null || String(tp).trim() === "")
      ) {
        base.alert(Lang.get("MSG_SUPERSEDE_CHECK"), Lang.get("TTL_ALERT"));
        return false;
      }
    }
    return true;
  }, [model.grids.main, base]);

  const onAddMain = useCallback(() => {
    const f = model.rawFiltersRef.current ?? {};
    const lgstGrpCd = f.SRCH_TRF_LGST_GRP_CD ?? "";
    const divCd = f.SRCH_TRF_DIV_CD ?? "";
    if (!lgstGrpCd) {
      base.alert(
        Lang.get("MSG_LOGISTICSGROUP_SELECT_CHK"),
        Lang.get("TTL_ALERT"),
      );
      return;
    }
    base.resetGrids(["sub01"]);
    openPopup({
      title: "BTN_CHG_ADD",
      width: "4xl",
      content: (
        <ChargeAddPopup
          menuCode={MENU_CODE}
          divCd={divCd}
          lgstGrpCd={lgstGrpCd}
          onClose={closePopup}
          onApply={(picked) => {
            closePopup();
            const items = Array.isArray(picked) ? picked : [picked];
            items.forEach((item) => {
              base.addRow("main", {
                DIV_CD: item.DIV_CD,
                DIV_NM: item.DIV_NM,
                LGST_GRP_CD: item.LGST_GRP_CD,
                LGST_GRP_NM: item.LGST_GRP_NM,
                TRF_CD: item.TRF_CD,
                TRF_NM: item.TRF_NM,
                SUPERSEDE_YN: "N",
                RDNG_RCD: "0300",
                USE_YN: "Y",
              });
            });
          }}
        />
      ),
    });
  }, [model.rawFiltersRef, base, openPopup, closePopup]);

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_ALERT"));
      return;
    }
    openPopup({
      title: "LBL_SERVICE_CD",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectTariffSubchgCodeName"
          rowSelection="multiple"
          extraParams={{
            param1: main.TRF_CD,
            param2: main.CHG_CD,
          }}
          onApply={(picked: any) => {
            closePopup();
            const list = Array.isArray(picked) ? picked : [picked];
            const existing = new Set(
              (model.grids.sub01.rows ?? []).map((r: any) => r.SUBCHG_CD),
            );
            list
              .filter((p: any) => p.CODE && !existing.has(p.CODE))
              .forEach((p: any) => {
                base.addRow("sub01", {
                  TRF_CD: main.TRF_CD,
                  CHG_CD: main.CHG_CD,
                  SUBCHG_CD: p.CODE,
                  SUBCHG_NM: p.NAME,
                  CALC_RNK: 1,
                });
              });
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [model.grids.main, model.grids.sub01, base, openPopup, closePopup]);

  const fetchSub01 = useCallback(
    (row: any) =>
      api.getCalcformulList({ TRF_CD: row.TRF_CD, CHG_CD: row.CHG_CD }),
    [],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("main", api.save, {
            beforeSave: checkSupersedeBeforeSave,
          }),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [
      onAddMain,
      checkSupersedeBeforeSave,
      base,
      menuName,
      model.filtersRef,
      model.grids.main,
    ],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub01 }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("sub01", api.saveCalcformul, {
            afterSave: {
              cascadeFrom: "main",
              fetch: (m: any) => fetchSub01(m),
            },
          }),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub01(main) : EMPTY_RESULT;
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [
      onAddSub01,
      base,
      menuName,
      model.grids.sub01,
      model.grids.main.selectedRef,
      fetchSub01,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    sub01Actions,
  };
}
