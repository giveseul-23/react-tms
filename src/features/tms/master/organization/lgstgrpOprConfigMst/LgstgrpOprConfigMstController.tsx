// src/features/tms/master/organization/lgstgrpOprConfigMst/LgstgrpOprConfigMstController.tsx
//
// 센차: LgstGrpConfigMasterController.js 와 1:1 대응.
// useBaseController 가 callAjax/saveGrid/resetGrids/searchSub/alert/confirm 제공.
// 화면 고유 핸들러(onMainGridClick, onSub01GridClick, onAdd*, onSave*, syncConfig, onTabChange)만 정의.

import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { lgstgrpOprConfigApi as api } from "./LgstgrpOprConfigApi";
import type {
  LgstgrpOprConfigMstModel,
  GridKey,
} from "./LgstgrpOprConfigMstModel";

interface Args {
  model: LgstgrpOprConfigMstModel;
}

export function useLgstgrpOprConfigMstController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 그리드 fetch (센차: mainInfo store proxy) ──────────────
  // SearchFilters 가 넘기는 params 에 activeType 합쳐서 전달
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      api.getConfigList({
        ...params,
        LGST_GRP_CNFG_GRP_CD: model.activeType,
      }),
    [model.activeType],
  );

  // ── 메인 그리드 행 클릭 (센차: onMainGridClick) ────────────────
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "mainLang",
            fetch: (r) => api.getConfigI18nList({ CNFG_CD: r.CNFG_CD }),
          },
          {
            to: "detail",
            fetch: async (r) => {
              const res = await api.getConfigDetailList({ CNFG_CD: r.CNFG_CD });

              setTimeout(() => {
                const first = model.grids.detail.rows[0];
                if (first) onSub01GridClick(first);
              }, 0);

              return res;
            },
          },
        ],
        { alsoReset: ["detailLang"] },
      ),
    [base],
  );

  // ── 상세 그리드 행 클릭 (센차: onSub01GridClick) ───────────────
  const onSub01GridClick = useCallback(
    (row: any) =>
      base.handleRowClick("detail", row, [
        {
          to: "detailLang",
          fetch: (r) =>
            api.getConfigDetailI18nList({
              CNFG_CD: r.CNFG_CD,
              CNFG_DTL_CD: r.CNFG_DTL_CD,
            }),
        },
      ]),
    [base],
  );

  // ── 메인 그리드 조회 콜백 (센차: onMainInfoCallback) ───────────
  // 메인에 데이터 set + 첫 행 자동 선택 (cascade 는 onMainGridClick 위임)
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model, onMainGridClick],
  );

  // ── 메인 행 추가 (센차: onAdd + onCheckMainGridAdd) ────────────
  // 행 추가 시 모든 서브 그리드 reset
  const onAddMain = useCallback(() => {
    base.resetGrids(["mainLang", "detail", "detailLang"]);
    base.addRow("main", {
      DATA_TP: "STRING",
      DATA_CRE_TCD: "USER",
      LGST_GRP_CNFG_GRP_CD: model.activeType,
    });
  }, [model.activeType, base]);

  // ── 상세 행 추가 (센차: onAddDetail) — checkHeader 시리즈 검증 ──
  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "LBL_LGST_GRP_CNFG_CD")) return;
    base.resetGrids(["detailLang"]);
    base.addRow("detail", {
      CNFG_CD: main.CNFG_CD,
    });
  }, [model, base]);

  // ── 메인-다국어 행 추가 (센차: onAddLang) ──────────────────────
  const onAddSub03 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "LBL_LGST_GRP_CNFG_CD")) return;
    base.addRow("mainLang", {
      CNFG_CD: main.CNFG_CD,
    });
  }, [model, base]);

  // ── 상세-다국어 행 추가 (센차: onAddDetailLang) ────────────────
  const onAddSub02 = useCallback(() => {
    const sub01 = model.grids.detail.selectedRef.current;
    if (!base.requireParentRow(sub01, "LBL_LGST_GRP_CNFG_DTL_CD")) return;
    base.addRow("detailLang", {
      CNFG_CD: sub01.CNFG_CD,
      CNFG_DTL_CD: sub01.CNFG_DTL_CD,
    });
  }, [model, base]);

  // ── 저장 전 검증 (센차: checkBeforeSaveSub01Grid) ──────────────
  // sub01 에 DFT_YN === 'Y' 인 행이 1건 이상 있어야 저장 허용
  const checkBeforeSaveSub01 = useCallback(() => {
    const rows = model.grids.detail.ref.current?.rows ?? [];
    if (rows.some((r: any) => r.DFT_YN === "Y" || r.DFT_YN === true))
      return true;
    base.alert("기본값(Y) 인 상세코드가 1건 이상 있어야 합니다.");
    return false;
  }, [model, base]);

  // ── 메인 저장 (센차: onSave) — 삭제행 있으면 confirm 후 저장 ───
  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.saveConfig, {
        confirmOnDelete: "MSG_CHK_DELETE",
      }),
    [base],
  );

  // ── 상세 저장 (센차: onSub01InfoSaveCallback) ──────────────────
  // 메인 재조회 대신 본인 cascade 만 재조회
  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("detail", api.saveConfigDetail, {
        beforeSave: checkBeforeSaveSub01,
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getConfigDetailList({ CNFG_CD: main.CNFG_CD }),
        },
      }),
    [base, checkBeforeSaveSub01],
  );

  // ── 상세-다국어 저장 (센차: onSub02InfoSaveCallback) ───────────
  const onSaveSub02 = useCallback(
    () =>
      base.saveGrid("detailLang", api.saveConfigDetailI18n, {
        afterSave: {
          cascadeFrom: "detail",
          fetch: (sub01) =>
            api.getConfigDetailI18nList({
              CNFG_CD: sub01.CNFG_CD,
              CNFG_DTL_CD: sub01.CNFG_DTL_CD,
            }),
        },
      }),
    [base],
  );

  // ── 메인-다국어 저장 (센차: onSub03InfoSaveCallback) ───────────
  const onSaveSub03 = useCallback(
    () =>
      base.saveGrid("mainLang", api.saveConfigI18n, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getConfigI18nList({ CNFG_CD: main.CNFG_CD }),
        },
      }),
    [base],
  );

  // ── 동기화 (센차: syncConfig) ──────────────────────────────────
  const syncConfig = useCallback(() => {
    base
      .callAjax(
        api.syncConfig({ LGST_GRP_CNFG_GRP_CD: model.activeType }),
        { successMsg: "MSG_CMPLT_SYNC", mask: "main" },
      )
      .then(() => base.search());
  }, [model.activeType, base]);

  // ── 탭 변경 (센차: onTypeTabChange) — 클리어 + 재조회 ──────────
  // activeType state 가 한 tick 뒤 반영되므로 setTimeout 으로 search 호출
  const onTabChange = useCallback(
    (key: string) => {
      model.setActiveType(key);
      base.resetGrids(["main", "mainLang", "detail", "detailLang"]);
      setTimeout(() => base.search(1), 0);
    },
    [model, base],
  );

  // ── 그리드별 actions 배열 (센차: ExGridEditor 의 saveUrl/saveCallback + view 의 toolbar 결합 자리) ──
  // 추가/저장/사용자정의 버튼 추가는 모두 여기서. View 는 binding 만.
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
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    onTabChange,
    mainActions,
    sub01Actions,
    sub02Actions,
    sub03Actions,
  };
}
