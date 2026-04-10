// src/views/lgstgrpOprConfigMst/LgstgrpOprConfigMstController.tsx
import { useCallback, MutableRefObject } from "react";
import { lgstgrpOprConfigApi } from "@/app/services/lgstgrpOprConfig/lgstgrpOprConfigApi";
import { useApiHandler } from "@/hooks/useApiHandler";
import { useGuard } from "@/hooks/useGuard";
import type { LgstgrpOprConfigMstModel } from "./LgstgrpOprConfigMstModel";

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
      lgstgrpOprConfigApi.getConfigList(params),
    [],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setConfigData(data);
      model.resetSubGrids();
    },
    [model],
  );

  // ── Top-left 행 클릭 → Top-right + Bottom-left 로드 ──────────
  const handleConfigRowClicked = useCallback(
    (row: any) => {
      model.setSelectedConfig(row);
      model.resetDetailI18n();

      const configCd = row.LGST_GRP_OPR_CONFIG_CD;
      if (!configCd) return;

      Promise.all([
        lgstgrpOprConfigApi.getConfigDetailList({
          LGST_GRP_OPR_CONFIG_CD: configCd,
        }),
        lgstgrpOprConfigApi.getConfigI18nList({
          LGST_GRP_OPR_CONFIG_CD: configCd,
        }),
      ])
        .then(([detailRes, i18nRes]: any[]) => {
          model.setDetailData(
            detailRes.data.result ?? detailRes.data.data?.dsOut ?? [],
          );
          model.setI18nData(
            i18nRes.data.result ?? i18nRes.data.data?.dsOut ?? [],
          );
        })
        .catch((err) => {
          console.error(
            "[LgstgrpOprConfigMst] config row click sub-fetch failed",
            err,
          );
        });
    },
    [model],
  );

  // ── Top-right 행 클릭 → Bottom-right 로드 ────────────────────
  const handleDetailRowClicked = useCallback(
    (row: any) => {
      model.setSelectedDetail(row);

      const configCd =
        row.LGST_GRP_OPR_CONFIG_CD ??
        model.selectedConfigRef.current?.LGST_GRP_OPR_CONFIG_CD;
      const detailCd = row.LGST_GRP_OPR_CONFIG_DTL_CD;
      if (!configCd || !detailCd) return;

      lgstgrpOprConfigApi
        .getConfigDetailI18nList({
          LGST_GRP_OPR_CONFIG_CD: configCd,
          LGST_GRP_OPR_CONFIG_DTL_CD: detailCd,
        })
        .then((res: any) => {
          model.setDetailI18nData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          );
        })
        .catch((err) => {
          console.error(
            "[LgstgrpOprConfigMst] detail row click sub-fetch failed",
            err,
          );
        });
    },
    [model],
  );

  // ── Top-left 액션 ────────────────────────────────────────────
  const configActions = [
    {
      type: "button" as const,
      key: "동기화",
      label: "동기화",
      onClick: () => {
        handleApi(
          lgstgrpOprConfigApi.syncConfig({}),
          "동기화되었습니다.",
        ).then(() => searchRef.current?.());
      },
    },
    {
      type: "button" as const,
      key: "추가",
      label: "추가",
      onClick: () => {
        model.setConfigData((prev: any) => ({
          ...prev,
          rows: [
            ...prev.rows,
            { _isNew: true, LGST_GRP_OPR_CONFIG_CD: "", LGST_GRP_OPR_CONFIG_NM: "" },
          ],
          totalCount: prev.totalCount + 1,
        }));
      },
    },
    {
      type: "button" as const,
      key: "저장",
      label: "저장",
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
    },
  ];

  // ── Top-right 액션 ───────────────────────────────────────────
  const detailActions = [
    {
      type: "button" as const,
      key: "추가",
      label: "추가",
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
    },
    {
      type: "button" as const,
      key: "저장",
      label: "저장",
      onClick: (e: any) => {
        const saveRows = (model.detailDataRef.current ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        handleApi(
          lgstgrpOprConfigApi.saveConfigDetail(saveRows),
          "저장되었습니다.",
        );
      },
    },
  ];

  // ── Bottom-left 액션 ─────────────────────────────────────────
  const i18nActions = [
    {
      type: "button" as const,
      key: "추가",
      label: "추가",
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
    },
    {
      type: "button" as const,
      key: "저장",
      label: "저장",
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
    },
  ];

  // ── Bottom-right 액션 ────────────────────────────────────────
  const detailI18nActions = [
    {
      type: "button" as const,
      key: "추가",
      label: "추가",
      onClick: () => {
        if (!model.selectedConfigRef.current || !model.selectedDetailRef.current)
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
    },
    {
      type: "button" as const,
      key: "저장",
      label: "저장",
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
    },
  ];

  return {
    fetchConfigList,
    handleSearch,
    handleConfigRowClicked,
    handleDetailRowClicked,
    configActions,
    detailActions,
    i18nActions,
    detailI18nActions,
  };
}
