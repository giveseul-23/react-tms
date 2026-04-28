// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { smsGroupApi } from "./SmsGroupApi";
import { SmsGroupModel } from "./SmsGroupModel";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: SmsGroupModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useSmsGroupController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchSmsGroupList = useCallback(
    (params: Record<string, unknown>) => smsGroupApi.getSmsGroupList(params),
    [],
  );

  // ── handleSearch (센차: onMainInfoCallback + gridsReset) ──────
  // 조회 완료 시 SearchFilters → DataGrid 데이터 전달 및 서브그리드 초기화
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data.rows);
      model.resetSubGrids();
    },
    [model],
  );

  const fetchDetail = useCallback((row: any) => {
    const smsGrpCd = row.SMS_GRP_CD;
    if (!smsGrpCd) return Promise.resolve([]);
    return smsGroupApi
      .getSmsGroupDetailList({
        SMS_GRP_CD: smsGrpCd,
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
        model.setSubDetailRowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: 20,
        });
      });
    },
    [model],
  );

  const mainActions = [makeAddAction(), makeSaveAction()];

  const detailActions = [makeAddAction(), makeSaveAction()];

  return {
    fetchSmsGroupList,
    handleSearch,
    handleRowClicked,
    mainActions,
    detailActions,
  };
}
