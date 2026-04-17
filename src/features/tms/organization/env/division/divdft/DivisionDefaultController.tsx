// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { divisionDefaultApi } from "./DivisionDefaultApi";
import { DivisionDefaultModel } from "./DivisionDefaultModel";
import { makeSaveAction } from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: DivisionDefaultModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDivisionDefaultController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  // ── fetchDispatchList (센차: mainInfo store proxy url) ────────
  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) =>
      divisionDefaultApi.getDivisionDefaultList(params),
    [],
  );

  // ── handleSearch (센차: onMainInfoCallback + gridsReset) ──────
  // 조회 완료 시 SearchFilters → DataGrid 데이터 전달 및 서브그리드 초기화
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
      fetchDetail(data.rows?.[0]);
    },
    [model],
  );

  const fetchDetail = useCallback((row: any) => {
    const configCd = row.CNFG_CD;
    if (!configCd) return Promise.resolve([]);
    return divisionDefaultApi
      .getDivisionDefaultDetailList({
        CNFG_CD: configCd,
      })
      .then((res: any) => {
        const rows = res.data.data?.dsOut ?? [];
        model.setSubDetailRowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: 20,
        });
      })
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      model.setSubDetailRowData({
        rows: [],
        totalCount: 0,
        page: 1,
        limit: 20,
      });

      fetchDetail(row);
    },
    [model],
  );

  const detailActions = [makeSaveAction()];

  return {
    fetchDispatchList,
    handleSearch,
    handleRowClicked,
    detailActions,
  };
}
