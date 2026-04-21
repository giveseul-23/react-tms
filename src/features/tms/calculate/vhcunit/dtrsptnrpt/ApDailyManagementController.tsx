import { useCallback, MutableRefObject } from "react";
import { apDailyManagementApi } from "./ApDailyManagementApi";
import { ApDailyManagementModel } from "./ApDailyManagementModel";
import { DAILY_MAIN_COLUMN_DEFS } from "./ApDailyManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: ApDailyManagementModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useApDailyManagementController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) => apDailyManagementApi.getDailyList(params),
    [],
  );

  const fetchDetail = useCallback((row: any) => {
    if (!row) return Promise.resolve([]);
    return apDailyManagementApi
      .getDetailList({
        DLV_REQ_DT: row.DLV_REQ_DT,
        VEH_NO: row.VEH_NO,
        SETL_DOC_NO: row.SETL_DOC_NO,
      })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      fetchDetail(row).then((rows: any) => {
        model.setDetailRowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: model.pageSize,
        });
      });
    },
    [model, fetchDetail],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
      handleRowClicked(data.rows?.[0]);
    },
    [model, handleRowClicked],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>) => {
      apiCall().then(() => searchRef.current?.());
    },
    [searchRef],
  );

  const mainActions = [
    {
      type: "button",
      key: "일일실적생성",
      label: "일일실적생성",
      onClick: () =>
        doAction(() => apDailyManagementApi.createDailyResult(filtersRef.current)),
    },
    {
      type: "button",
      key: "일일실적취소",
      label: "일일실적취소",
      onClick: () =>
        doAction(() => apDailyManagementApi.cancelDailyResult(filtersRef.current)),
    },
    {
      type: "button",
      key: "일마감",
      label: "일마감",
      onClick: () =>
        doAction(() => apDailyManagementApi.closeDaily(filtersRef.current)),
    },
    {
      type: "button",
      key: "일마감취소",
      label: "일마감취소",
      onClick: () =>
        doAction(() => apDailyManagementApi.cancelDailyClose(filtersRef.current)),
    },
    {
      type: "dropdown",
      key: "유류비관리",
      label: "유류비관리",
      items: [],
    },
    {
      type: "dropdown",
      key: "비용등록관리",
      label: "비용등록관리",
      items: [],
    },
    {
      type: "dropdown",
      key: "메모",
      label: "메모",
      items: [],
    },
    {
      type: "dropdown",
      key: "재계산",
      label: "재계산",
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
        apDailyManagementApi.save(saveRows).then(() => searchRef.current?.());
      },
    },
    {
      type: "dropdown",
      key: "운임엑셀업로드",
      label: "운임엑셀업로드",
      items: [],
    },
    makeExcelGroupAction({
      columns: DAILY_MAIN_COLUMN_DEFS,
      menuName: "일일실적관리",
      fetchFn: () => apDailyManagementApi.getDailyList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const detailActions = [
    makeExcelGroupAction({
      columns: [],
      menuName: "상세내역",
      fetchFn: () =>
        apDailyManagementApi.getDetailList({
          DLV_REQ_DT: model.selectedHeaderRowRef.current?.DLV_REQ_DT,
          VEH_NO: model.selectedHeaderRowRef.current?.VEH_NO,
          SETL_DOC_NO: model.selectedHeaderRowRef.current?.SETL_DOC_NO,
        }),
      rows: model.detailRowData.rows,
    }),
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    detailActions,
  };
}
