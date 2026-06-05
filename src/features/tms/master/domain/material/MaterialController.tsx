import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { materialApi as api } from "./MaterialApi";
import { MENU_CD } from "./materialMenu";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./MaterialColumns";
import type { MaterialModel, GridKey } from "./MaterialModel";

const masterParam = (row: any) => ({
  SALES_ORG_CD: row?.SALES_ORG_CD,
  ITEM_CD: row?.ITEM_CD,
});

interface Args {
  model: MaterialModel;
}

export function useMaterialController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { handleRowClick, resetGrids } = base;

  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      resetGrids(["sub01", "sub02"]);
      return api.getList(MENU_CD, params);
    },
    [resetGrids],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      handleRowClick("main", row, [
        {
          to: "sub02",
          fetch: (r) => api.getUomList(MENU_CD, masterParam(r)),
        },
        {
          to: "sub01",
          fetch: (r) => api.getDetailList(MENU_CD, masterParam(r)),
        },
      ]),
    [handleRowClick],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: "품목관리",
        fetchFn: () => api.getList(MENU_CD, model.filtersRef.current ?? {}),
        rows: model.grids.main.rows,
      }),
    ],
    [model.filtersRef, model.grids.main.rows],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: SUB02_COLUMN_DEFS,
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: "품목관리-단위환산",
        fetchFn: () => {
          const parent = model.grids.main.selectedRef.current;
          return parent
            ? api.getUomList(MENU_CD, masterParam(parent))
            : Promise.resolve({ data: { data: { dsOut: [] } } });
        },
        rows: model.grids.sub02.rows,
      }),
    ],
    [model.grids.main.selectedRef, model.grids.sub02.rows],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: SUB01_COLUMN_DEFS,
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: "품목관리-판매처",
        fetchFn: () => {
          const parent = model.grids.main.selectedRef.current;
          return parent
            ? api.getDetailList(MENU_CD, masterParam(parent))
            : Promise.resolve({ data: { data: { dsOut: [] } } });
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [model.grids.main.selectedRef, model.grids.sub01.rows],
  );

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    mainActions,
    sub01Actions,
    sub02Actions,
  };
}
