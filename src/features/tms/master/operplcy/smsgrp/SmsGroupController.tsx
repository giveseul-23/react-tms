// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { smsGroupApi } from "./SmsGroupApi";
import { SmsGroupModel } from "./SmsGroupModel";
import { NTFC_TARGET_COLUMN_DEFS } from "./SmsGroupColumns";
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
  // ── fetchDispatchList (센차: mainInfo store proxy url) ────────
  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) =>
      smsGroupApi.getVltnNtfctnCnfgList(params),
    [],
  );

  // ── handleSearch (센차: onMainInfoCallback + gridsReset) ──────
  // 조회 완료 시 SearchFilters → DataGrid 데이터 전달 및 서브그리드 초기화
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
      handleRowClicked(data.rows?.[0]);
    },
    [model],
  );

  const fetchDetail = useCallback((row: any) => {
    const lgstGrpCd = row.LGST_GRP_CD;
    if (!lgstGrpCd) return Promise.resolve([]);
    return smsGroupApi
      .getVltnNtfctnCnfgDetailList({
        LGST_GRP_CD: lgstGrpCd,
      })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const fetchNtfcChannelCnfgDetail = useCallback((row: any) => {
    const configCd = row.VLTN_NTFCTN_CNFG_ID;
    if (!configCd) return Promise.resolve([]);

    return smsGroupApi
      .getVltnNtfctnCnfgChannelList({
        VLTN_NTFCTN_CNFG_ID: configCd,
      })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const fetchNtfcTargetCnfgDetail = useCallback((row: any) => {
    const configCd = row.VLTN_NTFCTN_CNFG_ID;
    if (!configCd) return Promise.resolve([]);

    return smsGroupApi
      .getVltnNtfctnCnfgTargetList({
        VLTN_NTFCTN_CNFG_ID: configCd,
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
        (model.setSubDetailRowData(rows), handleSubRowClicked(rows[0]));
      });
    },
    [model],
  );

  const handleSubRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      model.setSubChannelRowData([]);
      model.setSubTargetRowData([]);

      Promise.all([
        fetchNtfcChannelCnfgDetail(row),
        fetchNtfcTargetCnfgDetail(row),
      ])
        .then(([channelRes, targetRes]: any[]) => {
          model.setSubChannelRowData(channelRes);
          model.setSubTargetRowData(targetRes);
        })
        .catch((err) => {
          console.error("[Country] row click sub-fetch failed", err);
        });

      fetchDetail(row);
    },
    [model],
  );

  const detailActions = [
    {
      type: "button",
      key: "템플릿복사",
      label: "템플릿복사",
      onClick: () => {},
    },
    makeAddAction(),
    makeSaveAction(),
  ];

  const channelActions = [
    {
      type: "button",
      key: "템플릿수정",
      label: "템플릿수정",
      onClick: () => {},
    },
    makeAddAction(),
    makeSaveAction(),
  ];

  const targetActions = [
    {
      type: "button",
      key: "사용자등록",
      label: "사용자등록",
      onClick: () => {},
    },
    makeAddAction(),
    makeSaveAction(),
    makeExcelGroupAction({
      columns: NTFC_TARGET_COLUMN_DEFS,
      menuName: "위반알림설정관리",
      fetchFn: () =>
        vltnNtfctnCnfgApi.getCountryList(menuCd, filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  return {
    fetchDispatchList,
    handleSearch,
    handleRowClicked,
    detailActions,
    channelActions,
    targetActions,
  };
}
