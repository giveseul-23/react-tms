import { useCallback, MutableRefObject } from "react";
import { ifDispatchResultApi } from "./IfDispatchResultApi";
import { IfDispatchResultModel } from "./IfDispatchResultModel";
import { MAIN_COLUMN_DEFS } from "./IfDispatchResultColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: IfDispatchResultModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useIfDispatchResultController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      ifDispatchResultApi.getList({ userTz: "Asia/Seoul", ...params }),
    [],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
    },
    [model],
  );

  const handleRowClicked = useCallback(() => {}, []);

  const mainActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_REPRO",
      label: "BTN_REPRO",
      onClick: () =>
        ifDispatchResultApi
          .reprocess(filtersRef.current)
          .then(() => searchRef.current?.()),
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "배차결과송신내역",
      fetchFn: () => ifDispatchResultApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
  };
}
