import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { rateApi as api } from "./RateApi";
import { MENU_CODE } from "./Rate";
import { makeCommonActions } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { RateModel, GridKey } from "./RateModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: RateModel;
}

export function useRateController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onCostInfoRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("costInfo", row, [
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
      ]),
    [base],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["costInfo", "conditionInfo"]);
      if (!row) return;
      const costRows = await base.searchSub(
        "costInfo",
        api.getCostInfoList({
          TRF_CD: row.TRF_CD,
          CHG_CD: row.CHG_CD,
          SUBCHG_CD: row.SUBCHG_CD,
        }),
      );
      if (costRows[0]) onCostInfoRowClicked(costRows[0]);
    },
    [model, base, onCostInfoRowClicked],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const mainActions: ActionItem[] = useMemo(
    () =>
      makeCommonActions({
        add: true,
        save: true,
        excel: {
          excelColumns: () => model.grids.main.getExcelColumns(),
          menuCode: MENU_CODE,
          menuName: menuName,
          fetchFn: () => api.getList(model.filtersRef.current),
          rows: model.grids.main.rows,
        },
      }),
    [model],
  );

  const detailActions: ActionItem[] = useMemo(
    () =>
      makeCommonActions({
        add: true,
        save: {
          onClick: () =>
            api
              .save({ dsSave: model.grids.costInfo.ref.current?.rows ?? [] })
              .then(() => base.search()),
        },
        excel: {
          excelColumns: () => model.grids.costInfo.getExcelColumns(),
          menuCode: MENU_CODE,
          menuName: menuName,
          fetchFn: () => api.getCostInfoList(model.filtersRef.current),
          rows: model.grids.costInfo.rows,
        },
      }),
    [model, base],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onCostInfoRowClicked,
    mainActions,
    detailActions,
  };
}
