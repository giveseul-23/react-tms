// src/views/lgstgrpOprConfigMst/LgstgrpOprConfigMstController.tsx
import { useCallback, MutableRefObject } from "react";
import { lgstgrpOprConfigApi } from "@/features/tms/organization/lgstgrpOprConfigMst/LgstgrpOprConfigApi.ts";
import { useApiHandler } from "@/hooks/useApiHandler";
import { useGuard } from "@/hooks/useGuard";
import type { LgstgrpOprConfigMstModel } from "./LgstgrpOprConfigMstModel.ts";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: LgstgrpOprConfigMstModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useLgstgrpOprConfigMstController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const { handleApi } = useApiHandler();
  const { guardHasData } = useGuard();

  // ── 메인 조회 (Top-left) ──────────────────────────────────────
  const fetchConfigList = useCallback(
    (params: Record<string, unknown>) =>
      lgstgrpOprConfigApi.getConfigList({
        ...params,
        LGST_GRP_CNFG_GRP_CD: model.activeTab,
      }),
    [model.activeTab],
  );

  // ── 개별 fetch 함수들 ─────────────────────────────────────────
  const fetchDetail = useCallback((row: any) => {
    const configCd = row.CNFG_CD;
    if (!configCd) return Promise.resolve([]);
    return lgstgrpOprConfigApi
      .getConfigDetailList({ CNFG_CD: configCd })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch(() => []);
  }, []);

  const fetchI18n = useCallback((row: any) => {
    const configCd = row.CNFG_CD;
    const detailCd = row.CNFG_DTL_CD;
    if (!configCd) return Promise.resolve([]);
    return lgstgrpOprConfigApi
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
      return lgstgrpOprConfigApi
        .getConfigDetailI18nList({ CNFG_CD: configCd, CNFG_DTL_CD: detailCd })
        .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
        .catch(() => []);
    },
    [model],
  );

  // ── 행 클릭 핸들러 (각각 독립) ────────────────────────────────
  const handleConfigRowClicked = useCallback(
    (row: any) => {
      model.setSelectedConfig(row);
      model.setSelectedDetail(null);
      model.setDetailData({ rows: [], totalCount: 0, page: 1, limit: 20 });
      model.setI18nData([]);
      model.setDetailI18nData([]);

      fetchDetail(row).then((rows) => {
        (model.setDetailData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: 20,
        }),
          handleDetailRowClicked(rows[0]));
      });
    },
    [model, fetchDetail, fetchI18n],
  );

  const handleDetailRowClicked = useCallback(
    (row: any) => {
      model.setSelectedDetail(row);
      model.setDetailI18nData([]);

      fetchI18n(row).then((rows) => {
        model.setI18nData(rows);
        fetchDetailI18n(rows[0]).then((rows) => model.setDetailI18nData(rows));
      });
    },
    [model, fetchDetailI18n],
  );

  const handleI18nRowClicked = useCallback(
    (row: any) => {
      model.setDetailI18nData([]);

      fetchDetailI18n(row).then((rows) => model.setDetailI18nData(rows));
    },
    [model, fetchDetailI18n],
  );

  // ── handleSearch: top-left → top-right → bottom-left → bottom-right 순차 조회
  const handleSearch = useCallback(
    async (data: any) => {
      model.setConfigData(data);
      model.setSelectedConfig(null);
      model.setSelectedDetail(null);
      model.setDetailData({ rows: [], totalCount: 0, page: 1, limit: 20 });
      model.setI18nData([]);
      model.setDetailI18nData([]);

      const firstRow = data.rows?.[0];
      if (!firstRow) return;

      // 1. top-left 첫 번째 행 선택
      model.setSelectedConfig(firstRow);

      // 2. top-right 조회
      const detailRows = await fetchDetail(firstRow);
      model.setDetailData({
        rows: detailRows,
        totalCount: detailRows.length,
        page: 1,
        limit: 20,
      });

      // 3. bottom-left 조회
      const i18nRows = await fetchI18n(firstRow);
      model.setI18nData(i18nRows);

      // 4. bottom-right 조회 (top-right 첫 번째 행 기준)
      if (detailRows.length > 0) {
        model.setSelectedDetail(detailRows[0]);
        const detailI18nRows = await fetchDetailI18n(detailRows[0]);
        model.setDetailI18nData(detailI18nRows);
      }
    },
    [model, fetchDetail, fetchI18n, fetchDetailI18n],
  );

  // ── Top-left 액션 ────────────────────────────────────────────
  const configActions = [
    {
      type: "button" as const,
      key: "동기화",
      label: "동기화",
      onClick: () => {
        handleApi(lgstgrpOprConfigApi.syncConfig({}), "동기화되었습니다.").then(
          () => searchRef.current?.(),
        );
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
          lgstgrpOprConfigApi.saveConfig(saveRows),
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
          lgstgrpOprConfigApi.saveConfigDetail(saveRows),
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
          lgstgrpOprConfigApi.saveConfigI18n(saveRows),
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
          lgstgrpOprConfigApi.saveConfigDetailI18n(saveRows),
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
