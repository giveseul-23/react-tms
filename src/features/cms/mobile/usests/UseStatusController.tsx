import { useCallback, useMemo } from "react";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { Lang } from "@/app/services/common/Lang";
import { useStatusApi as api } from "./UseStatusApi";
import type { UseStatusModel } from "./UseStatusModel";
import { CARRIER_COLUMN_DEFS, MAIN_COLUMN_DEFS } from "./UseStatusColumns";

type Args = {
  model: UseStatusModel;
};

function rowsFromResponse(res: any) {
  return res?.data?.result ?? res?.data?.data?.dsOut ?? res?.data?.data ?? [];
}

function toGridData(rows: any[]) {
  return {
    rows,
    totalCount:
      rows[0]?.TOTALCOUNT != null ? Number(rows[0].TOTALCOUNT) : rows.length,
    page: 1,
    limit: rows.length || 20,
  };
}

function countByStatus(rows: any[]) {
  const counts = {
    mbl_sts1: 0,
    mbl_sts2: 0,
    mbl_sts3: 0,
    mbl_sts4: 0,
  };

  rows.forEach((row) => {
    const key = String(row?.MBL_STS ?? "");
    if (key in counts) {
      counts[key as keyof typeof counts] += 1;
    }
  });

  return counts;
}

export function useUseStatusController({ model }: Args) {
  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const [mainRes, carrierRes] = await Promise.all([
        api.getMainList(params),
        api.getCarrierList(params),
      ]);

      const mainRows = rowsFromResponse(mainRes);
      const carrierRows = rowsFromResponse(carrierRes);

      model.grids.carrier.setData(toGridData(carrierRows));
      model.grids.carrier.setSelected(null);
      model.grids.filter.setData(toGridData([]));
      model.grids.filter.setSelected(null);
      model.setShowFilterPanel(false);
      model.setFilterTitle("LBL_FILTER_VEH");

      const mainCounts = countByStatus(mainRows);
      const carrierCounts = countByStatus(carrierRows);

      model.setStatusChartData([
        {
          categoryKey: "dedi",
          categoryName: Lang.get("LBL_DEDICATED_VEH"),
          ...mainCounts,
        },
        {
          categoryKey: "con",
          categoryName: Lang.get("LBL_CONTRACTED_VEHICLE"),
          ...carrierCounts,
        },
      ]);

      return mainRes;
    },
    [model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
    },
    [model.grids.main],
  );

  const handleChartBarClick = useCallback(
    (categoryKey: "dedi" | "con", statusKey: string, statusLabel: string) => {
      const sourceRows =
        categoryKey === "dedi" ? model.grids.main.rows : model.grids.carrier.rows;
      const filtered = sourceRows.filter((row: any) => row?.MBL_STS === statusKey);

      model.grids.filter.setData(toGridData(filtered));
      model.grids.filter.setSelected(null);
      model.setFilterTitle(statusLabel);
      model.setShowFilterPanel(filtered.length > 0);
    },
    [model],
  );

  const handleCloseFilter = useCallback(() => {
    model.grids.filter.setData(toGridData([]));
    model.grids.filter.setSelected(null);
    model.setShowFilterPanel(false);
    model.setFilterTitle("LBL_FILTER_VEH");
  }, [model]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuCode: "MENU_USE_STATUS",
        fetchFn: () => api.getMainList(model.filtersRef.current ?? {}),
        rows: model.grids.main.rows,
      }),
    ],
    [model.filtersRef, model.grids.main.rows],
  );

  const carrierActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: CARRIER_COLUMN_DEFS,
        menuCode: "MENU_USE_STATUS",
        fetchFn: () => api.getCarrierList(model.filtersRef.current ?? {}),
        rows: model.grids.carrier.rows,
      }),
    ],
    [model.filtersRef, model.grids.carrier.rows],
  );
  return {
    fetchList,
    onSearchCallback,
    handleChartBarClick,
    handleCloseFilter,
    mainActions,
    carrierActions,
  };
}
