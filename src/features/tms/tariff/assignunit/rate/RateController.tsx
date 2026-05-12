import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { rateApi as api } from "./RateApi";
import { MAIN_COLUMN_DEFS } from "./RateColumns";
import { makeCommonActions } from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { RateModel, GridKey } from "./RateModel";

interface Args {
  model: RateModel;
}

export function useRateController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

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

  const handleSearch = useCallback(
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
          columns: MAIN_COLUMN_DEFS(),
          menuName: "운임관리",
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
          columns: MAIN_COLUMN_DEFS(),
          menuName: "운임관리-상세",
          fetchFn: () => api.getCostInfoList(model.filtersRef.current),
          rows: model.grids.costInfo.rows,
        },
      }),
    [model, base],
  );

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    onCostInfoRowClicked,
    mainActions,
    detailActions,
  };
}
