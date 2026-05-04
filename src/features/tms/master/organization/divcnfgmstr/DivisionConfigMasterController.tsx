import { useCallback, MutableRefObject } from "react";
import { divisionConfigMasterApi } from "@/features/tms/master/organization/divcnfgmstr/DivisionConfigMasterApi.ts";
import { useApiHandler } from "@/hooks/useApiHandler";
import { useGuard } from "@/hooks/useGuard";
import type { divisionConfigMasterModel } from "./DivisionConfigMasterModel.ts";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/commonActions";
import { useGridAdd, useGridSave } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: divisionConfigMasterModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDivisionConfigMasterController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const { handleApi } = useApiHandler();
  const { guardHasData } = useGuard();

  // ── 메인 조회 (Top-left) ──────────────────────────────────────
  const fetchConfigList = useCallback(
    (params: Record<string, unknown>) =>
      divisionConfigMasterApi.getConfigList({
        ...params,
        LGST_GRP_CNFG_GRP_CD: model.activeTab,
      }),
    [model.activeTab],
  );

  // ── 개별 fetch 함수들 ─────────────────────────────────────────
  const fetchDetail = useCallback((row: any) => {
    const configCd = row.CNFG_CD;
    if (!configCd) return Promise.resolve([]);
    return divisionConfigMasterApi
      .getConfigDetailList({ CNFG_CD: configCd })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch(() => []);
  }, []);

  const fetchI18n = useCallback((row: any) => {
    const configCd = row.CNFG_CD;
    const detailCd = row.CNFG_DTL_CD;
    if (!configCd) return Promise.resolve([]);
    return divisionConfigMasterApi
      .getConfigI18nList({ CNFG_CD: configCd, CNFG_DTL_CD: detailCd })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch(() => []);
  }, []);

  const fetchDetailI18n = useCallback(
    (row: any) => {
      const configCd = row.CNFG_CD ?? model.selectedConfigRef.current?.CNFG_CD;
      const detailCd =
        row.CNFG_DTL_CD ?? model.selectedDetailRef.current?.CNFG_DTL_CD;
      if (!configCd || !detailCd) return Promise.resolve([]);
      return divisionConfigMasterApi
        .getConfigDetailI18nList({ CNFG_CD: configCd, CNFG_DTL_CD: detailCd })
        .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
        .catch(() => []);
    },
    [model],
  );

  // ── 행 클릭 핸들러: 각 단계는 자기 자식만 fetch.
  //    하위 그리드의 autoSelectFirstRow 가 다음 단계의 onRowClicked 를 발화.
  const handleConfigRowClicked = useCallback(
    (row: any) => {
      model.setSelectedConfig(row);
      model.setSelectedDetail(null);
      model.setDetailData({ rows: [], totalCount: 0, page: 1, limit: 20 });
      model.setI18nData([]);
      model.setDetailI18nData([]);

      fetchDetail(row).then((rows) => {
        model.setDetailData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: 20,
        });
      });
    },
    [model, fetchDetail],
  );

  const handleDetailRowClicked = useCallback(
    (row: any) => {
      model.setSelectedDetail(row);
      model.setI18nData([]);
      model.setDetailI18nData([]);

      fetchI18n(row).then((rows) => model.setI18nData(rows));
    },
    [model, fetchI18n],
  );

  const handleI18nRowClicked = useCallback(
    (row: any) => {
      model.setDetailI18nData([]);

      fetchDetailI18n(row).then((rows) => model.setDetailI18nData(rows));
    },
    [model, fetchDetailI18n],
  );

  // ── handleSearch: top-left 만 채움. 이후 cascade 는 각 그리드의
  //    autoSelectFirstRow 가 onRowClicked 를 자동 발화하며 흘러감.
  const handleSearch = useCallback(
    (data: any) => {
      model.setConfigData(data);
      model.setSelectedConfig(null);
      model.setSelectedDetail(null);
      model.setDetailData({ rows: [], totalCount: 0, page: 1, limit: 20 });
      model.setI18nData([]);
      model.setDetailI18nData([]);
    },
    [model],
  );

  // ── saveFn 들 — useGridSave 가 만든 payload({ dsSave, rows }) 중 dsSave 만 사용.
  const saveConfigFn = useCallback(
    (payload: any) =>
      divisionConfigMasterApi.saveConfig({ dsSave: payload.dsSave }),
    [],
  );
  const saveConfigDetailFn = useCallback(
    (payload: any) =>
      divisionConfigMasterApi.saveConfigDetail({ dsSave: payload.dsSave }),
    [],
  );
  const saveConfigI18nFn = useCallback(
    (payload: any) =>
      divisionConfigMasterApi.saveConfigI18n({ dsSave: payload.dsSave }),
    [],
  );
  const saveConfigDetailI18nFn = useCallback(
    (payload: any) =>
      divisionConfigMasterApi.saveConfigDetailI18n({ dsSave: payload.dsSave }),
    [],
  );

  // ── Top-left 추가/저장 (LanguagePack 패턴) ───────────────────
  const handleConfigAdd = useGridAdd({
    setRows: model.setConfigData,
    newRow: {
      LGST_GRP_OPR_CONFIG_CD: "",
      LGST_GRP_OPR_CONFIG_NM: "",
    },
    position: "bottom",
  });
  const handleConfigSave = useGridSave({
    rows: model.configData.rows,
    setRows: model.setConfigData,
    saveFn: saveConfigFn,
    onSaved: () => searchRef.current?.(),
  });

  // ── Top-left 액션 ────────────────────────────────────────────
  const configActions: ActionItem[] = [
    {
      type: "button",
      key: "LBL_SYNC",
      label: "LBL_SYNC",
      onClick: () => {
        handleApi(
          divisionConfigMasterApi.syncConfig({}),
          "동기화되었습니다.",
        ).then(() => searchRef.current?.());
      },
    },
    makeAddAction({ onClick: handleConfigAdd }),
    makeSaveAction({ onClick: handleConfigSave }),
  ];

  // ── Top-right 추가/저장 (LanguagePack 패턴) ──────────────────
  const handleDetailAdd = useGridAdd({
    setRows: model.setDetailData,
    newRow: () => ({
      LGST_GRP_OPR_CONFIG_CD:
        model.selectedConfigRef.current?.LGST_GRP_OPR_CONFIG_CD,
      LGST_GRP_OPR_CONFIG_DTL_CD: "",
      LGST_GRP_OPR_CONFIG_DTL_NM: "",
    }),
    position: "bottom",
  });
  const handleDetailSave = useGridSave({
    rows: model.detailData.rows,
    setRows: model.setDetailData,
    saveFn: saveConfigDetailFn,
  });

  // ── Top-right 액션 ───────────────────────────────────────────
  const detailActions = [
    makeAddAction({ onClick: handleDetailAdd }),
    makeSaveAction({ onClick: handleDetailSave }),
  ];

  // ── Bottom-left 추가/저장 (LanguagePack 패턴) ────────────────
  const handleI18nAdd = useGridAdd({
    setRows: model.setI18nData,
    newRow: () => ({
      LGST_GRP_OPR_CONFIG_CD:
        model.selectedConfigRef.current?.LGST_GRP_OPR_CONFIG_CD,
      LANG_TP: "",
      LGST_GRP_OPR_CONFIG_NM: "",
    }),
    position: "bottom",
  });
  const handleI18nSave = useGridSave({
    rows: model.i18nData,
    setRows: model.setI18nData,
    saveFn: saveConfigI18nFn,
  });

  // ── Bottom-left 액션 ─────────────────────────────────────────
  const i18nActions = [
    makeAddAction({ onClick: handleI18nAdd }),
    makeSaveAction({ onClick: handleI18nSave }),
  ];

  // ── Bottom-right 추가/저장 (LanguagePack 패턴) ───────────────
  const handleDetailI18nAdd = useGridAdd({
    setRows: model.setDetailI18nData,
    newRow: () => ({
      LGST_GRP_OPR_CONFIG_CD:
        model.selectedConfigRef.current?.LGST_GRP_OPR_CONFIG_CD,
      LGST_GRP_OPR_CONFIG_DTL_CD:
        model.selectedDetailRef.current?.LGST_GRP_OPR_CONFIG_DTL_CD,
      LANG_TP: "",
      LGST_GRP_OPR_CONFIG_DTL_NM: "",
    }),
    position: "bottom",
  });
  const handleDetailI18nSave = useGridSave({
    rows: model.detailI18nData,
    setRows: model.setDetailI18nData,
    saveFn: saveConfigDetailI18nFn,
  });

  // ── Bottom-right 액션 ────────────────────────────────────────
  const detailI18nActions = [
    makeAddAction({ onClick: handleDetailI18nAdd }),
    makeSaveAction({ onClick: handleDetailI18nSave }),
  ];

  return {
    fetchConfigList,
    handleSearch,
    handleConfigRowClicked,
    handleDetailRowClicked,
    handleI18nRowClicked,
    configActions,
    detailActions,
    i18nActions,
    detailI18nActions,
  };
}
