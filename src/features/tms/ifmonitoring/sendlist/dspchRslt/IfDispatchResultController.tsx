import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { ifDispatchResultApi as api } from "./IfDispatchResultApi";
import { MENU_CODE } from "./IfDispatchResult";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { IfDispatchResultModel, GridKey } from "./IfDispatchResultModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: IfDispatchResultModel;
}

export function useIfDispatchResultController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      api.getList({ userTz: "Asia/Seoul", ...params }),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_REPRO",
        label: "BTN_REPRO",
        onClick: () =>
          base
            .callAjax(api.reprocess(model.filtersRef.current))
            .then(() => base.search()),
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [model, base, menuName],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
