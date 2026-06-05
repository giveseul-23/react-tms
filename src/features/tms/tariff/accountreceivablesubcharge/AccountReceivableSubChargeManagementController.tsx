import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { accountReceivableSubChargeManagementApi as api } from "./AccountReceivableSubChargeManagementApi";
import { MAIN_COLUMN_DEFS } from "./AccountReceivableSubChargeManagementColumns";
import { MENU_CODE } from "./AccountReceivableSubChargeManagement";
import { makeCommonActions } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { AccountReceivableSubChargeManagementModel, GridKey } from "./AccountReceivableSubChargeManagementModel";

interface Args {
  model: AccountReceivableSubChargeManagementModel;
}

export function useAccountReceivableSubChargeManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

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
          columns: MAIN_COLUMN_DEFS(),
          excelColumns: () => model.grids.main.getExcelColumns(),
          menuCode: MENU_CODE,
          menuName: "운영자매출계약-부가요금관리",
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
          columns: MAIN_COLUMN_DEFS(),
          excelColumns: () => model.grids.detail01.getExcelColumns(),
          menuCode: MENU_CODE,
          menuName: "운영자매출계약-부가요금관리-상세",
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
