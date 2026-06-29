import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { rateApi as api } from "./RateApi";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { RateModel, GridKey } from "./RateModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import ChargeAddPopup from "@/features/tms/tariff/popup/ChargeAddPopup";
import { MENU_CODE } from "./Rate";

interface Args {
  model: RateModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

const nextSeq = (rows: any[], field: string) => {
  let max = 0;
  (rows ?? []).forEach((r) => {
    const n = Number(r[field]);
    if (!Number.isNaN(n) && n > max) max = n;
  });
  return max + 1;
};

export function useRateController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const fetchCostInfo = useCallback(
    (row: any) =>
      api.getCostInfoList({
        TRF_CD: row.TRF_CD,
        CHG_CD: row.CHG_CD,
        SUBCHG_CD: row.SUBCHG_CD,
      }),
    [],
  );

  const fetchConditionInfo = useCallback((row: any) => {
    return api.getConditionInfoList({
      TRF_CD: row.TRF_CD,
      CHG_CD: row.CHG_CD,
      SUBCHG_CD: row.SUBCHG_CD,
      COST_CD: row.COST_CD,
    });
  }, []);

  const onCostInfoRowClicked = useCallback(
    (row: any) => {
      if (row?.EDIT_STS === "I") {
        model.grids.costInfo.setSelected(row);
        base.resetGrids(["conditionInfo"]);
        return;
      }
      return base.handleRowClick("costInfo", row, [
        {
          to: "conditionInfo",
          fetch: (r) => fetchConditionInfo(r),
        },
      ]);
    },
    [base, model.grids.costInfo, fetchConditionInfo],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["costInfo", "conditionInfo"]);
      if (!row || row.EDIT_STS === "I") return;
      const costRows = await base.searchSub("costInfo", fetchCostInfo(row));
      if (costRows[0]) onCostInfoRowClicked(costRows[0]);
    },
    [model.grids.main, base, fetchCostInfo, onCostInfoRowClicked],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

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
    base.resetGrids(["costInfo", "conditionInfo"]);
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
                USE_YN: "Y",
              });
            });
          }}
        />
      ),
    });
  }, [model.rawFiltersRef, base, openPopup, closePopup]);

  const onAddCost = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_ALERT"));
      return;
    }
    base.resetGrids(["conditionInfo"]);
    base.addRow("costInfo", {
      SEQ: 0,
      TRF_CD: main.TRF_CD,
      CHG_CD: main.CHG_CD,
      SUBCHG_CD: main.SUBCHG_CD,
      OPR: "*",
      COST: 0,
      ADJ_RT: 1,
    });
  }, [model.grids.main, base]);

  const onAddCondition = useCallback(() => {
    const cost = model.grids.costInfo.selectedRef.current;
    if (!cost) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_ALERT"));
      return;
    }
    base.addRow("conditionInfo", {
      TRF_CD: cost.TRF_CD,
      CHG_CD: cost.CHG_CD,
      SUBCHG_CD: cost.SUBCHG_CD,
      COST_CD: cost.COST_CD,
      LGC_OPR: "AND",
      OPR: "=",
      SEQ: nextSeq(model.grids.conditionInfo.rows ?? [], "SEQ"),
    });
  }, [model.grids.costInfo, model.grids.conditionInfo, base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({
        onClick: () => base.saveGrid("main", api.save),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [onAddMain, base, menuName, model.filtersRef, model.grids.main],
  );

  const costInfoActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddCost }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("costInfo", api.saveCostInfo, {
            afterSave: {
              cascadeFrom: "main",
              fetch: (m: any) => fetchCostInfo(m),
            },
          }),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.costInfo.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchCostInfo(main) : EMPTY_RESULT;
        },
        rows: () => model.grids.costInfo.rows,
      }),
    ],
    [
      onAddCost,
      base,
      menuName,
      model.grids.costInfo,
      model.grids.main.selectedRef,
      fetchCostInfo,
    ],
  );

  const conditionInfoActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddCondition }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("conditionInfo", api.saveConditionInfo, {
            afterSave: {
              cascadeFrom: "costInfo",
              fetch: (c: any) => fetchConditionInfo(c),
            },
          }),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.conditionInfo.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const cost = model.grids.costInfo.selectedRef.current;
          return cost ? fetchConditionInfo(cost) : EMPTY_RESULT;
        },
        rows: () => model.grids.conditionInfo.rows,
      }),
    ],
    [
      onAddCondition,
      base,
      menuName,
      model.grids.conditionInfo,
      model.grids.costInfo.selectedRef,
      fetchConditionInfo,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onCostInfoRowClicked,
    mainActions,
    costInfoActions,
    conditionInfoActions,
  };
}
