import { useCallback, MutableRefObject } from "react";
import { divisionConfigMasterApi } from "@/features/tms/organization/divcnfgmstr/DivisionConfigMasterApi.ts";
import { useApiHandler } from "@/hooks/useApiHandler";
import { useGuard } from "@/hooks/useGuard";
import type { divisionConfigMasterModel } from "./DivisionConfigMasterModel.ts";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/commonActions";

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

  // ── Top-left 액션 ────────────────────────────────────────────
  const configActions = [
    {
      type: "button" as const,
      key: "LBL_SYNC",
      label: "LBL_SYNC",
      onClick: () => {
        handleApi(
          divisionConfigMasterApi.syncConfig({}),
          "동기화되었습니다.",
        ).then(() => searchRef.current?.());
      },
    },
    makeAddAction({
      onClick: () => {
        model.setConfigData((prev: any) => ({
          ...prev,
          rows: [
            ...prev.rows,
            {
              _isNew: true,
              LGST_GRP_OPR_CONFIG_CD: "",
              LGST_GRP_OPR_CONFIG_NM: "",
            },
          ],
          totalCount: prev.totalCount + 1,
        }));
      },
    }),
    makeSaveAction({
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        handleApi(
          divisionConfigMasterApi.saveConfig(saveRows),
          "저장되었습니다.",
        ).then(() => searchRef.current?.());
      },
    }),
  ];

  // ── Top-right 액션 ───────────────────────────────────────────
  const detailActions = [
    makeAddAction({
      onClick: () => {
        if (!model.selectedConfigRef.current) return;
        model.setDetailData((prev: any) => [
          ...prev,
          {
            _isNew: true,
            LGST_GRP_OPR_CONFIG_CD:
              model.selectedConfigRef.current.LGST_GRP_OPR_CONFIG_CD,
            LGST_GRP_OPR_CONFIG_DTL_CD: "",
            LGST_GRP_OPR_CONFIG_DTL_NM: "",
          },
        ]);
      },
    }),
    makeSaveAction({
      onClick: (_e: any) => {
        const saveRows = (model.detailDataRef.current ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        handleApi(
          divisionConfigMasterApi.saveConfigDetail(saveRows),
          "저장되었습니다.",
        );
      },
    }),
  ];

  // ── Bottom-left 액션 ─────────────────────────────────────────
  const i18nActions = [
    makeAddAction({
      onClick: () => {
        if (!model.selectedConfigRef.current) return;
        model.setI18nData((prev: any) => [
          ...prev,
          {
            _isNew: true,
            LGST_GRP_OPR_CONFIG_CD:
              model.selectedConfigRef.current.LGST_GRP_OPR_CONFIG_CD,
            LANG_TP: "",
            LGST_GRP_OPR_CONFIG_NM: "",
          },
        ]);
      },
    }),
    makeSaveAction({
      onClick: () => {
        const saveRows = (model.i18nDataRef.current ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        handleApi(
          divisionConfigMasterApi.saveConfigI18n(saveRows),
          "저장되었습니다.",
        );
      },
    }),
  ];

  // ── Bottom-right 액션 ────────────────────────────────────────
  const detailI18nActions = [
    makeAddAction({
      onClick: () => {
        if (
          !model.selectedConfigRef.current ||
          !model.selectedDetailRef.current
        )
          return;
        model.setDetailI18nData((prev: any) => [
          ...prev,
          {
            _isNew: true,
            LGST_GRP_OPR_CONFIG_CD:
              model.selectedConfigRef.current.LGST_GRP_OPR_CONFIG_CD,
            LGST_GRP_OPR_CONFIG_DTL_CD:
              model.selectedDetailRef.current.LGST_GRP_OPR_CONFIG_DTL_CD,
            LANG_TP: "",
            LGST_GRP_OPR_CONFIG_DTL_NM: "",
          },
        ]);
      },
    }),
    makeSaveAction({
      onClick: () => {
        const saveRows = (model.detailI18nDataRef.current ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        handleApi(
          divisionConfigMasterApi.saveConfigDetailI18n(saveRows),
          "저장되었습니다.",
        );
      },
    }),
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
