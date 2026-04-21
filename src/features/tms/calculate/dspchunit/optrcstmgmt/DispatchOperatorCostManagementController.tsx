import { useCallback, MutableRefObject } from "react";
import { dispatchOperatorCostApi } from "./DispatchOperatorCostManagementApi";
import { DispatchOperatorCostModel } from "./DispatchOperatorCostManagementModel";
import { MAIN_COLUMN_DEFS } from "./DispatchOperatorCostManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: DispatchOperatorCostModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDispatchOperatorCostController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) => dispatchOperatorCostApi.getList(params),
    [],
  );

  const fetchSubTabs = useCallback(
    (row: any) => {
      if (!row) return;
      const params = { DSPCH_NO: row.DSPCH_NO, SETL_DOC_NO: row.SETL_DOC_NO };

      dispatchOperatorCostApi
        .getCostDetailList(params)
        .then((res: any) =>
          model.setCostDetailRowData(res.data.result ?? res.data.data?.dsOut ?? []),
        );
      dispatchOperatorCostApi
        .getWaypointList(params)
        .then((res: any) =>
          model.setWaypointRowData(res.data.result ?? res.data.data?.dsOut ?? []),
        );
      dispatchOperatorCostApi
        .getEvidenceList(params)
        .then((res: any) =>
          model.setEvidenceRowData(res.data.result ?? res.data.data?.dsOut ?? []),
        );
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      model.setCostFunctionRowData([]);
      model.setSelectedCostDetailRow(null);
      fetchSubTabs(row);
    },
    [model, fetchSubTabs],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
      handleRowClicked(data.rows?.[0]);
    },
    [model, handleRowClicked],
  );

  const handleCostDetailRowClicked = useCallback(
    (row: any) => {
      model.setSelectedCostDetailRow(row);
      if (!row) return;
      dispatchOperatorCostApi
        .getCostFunctionList({
          DSPCH_NO: row.DSPCH_NO,
          CTRT_ITEM_CD: row.CTRT_ITEM_CD,
        })
        .then((res: any) =>
          model.setCostFunctionRowData(res.data.result ?? res.data.data?.dsOut ?? []),
        );
    },
    [model],
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
      key: "계약변경",
      label: "계약변경",
      onClick: () =>
        doAction(() => dispatchOperatorCostApi.changeContract(filtersRef.current)),
    },
    {
      type: "button",
      key: "비용계산",
      label: "비용계산",
      onClick: () =>
        doAction(() => dispatchOperatorCostApi.calculateCost(filtersRef.current)),
    },
    {
      type: "button",
      key: "일괄거리조정",
      label: "일괄거리조정",
      onClick: () =>
        doAction(() => dispatchOperatorCostApi.adjustBulkDistance(filtersRef.current)),
    },
    {
      type: "button",
      key: "이동거리재계산",
      label: "이동거리재계산",
      onClick: () =>
        doAction(() =>
          dispatchOperatorCostApi.recalculateMoveDistance(filtersRef.current),
        ),
    },
    {
      type: "dropdown",
      key: "일마감",
      label: "일마감",
      items: [],
    },
    {
      type: "dropdown",
      key: "비용확정",
      label: "비용확정",
      items: [],
    },
    {
      type: "button",
      key: "정산정보삭제",
      label: "정산정보삭제",
      onClick: () =>
        doAction(() => dispatchOperatorCostApi.deleteSettlement(filtersRef.current)),
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
        dispatchOperatorCostApi.save(saveRows).then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "마감생성",
      label: "마감생성",
      onClick: () =>
        doAction(() => dispatchOperatorCostApi.createClose(filtersRef.current)),
    },
    {
      type: "dropdown",
      key: "메모",
      label: "메모",
      items: [],
    },
    {
      type: "dropdown",
      key: "운임엑셀업로드",
      label: "운임엑셀업로드",
      items: [],
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "배차단위정산",
      fetchFn: () => dispatchOperatorCostApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const costDetailActions = [
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        dispatchOperatorCostApi.save(saveRows).then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "증빙문서첨부",
      label: "증빙문서첨부",
      onClick: () => {},
    },
  ];

  const waypointActions = [
    {
      type: "button",
      key: "정산경로추가",
      label: "정산경로추가",
      onClick: () => {
        if (!model.selectedHeaderRowRef.current) return;
        doAction(() =>
          dispatchOperatorCostApi.addSettlementRoute({
            DSPCH_NO: model.selectedHeaderRowRef.current.DSPCH_NO,
          }),
        );
      },
    },
    {
      type: "button",
      key: "경로복구",
      label: "경로복구",
      onClick: () => {
        if (!model.selectedHeaderRowRef.current) return;
        doAction(() =>
          dispatchOperatorCostApi.restoreRoute({
            DSPCH_NO: model.selectedHeaderRowRef.current.DSPCH_NO,
          }),
        );
      },
    },
    { type: "button", key: "조정상", label: "조정(▲)", onClick: () => {} },
    { type: "button", key: "조정하", label: "조정(▼)", onClick: () => {} },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        dispatchOperatorCostApi
          .saveWaypoint(saveRows)
          .then(() => fetchSubTabs(model.selectedHeaderRowRef.current));
      },
    },
  ];

  const evidenceActions = [
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        dispatchOperatorCostApi
          .saveEvidence(saveRows)
          .then(() => fetchSubTabs(model.selectedHeaderRowRef.current));
      },
    },
    {
      type: "button",
      key: "첨부파일다운로드",
      label: "첨부파일 다운로드",
      onClick: () => {},
    },
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    handleCostDetailRowClicked,
    mainActions,
    costDetailActions,
    waypointActions,
    evidenceActions,
  };
}
