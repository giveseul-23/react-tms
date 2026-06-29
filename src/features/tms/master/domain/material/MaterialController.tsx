import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { materialApi as api } from "./MaterialApi";
import { MENU_CD } from "./Material";
import type { MaterialModel, GridKey } from "./MaterialModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

const masterParam = (row: any) => ({
  SALES_ORG_CD: row?.SALES_ORG_CD,
  ITEM_CD: row?.ITEM_CD,
});

interface Args {
  model: MaterialModel;
}

export function useMaterialController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
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
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => api.getList(MENU_CD, model.filtersRef.current ?? {}),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.filtersRef, model.grids.main],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => {
          const parent = model.grids.main.selectedRef.current;
          return parent
            ? api.getUomList(MENU_CD, masterParam(parent))
            : Promise.resolve({ data: { data: { dsOut: [] } } });
        },
        rows: () => model.grids.sub02.rows,
      }),
    ],
    [menuName, model.grids.main.selectedRef, model.grids.sub02],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => {
          const parent = model.grids.main.selectedRef.current;
          return parent
            ? api.getDetailList(MENU_CD, masterParam(parent))
            : Promise.resolve({ data: { data: { dsOut: [] } } });
        },
        rows: () => model.grids.sub01.rows,
      }),
    ],
    [menuName, model.grids.main.selectedRef, model.grids.sub01],
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
