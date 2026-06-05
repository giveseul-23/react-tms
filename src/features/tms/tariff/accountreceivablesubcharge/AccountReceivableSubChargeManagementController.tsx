import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { accountReceivableSubChargeManagementApi as api } from "./AccountReceivableSubChargeManagementApi";
import { MENU_CODE } from "./AccountReceivableSubChargeManagement";
import { makeCommonActions } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { AccountReceivableSubChargeManagementModel, GridKey } from "./AccountReceivableSubChargeManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: AccountReceivableSubChargeManagementModel;
}

export function useAccountReceivableSubChargeManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // detail01 클릭 → detail02 cascade
  const onDetail01RowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("detail01", row, [
        {
          to: "detail02",
          fetch: (r) =>
            api.getDetail02List({
              AR_TRF_CD: r.AR_TRF_CD,
              AR_CHG_CD: r.AR_CHG_CD,
              AR_SUBCHG_CD: r.AR_SUBCHG_CD,
              COST_CD: r.COST_CD,
            }),
        },
      ]),
    [base],
  );

  // main 클릭 → detail01 cascade + detail01 첫 행 → detail02
  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["detail01", "detail02"]);
      if (!row) return;
      const detail01Rows = await base.searchSub(
        "detail01",
        api.getDetail01List({
          AR_TRF_CD: row.AR_TRF_CD,
          AR_CHG_CD: row.AR_CHG_CD,
          AR_SUBCHG_CD: row.AR_SUBCHG_CD,
        }),
      );
      if (detail01Rows[0]) onDetail01RowClicked(detail01Rows[0]);
    },
    [model, base, onDetail01RowClicked],
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
              .save({ dsSave: model.grids.detail01.ref.current?.rows ?? [] })
              .then(() => base.search()),
        },
        excel: {
          excelColumns: () => model.grids.detail01.getExcelColumns(),
          menuCode: MENU_CODE,
          menuName: menuName,
          fetchFn: () => api.getDetail01List(model.filtersRef.current),
          rows: model.grids.detail01.rows,
        },
      }),
    [model, base],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onDetail01RowClicked,
    mainActions,
    detailActions,
  };
}
