// src/features/tms/master/organization/divcnfgmstr/DivisionConfigMasterController.tsx
//
// useBaseController 가 callAjax/saveGrid/searchSub/handleRowClick/addRow/
// requireParentRow/alert/confirm 제공. 화면 고유 핸들러만 정의.

import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/commonActions";
import { divisionConfigMasterApi as api } from "./DivisionConfigMasterApi";
import type {
  DivisionConfigMasterModel,
  GridKey,
} from "./DivisionConfigMasterModel";

interface Args {
  model: DivisionConfigMasterModel;
}

export function useDivisionConfigMasterController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getConfigList(params),
    [],
  );

  // ── 메인 행 클릭 — sub01(detail) + sub03(메인-i18n) cascade,
  //    sub02(detail-i18n) 는 alsoReset (sub01 클릭으로만 fetch) ────
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "sub01",
            fetch: (r) => api.getConfigDetailList({ CNFG_CD: r.CNFG_CD }),
          },
          {
            to: "sub03",
            fetch: (r) => api.getConfigI18nList({ CNFG_CD: r.CNFG_CD }),
          },
        ],
        { alsoReset: ["sub02"] },
      ),
    [base],
  );

  // ── 상세 행 클릭 — sub02(detail-i18n) cascade ──────────────────
  const onSub01GridClick = useCallback(
    (row: any) =>
      base.handleRowClick("sub01", row, [
        {
          to: "sub02",
          fetch: (r) =>
            api.getConfigDetailI18nList({
              CNFG_CD: r.CNFG_CD,
              CNFG_DTL_CD: r.CNFG_DTL_CD,
            }),
        },
      ]),
    [base],
  );

  // ── 메인 조회 콜백 — 첫 행 자동 선택 + cascade ─────────────────
  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── Add 핸들러 ────────────────────────────────────────────────
  const onAddMain = useCallback(() => {
    base.resetGrids(["sub01", "sub02", "sub03"]);
    base.addRow("main", { CNFG_CD: "", CNFG_NM: "" });
  }, [base]);

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "디비전운영설정코드")) return;
    base.resetGrids(["sub02"]);
    base.addRow("sub01", {
      CNFG_CD: main.CNFG_CD,
      CNFG_DTL_CD: "",
      CNFG_DTL_NM: "",
    });
  }, [model, base]);

  // sub02 = detail-i18n (CNFG_CD + CNFG_DTL_CD)
  const onAddSub02 = useCallback(() => {
    const sub01 = model.grids.sub01.selectedRef.current;
    if (!base.requireParentRow(sub01, "디비전운영설정상세코드")) return;
    base.addRow("sub02", {
      CNFG_CD: sub01.CNFG_CD,
      CNFG_DTL_CD: sub01.CNFG_DTL_CD,
      LANG_TP: "",
      LANG_DESC: "",
    });
  }, [model, base]);

  // sub03 = 메인-i18n (CNFG_CD)
  const onAddSub03 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "디비전운영설정코드")) return;
    base.addRow("sub03", {
      CNFG_CD: main.CNFG_CD,
      LANG_TP: "",
      LANG_DESC: "",
    });
  }, [model, base]);

  // ── Save 핸들러 ───────────────────────────────────────────────
  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.saveConfig, {
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base],
  );

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", api.saveConfigDetail, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getConfigDetailList({ CNFG_CD: main.CNFG_CD }),
        },
      }),
    [base],
  );

  // sub02 save → sub01 기준 cascade 재조회 (detail-i18n)
  const onSaveSub02 = useCallback(
    () =>
      base.saveGrid("sub02", api.saveConfigDetailI18n, {
        afterSave: {
          cascadeFrom: "sub01",
          fetch: (sub01) =>
            api.getConfigDetailI18nList({
              CNFG_CD: sub01.CNFG_CD,
              CNFG_DTL_CD: sub01.CNFG_DTL_CD,
            }),
        },
      }),
    [base],
  );

  // sub03 save → main 기준 cascade 재조회 (메인-i18n)
  const onSaveSub03 = useCallback(
    () =>
      base.saveGrid("sub03", api.saveConfigI18n, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getConfigI18nList({ CNFG_CD: main.CNFG_CD }),
        },
      }),
    [base],
  );

  // ── 동기화 ────────────────────────────────────────────────────
  const syncConfig = useCallback(
    () =>
      base
        .callAjax(api.syncConfig({}), "동기화되었습니다.")
        .then(() => base.search()),
    [base],
  );

  // ── 그리드별 actions ──────────────────────────────────────────
  const mainActions = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      {
        type: "button" as const,
        key: "LBL_SYNC",
        label: "LBL_SYNC",
        onClick: syncConfig,
      },
    ],
    [onAddMain, onSaveMain, syncConfig],
  );

  const sub01Actions = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub01 }),
      makeSaveAction({ onClick: onSaveSub01 }),
    ],
    [onAddSub01, onSaveSub01],
  );

  const sub02Actions = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub02 }),
      makeSaveAction({ onClick: onSaveSub02 }),
    ],
    [onAddSub02, onSaveSub02],
  );

  const sub03Actions = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub03 }),
      makeSaveAction({ onClick: onSaveSub03 }),
    ],
    [onAddSub03, onSaveSub03],
  );

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    onSub01GridClick,
    mainActions,
    sub01Actions,
    sub02Actions,
    sub03Actions,
  };
}
