// src/features/tms/calculate/apsettlmgmt/ApSettlMgmtController.tsx
//
// useBaseController 가 callAjax/saveGrid/searchSub/handleRowClick/...등 제공.
// master 행 클릭 시 8개 sub 그리드 동시 fetch (fan-out cascade).

import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { apSettlMgmtApi as api } from "./ApSettlMgmtApi";
import { MAIN_COLUMN_DEFS } from "./ApSettlMgmtColumns";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ApSettlMgmtModel, GridKey } from "./ApSettlMgmtModel";

const masterChildParamMap = (row: any) => ({
  AP_SETL_ID: row?.AP_SETL_ID,
  LGST_GRP_CD: row?.LGST_GRP_CD,
});

interface Args {
  model: ApSettlMgmtModel;
}

export function useApSettlMgmtController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch ────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 행 클릭 — 8개 sub 동시 fetch ──────────────────────────
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("config", row, [
        {
          to: "summary",
          fetch: (r) => api.getSummaryList(masterChildParamMap(r)),
        },
        {
          to: "monthlyFare",
          fetch: (r) => api.getMonthlyFareList(masterChildParamMap(r)),
        },
        {
          to: "hireDispatchPay",
          fetch: (r) => api.getHireDispatchPayList(masterChildParamMap(r)),
        },
        {
          to: "freightPay",
          fetch: (r) => api.getFreightPayList(masterChildParamMap(r)),
        },
        {
          to: "indirectPay",
          fetch: (r) => api.getIndirectPayList(masterChildParamMap(r)),
        },
        {
          to: "costCenter",
          fetch: (r) => api.getEachCostOrGlList(masterChildParamMap(r)),
        },
        {
          to: "materialCost",
          fetch: (r) => api.getEachItmCostList(masterChildParamMap(r)),
        },
        {
          to: "evidence",
          fetch: (r) => api.getDocFileList(masterChildParamMap(r)),
        },
      ]),
    [base],
  );

  // ── 메인 조회 콜백 — 첫 행 자동 선택 + cascade ─────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.config.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.config, onMainGridClick],
  );

  // ── master 자식 그리드만 재조회 (코스트센터 저장 후 등) ─────
  const refetchSubTabs = useCallback(() => {
    const row = model.grids.config.selectedRef.current;
    if (row) onMainGridClick(row);
  }, [model.grids.config, onMainGridClick]);

  // ── 저장 핸들러 (표준 base.saveGrid — dirty 추출 + dsSave + 토스트 + 후처리 자동) ──
  const onSaveMain = useCallback(
    () => base.saveGrid("config", api.save),
    [base],
  );

  const onSaveCostCenter = useCallback(
    () =>
      base.saveGrid("costCenter", api.saveCostCenter, {
        afterSave: refetchSubTabs,
      }),
    [base, refetchSubTabs],
  );

  const onSaveEvidence = useCallback(
    () => base.saveGrid("evidence", api.save),
    [base],
  );

  // ── 정산 생성/취소 ────────────────────────────────────────────
  const onCreateClose = useCallback(
    () =>
      base
        .callAjax(
          api.createClose(model.filtersRef.current),
          "정산이 생성되었습니다.",
        )
        .then(() => base.search()),
    [base, model.filtersRef],
  );

  const onCancelClose = useCallback(
    () =>
      base
        .callAjax(
          api.cancelClose(model.filtersRef.current),
          "정산이 취소되었습니다.",
        )
        .then(() => base.search()),
    [base, model.filtersRef],
  );

  // ── 코스트센터 추가 ──────────────────────────────────────────
  const onAddCostCenter = useCallback(() => {
    const row = model.grids.config.selectedRef.current;
    if (!row) return;
    base.addRow("costCenter", {
      AP_FI_STS: row.AP_FI_STS,
    });
  }, [model.grids.config, base]);

  // ── master 그리드 액션 ────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_CREATE",
        label: "BTN_AP_SETTLEMENT_CREATE",
        onClick: onCreateClose,
      },
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_DELETE",
        label: "BTN_AP_SETTLEMENT_DELETE",
        onClick: onCancelClose,
      },
      {
        type: "dropdown",
        key: "BTN_SEND_AP_SETL",
        label: "BTN_SEND_AP_SETL",
        items: [],
      },
      {
        type: "dropdown",
        key: "BTN_SEND_CNCL_AP_SETL",
        label: "BTN_SEND_CNCL_AP_SETL",
        items: [],
      },
      {
        type: "dropdown",
        key: "BTN_MNG_CST_DIST",
        label: "BTN_MNG_CST_DIST",
        items: [],
      },
      makeSaveAction({ onClick: onSaveMain }),
      {
        type: "button",
        key: "BTN_ATTACH_DOC",
        label: "BTN_ATTACH_DOC",
        onClick: () => {},
      },
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS as any,
        menuName: "매입정산관리",
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.config.rows,
      }),
    ],
    [onCreateClose, onCancelClose, onSaveMain, model],
  );

  // ── 종합내역 탭 액션 ──────────────────────────────────────────
  const summaryActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: [],
        menuName: "종합내역",
        fetchFn: () =>
          api.getSummaryList({
            CLOSE_ID: model.grids.config.selectedRef.current?.CLOSE_ID,
          }),
        rows: model.grids.summary.rows,
      }),
    ],
    [model],
  );

  // ── 코스트센터 탭 액션 ────────────────────────────────────────
  const costCenterActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddCostCenter }),
      makeSaveAction({ onClick: onSaveCostCenter }),
      makeExcelGroupAction({
        columns: [],
        menuName: "코스트센터/계정별내역",
        fetchFn: () =>
          api.getEachCostOrGlList({
            CLOSE_ID: model.grids.config.selectedRef.current?.CLOSE_ID,
          }),
        rows: model.grids.costCenter.rows,
      }),
    ],
    [onAddCostCenter, onSaveCostCenter, model],
  );

  // ── 원재료비 탭 액션 ──────────────────────────────────────────
  const materialCostActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: [],
        menuName: "원재료비내역",
        fetchFn: () =>
          api.getEachItmCostList({
            CLOSE_ID: model.grids.config.selectedRef.current?.CLOSE_ID,
          }),
        rows: model.grids.materialCost.rows,
      }),
    ],
    [model],
  );

  // ── 증빙 탭 액션 ──────────────────────────────────────────────
  const evidenceActions: ActionItem[] = useMemo(
    () => [
      makeSaveAction({ onClick: onSaveEvidence }),
      {
        type: "button",
        key: "LBL_FILE_DOWNLOAD",
        label: "LBL_FILE_DOWNLOAD",
        onClick: () => {},
      },
    ],
    [onSaveEvidence],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    summaryActions,
    costCenterActions,
    materialCostActions,
    evidenceActions,
  };
}
