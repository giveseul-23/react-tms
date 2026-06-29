// src/features/tms/master/organization/divcnfgmstr/DivisionConfigMasterController.tsx
//
// useBaseController 가 callAjax/saveGrid/searchSub/handleRowClick/addRow/
// requireParentRow/alert/confirm 제공. 화면 고유 핸들러만 정의.

import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { divisionConfigMasterApi as api } from "./DivisionConfigMasterApi";
import type {
  DivisionConfigMasterModel,
  GridKey,
} from "./DivisionConfigMasterModel";
import { Lang } from "@/app/services/common/Lang";

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
        "divCd",
        row,
        [
          {
            to: "divCd18n",
            fetch: (r) => api.getConfigI18nList({ CNFG_CD: r.CNFG_CD }),
          },
          {
            to: "divDtlCd",
            fetch: async (r) => {
              const res = await api.getConfigDetailList({ CNFG_CD: r.CNFG_CD });

              setTimeout(() => {
                const first = model.grids.divDtlCd.rows[0];
                if (first) ondivDtlCdGridClick(first);
              }, 0);

              return res;
            },
          },
        ],
        { alsoReset: ["divDtlCd18n"] },
      ),
    [base],
  );

  // ── 상세 행 클릭 — sub02(detail-i18n) cascade ──────────────────
  const ondivDtlCdGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("divDtlCd", row, [
        {
          to: "divDtlCd18n",
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
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.divCd.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.divCd, onMainGridClick],
  );

  // ── Add 핸들러 ────────────────────────────────────────────────
  //디비전운영설정코드 추가
  const onAddMain = useCallback(() => {
    base.resetGrids(["divCd18n", "divDtlCd", "divDtlCd18n"]);
    base.addRow("divCd", { CNFG_CD: "", CNFG_NM: "" });
  }, [base]);

  // 메인그리드 저장
  const onSaveMain = useCallback(
    () =>
      base.saveGrid("divCd", api.saveConfig, {
        confirmOnDelete: Lang.get("MSG_CHK_DELETE"),
      }),
    [base],
  );
  const checkAdd18n = useCallback((rows) => {
    rows.filter((r: any) => r.EDIT_STS !== "D" && r.delStatus !== true);
    return rows.length >= 3;
  }, []);

  const checkSave18n = useCallback((rows) => {
    rows.filter((r: any) => r.EDIT_STS !== "D" && r.delStatus !== true);
    const langs = rows.map((r: any) => r.LANG_TP);
    const ALLOWED = ["KO", "EN", "CN"];
    if (!langs.every((t: string) => ALLOWED.includes(t))) return false;
    return new Set(langs).size === langs.length;
  }, []);

  // 디비전운영설정코드 다국어설정 추가
  const onAddDivCd18n = useCallback(() => {
    const grid = model.grids.divCd.selectedRef.current;
    if (!base.requireParentRow(grid, "LBL_DIV_CNFG_CD")) return;
    if (checkAdd18n(model.grids.divCd18n.rows)) return;
    base.resetGrids(["divDtlCd", "divDtlCd18n"]);
    base.addRow("divCd18n", {
      CNFG_CD: grid.CNFG_CD,
      LANG_TP: "",
      LANG_DESC: "",
    });
  }, [
    model.grids.divCd.selectedRef,
    model.grids.divCd18n.rows,
    base,
    checkAdd18n,
  ]);

  //디비전설정코드다국어 저장
  const onSaveDivCd18n = useCallback(
    () =>
      base.saveGrid("divCd18n", api.saveConfigI18n, {
        beforeSave: () => {
          const valid = checkSave18n(model.grids.divCd18n.rows);

          if (!valid) base.alert(Lang.get("MSG_CHK_SAVE_DIV_18N"));

          return valid;
        },
        afterSave: {
          cascadeFrom: "divCd",
          fetch: (main) =>
            api.getConfigI18nList({
              CNFG_CD: main.CNFG_CD,
            }),
        },
      }),
    [base, checkSave18n, model.grids.divCd18n.rows],
  );

  // 디비전상세설정코드 추가
  const onAddDivCdDtl = useCallback(() => {
    const grid = model.grids.divCd.selectedRef.current;
    if (!base.requireParentRow(grid, "LBL_DIV_CNFG_CD")) return;
    base.resetGrids(["divDtlCd18n"]);
    base.addRow("divDtlCd", {
      CNFG_CD: grid.CNFG_CD,
      LANG_TP: "",
      LANG_DESC: "",
    });
  }, [model, base]);

  //디비전설정상세코드저장
  const onSaveDivDtlCd = useCallback(
    () =>
      base.saveGrid("divDtlCd", api.saveConfigDetail, {
        afterSave: {
          cascadeFrom: "divCd",
          fetch: (main) => api.getConfigDetailList({ CNFG_CD: main.CNFG_CD }),
        },
      }),
    [base],
  );

  // 디비전상세설정코드 다국어 추가
  const onAddDivDtlCd18n = useCallback(() => {
    const grid = model.grids.divDtlCd.selectedRef.current;
    if (!base.requireParentRow(grid, "LBL_DIV_CNFG_DTL_CD")) return;
    if (checkAdd18n(model.grids.divDtlCd18n.rows)) return;

    base.addRow("divDtlCd18n", {
      CNFG_CD: grid.CNFG_CD,
      CNFG_DTL_CD: grid.CNFG_DTL_CD,
      LANG_TP: "",
      LANG_DESC: "",
    });
  }, [
    model.grids.divDtlCd.selectedRef,
    model.grids.divDtlCd18n.rows,
    base,
    checkAdd18n,
  ]);

  // 디비전설정상세코드 다국어 저장
  const onSaveDivDtlCd18n = useCallback(
    () =>
      base.saveGrid("divDtlCd18n", api.saveConfigDetailI18n, {
        beforeSave: () => {
          const valid = checkSave18n(model.grids.divDtlCd18n.rows);

          if (!valid) base.alert(Lang.get("MSG_CHK_SAVE_DIV_18N"));

          return valid;
        },
        afterSave: {
          cascadeFrom: "divDtlCd",
          fetch: (divDtlCd) =>
            api.getConfigDetailI18nList({
              CNFG_CD: divDtlCd.CNFG_CD,
              CNFG_DTL_CD: divDtlCd.CNFG_DTL_CD,
            }),
        },
      }),
    [base, checkSave18n, model.grids.divDtlCd18n.rows],
  );

  // ── 동기화 ────────────────────────────────────────────────────
  const syncConfig = useCallback(
    () =>
      base
        .callAjax(api.syncConfig({}), {
          successMsg: Lang.get("MSG_CMPLT_SYNC"),
          mask: "divCd",
        })
        .then(() => base.search()),
    [base],
  );

  // ── 그리드별 actions ──────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      {
        type: "button",
        key: "LBL_SYNC",
        label: "LBL_SYNC",
        onClick: syncConfig,
      },
    ],
    [onAddMain, onSaveMain, syncConfig],
  );

  const divDtlCdActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDivCdDtl }),
      makeSaveAction({ onClick: onSaveDivDtlCd }),
    ],
    [onAddDivCdDtl, onSaveDivDtlCd],
  );

  const divCd18nActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDivCd18n }),
      makeSaveAction({ onClick: onSaveDivCd18n }),
    ],
    [onAddDivCd18n, onSaveDivCd18n],
  );

  const divDtlCd18nActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDivDtlCd18n }),
      makeSaveAction({ onClick: onSaveDivDtlCd18n }),
    ],
    [onAddDivDtlCd18n, onSaveDivDtlCd18n],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    ondivDtlCdGridClick,
    mainActions,
    divDtlCdActions,
    divCd18nActions,
    divDtlCd18nActions,
  };
}
