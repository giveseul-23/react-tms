// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { vltnNtfctnCnfgApi } from "./VltnNtfctnCnfgApi";
import { VltnNtfctnCnfgModel } from "./VltnNtfctnCnfgModel";
import { downExcelSearch, downExcelSearched } from "@/views/common/common";
import { NTFC_TARGET_COLUMN_DEFS } from "./VltnNtfctnCnfgColumns";

type ControllerProps = {
  model: VltnNtfctnCnfgModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useVltnNtfctnCnfgController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  // ── fetchDispatchList (센차: mainInfo store proxy url) ────────
  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) =>
      vltnNtfctnCnfgApi.getVltnNtfctnCnfgList(params),
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
    return vltnNtfctnCnfgApi
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

    return vltnNtfctnCnfgApi
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

    return vltnNtfctnCnfgApi
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

  const mainActions = [
    {
      type: "button",
      key: "계약서복사",
      label: "계약서복사",
      onClick: () => {},
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: () => {},
    },
  ];

  const detailActions = [
    {
      type: "button",
      key: "템플릿복사",
      label: "템플릿복사",
      onClick: () => {},
    },
    {
      type: "button",
      key: "추가",
      label: "추가",
      onClick: () => {},
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: () => {},
    },
  ];

  const channelActions = [
    {
      type: "button",
      key: "템플릿수정",
      label: "템플릿수정",
      onClick: () => {},
    },
    {
      type: "button",
      key: "추가",
      label: "추가",
      onClick: () => {},
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: () => {},
    },
  ];

  const targetActions = [
    {
      type: "button",
      key: "사용자등록",
      label: "사용자등록",
      onClick: () => {},
    },
    {
      type: "button",
      key: "추가",
      label: "추가",
      onClick: () => {},
    },
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
              columns: NTFC_TARGET_COLUMN_DEFS,
              menuName: "위반알림설정관리",
              fetchFn: () =>
                vltnNtfctnCnfgApi.getCountryList(menuCd, filtersRef.current),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: NTFC_TARGET_COLUMN_DEFS,
              menuName: "위반알림설정관리",
              rows: model.gridData.rows,
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
    channelActions,
    targetActions,
    mainActions,
  };
}
