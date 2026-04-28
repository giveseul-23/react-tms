// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { vltnNtfctnCnfgApi } from "./VltnNtfctnCnfgApi";
import { VltnNtfctnCnfgModel } from "./VltnNtfctnCnfgModel";
import { NTFC_TARGET_COLUMN_DEFS } from "./VltnNtfctnCnfgColumns";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

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

  const mainActions: ActionItem[] = [
    {
      type: "button",
      key: "BUTTON_COPY_CONTRACT",
      label: "BUTTON_COPY_CONTRACT",
      onClick: () => {},
    },
    makeSaveAction(),
  ];

  const detailActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_TEMPLATE_COPY",
      label: "BTN_TEMPLATE_COPY",
      onClick: () => {},
    },
    makeAddAction(),
    makeSaveAction(),
  ];

  const channelActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_TEMPLATE_UPDATE",
      label: "BTN_TEMPLATE_UPDATE",
      onClick: () => {},
    },
    makeAddAction(),
    makeSaveAction(),
  ];

  const targetActions: ActionItem[] = [
    {
      type: "button",
      key: "LBL_USR_REGI",
      label: "LBL_USR_REGI",
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
    mainActions,
  };
}
