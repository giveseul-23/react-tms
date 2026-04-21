import { useCallback, MutableRefObject } from "react";
import { apMonthlyManagementApi } from "./ApMonthlyManagementApi";
import { ApMonthlyManagementModel } from "./ApMonthlyManagementModel";
import { MAIN_COLUMN_DEFS } from "./ApMonthlyManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: ApMonthlyManagementModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useApMonthlyManagementController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) => apMonthlyManagementApi.getList(params),
    [],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
    },
    [model],
  );

  const handleRowClicked = useCallback(() => {}, []);

  const doAction = useCallback(
    (apiCall: () => Promise<any>) => {
      apiCall().then(() => searchRef.current?.());
    },
    [searchRef],
  );

  const mainActions = [
    {
      type: "button",
      key: "월실적생성",
      label: "월실적생성",
      onClick: () =>
        doAction(() => apMonthlyManagementApi.createMonthlyResult(filtersRef.current)),
    },
    {
      type: "button",
      key: "월실적취소",
      label: "월실적취소",
      onClick: () =>
        doAction(() => apMonthlyManagementApi.cancelMonthlyResult(filtersRef.current)),
    },
    {
      type: "dropdown",
      key: "수기비용엑셀양식다운로드",
      label: "수기비용엑셀양식다운로드",
      items: [],
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        apMonthlyManagementApi.save(saveRows).then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "확정",
      label: "확정",
      onClick: () =>
        doAction(() => apMonthlyManagementApi.confirm(filtersRef.current)),
    },
    {
      type: "button",
      key: "확정취소",
      label: "확정취소",
      onClick: () =>
        doAction(() => apMonthlyManagementApi.cancelConfirm(filtersRef.current)),
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "월실적관리",
      fetchFn: () => apMonthlyManagementApi.getList(filtersRef.current),
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
