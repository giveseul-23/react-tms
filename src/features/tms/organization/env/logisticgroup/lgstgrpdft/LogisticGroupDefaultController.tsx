// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { logisticGroupDefaultApi } from "./LogisticGroupDefaultApi";
import { LogisticGroupDefaultModel } from "./LogisticGroupDefaultModel";
import { CNFG_HEADER_COLUMN_DEFS } from "./LogisticGroupDefaultColumns";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";

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
    },
    [model],
  );

  const fetchCnfgDetail = useCallback(
    (row: any) => {
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
        })
        .catch((err) => {
          throw Error(err);
        });
    },
    [model],
  );

  const fetchDetail = useCallback(
    (row: any) => {
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
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.resetSubGrids();
      fetchCnfgDetail(row);
    },
    [model, fetchCnfgDetail],
  );

  const handleSubRowClicked = useCallback(
    (row: any) => {
      fetchDetail(row);
    },
    [fetchDetail],
  );

  const detailActions = [
    makeSaveAction(),
    makeExcelGroupAction({
      columns: CNFG_HEADER_COLUMN_DEFS,
      menuName: "운송사요청목록",
      fetchFn: () =>
        logisticGroupDefaultApi.getLgstDefaultCnfgGrpList(filtersRef.current),
      rows: model.cnfgGrpData.rows,
    }),
  ];

  return {
    fetchDispatchList,
    handleSearch,
    handleRowClicked,
    handleSubRowClicked,
    detailActions,
  };
}
