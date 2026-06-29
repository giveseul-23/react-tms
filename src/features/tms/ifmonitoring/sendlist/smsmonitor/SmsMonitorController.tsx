import { useCallback, useMemo } from "react";
import { smsMonitorApi as api } from "./SmsMonitorApi";
import { MENU_CODE } from "./SmsMonitor";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { SmsMonitorModel } from "./SmsMonitorModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: SmsMonitorModel;
}

export function useSmsMonitorController({ model }: Args) {
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(() => {}, []);

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
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [model, menuName],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
