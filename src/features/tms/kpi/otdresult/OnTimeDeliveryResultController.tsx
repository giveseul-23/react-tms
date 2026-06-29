import { useCallback, useMemo } from "react";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { onTimeDeliveryResultApi as api } from "./OnTimeDeliveryResultApi";
import { MENU_CODE } from "./OnTimeDeliveryResult";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { OnTimeDeliveryResultModel } from "./OnTimeDeliveryResultModel";

interface Args {
  model: OnTimeDeliveryResultModel;
}

// 납기준수실적 — 조회 전용 단일 그리드 (저장/추가 없음)
export function useOnTimeDeliveryResultController({ model }: Args) {
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
    },
    [model.grids.main],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.filtersRef, model.grids.main],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
