import { useCallback, useMemo } from "react";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { useBaseController } from "@/app/feature/useBaseController";
import { commodityApi as api } from "@/features/tms/master/domain/commodity/CommodityApi";
import { MENU_CD } from "@/features/tms/master/domain/commodity/Commodity";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  CommodityModel,
  GridKey,
} from "@/features/tms/master/domain/commodity/CommodityModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: CommodityModel;
}

export function useCommodityController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getCommodityList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const onAddMain = useCallback(() => {
    base.addRow("main", {});
  }, [base]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.saveCommodityList, {
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => api.getCommodityList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, menuName, model.grids.main, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
