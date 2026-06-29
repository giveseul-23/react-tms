import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { ifCstDistApi as api } from "./IfCstDistApi";
import { MENU_CODE } from "./IfCstDist";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { GridKey, IfCstDistModel } from "./IfCstDistModel";

interface Args {
  model: IfCstDistModel;
}

const buildSubParams = (row: any) => ({
  IF_ID: row.IF_ID,
  CRE_DTTM: row.CRE_DTTM,
});

export function useIfCstDistController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      if (!row || String(row.rowStatus ?? "").trim() === "I") {
        return;
      }
      base.handleRowClick("main", row, [
        {
          to: "sub01",
          fetch: (r) => api.searchDtl(buildSubParams(r)),
        },
      ]);
    },
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      base.resetGrids(["sub01"]);
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [base, model.grids.main, onMainGridClick],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
