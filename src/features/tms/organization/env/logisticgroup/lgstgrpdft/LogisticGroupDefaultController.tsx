// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { logisticGroupDefaultApi } from "./LogisticGroupDefaultApi";
import { LogisticGroupDefaultModel } from "./LogisticGroupDefaultModel";
import { downExcelSearch, downExcelSearched } from "@/views/common/common";
import { CNFG_HEADER_COLUMN_DEFS } from "./LogisticGroupDefaultColumns";

type ControllerProps = {
  model: LogisticGroupDefaultModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useLogisticGroupDefaultController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  // ── fetchDispatchList (센차: mainInfo store proxy url) ────────
  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) =>
      logisticGroupDefaultApi.getLgstDefaultCnfgGrpList(params),
    [],
  );

  // ── handleSearch (센차: onMainInfoCallback + gridsReset) ──────
  // 조회 완료 시 SearchFilters → DataGrid 데이터 전달 및 서브그리드 초기화
  const handleSearch = useCallback(
    (data: any) => {
      model.setcnfgGrpData(data);
      model.resetSubGrids();
      fetchCnfgDetail(data.rows?.[0]);
    },
    [model],
  );

  const fetchCnfgDetail = useCallback((row: any) => {
    const configCd = row.LGST_GRP_CNFG_GRP_CD;
    if (!configCd) return Promise.resolve([]);
    return logisticGroupDefaultApi
      .getLgstDefaultCnfgList({
        LGST_GRP_CNFG_GRP_CD: configCd,
      })
      .then((res: any) => {
        const rows = res.data.data?.dsOut ?? [];
        model.setSubCnfgRowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: 20,
        });

        fetchDetail(rows[0]);
      })
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const fetchDetail = useCallback((row: any) => {
    const configCd = row.CNFG_CD;
    if (!configCd) return Promise.resolve([]);
    return logisticGroupDefaultApi
      .getLgstDefaultDetailList({
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
      model.resetSubGrids();
      fetchCnfgDetail(row);
    },
    [model],
  );

  const handleSubRowClicked = useCallback(
    (row: any) => {
      model.resetSubGrids();
      fetchCnfgDetail(row);
    },
    [model],
  );

  const detailActions = [
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: () => {},
    },
    {
      type: "group",
      key: "엑셀",
      label: "엑셀",
      items: [
        {
          type: "button",
          key: "조회된모든데이터다운로드",
          label: "조회된모든데이터다운로드",
          onClick: () => {
            downExcelSearch({
              columns: CNFG_HEADER_COLUMN_DEFS,
              menuName: "운송사요청목록",
              fetchFn: () =>
                logisticGroupDefaultApi.getLgstDefaultCnfgGrpList(
                  filtersRef.current,
                ),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: CNFG_HEADER_COLUMN_DEFS,
              rows: model.cnfgGrpData.rows,
              menuName: "운송사요청목록",
            });
          },
        },
      ],
    },
  ];

  return {
    fetchDispatchList,
    handleSearch,
    handleRowClicked,
    detailActions,
  };
}
