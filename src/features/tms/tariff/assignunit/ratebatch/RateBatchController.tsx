import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { rateBatchApi as api } from "./RateBatchApi";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { RateBatchModel, GridKey } from "./RateBatchModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import ChargeAddPopup from "@/features/tms/tariff/popup/ChargeAddPopup";
import { MENU_CODE } from "./RateBatch";

interface Args {
  model: RateBatchModel;
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

export function useRateBatchController({ model }: Args) {
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
        base.resetGrids(["conditionInfo"]);
        return;
      }
      return base.handleRowClick("main", row, [
        {
          to: "conditionInfo",
          fetch: (r) =>
            api.getConditionInfoList({
              TRF_CD: r.TRF_CD,
              CHG_CD: r.CHG_CD,
              SUBCHG_CD: r.SUBCHG_CD,
              COST_CD: r.COST_CD,
            }),
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
    base.resetGrids(["conditionInfo"]);
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
                MIN_COST: 0,
                MAX_COST: 999999999,
                BSE_COST: 0,
                OPR: "*",
                ADJ_RT: 1,
                COST: 0,
                ACCM_SUM_YN: "N",
                USE_YN: "Y",
              });
            });
          }}
        />
      ),
    });
  }, [model.rawFiltersRef, base, openPopup, closePopup]);

  const onAddCondition = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_ALERT"));
      return;
    }
    base.addRow("conditionInfo", {
      TRF_CD: main.TRF_CD,
      CHG_CD: main.CHG_CD,
      SUBCHG_CD: main.SUBCHG_CD,
      COST_CD: main.COST_CD,
      SEQ: nextSeq(model.grids.conditionInfo.rows ?? [], "SEQ"),
      LGC_OPR: "AND",
      OPR: "=",
    });
  }, [model.grids.main, model.grids.conditionInfo, base]);

  const fetchCondition = useCallback(
    (row: any) =>
      api.getConditionInfoList({
        TRF_CD: row.TRF_CD,
        CHG_CD: row.CHG_CD,
        SUBCHG_CD: row.SUBCHG_CD,
        COST_CD: row.COST_CD,
      }),
    [],
  );

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

  const conditionActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddCondition }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("conditionInfo", api.saveConditionInfo, {
            afterSave: {
              cascadeFrom: "main",
              fetch: (m: any) => fetchCondition(m),
            },
          }),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.conditionInfo.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchCondition(main) : EMPTY_RESULT;
        },
        rows: () => model.grids.conditionInfo.rows,
      }),
    ],
    [
      onAddCondition,
      base,
      menuName,
      model.grids.conditionInfo,
      model.grids.main.selectedRef,
      fetchCondition,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    conditionActions,
  };
}
