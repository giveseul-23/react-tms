// 화면 고유 Controller — useGridController 베이스 훅에 featureConfig 주입.
// 화면 고유 액션(생성/취소/저장 등)은 base.actions 에 합성해 추가 반환.

import { MutableRefObject, useMemo, useCallback } from "react";
import { useGridController } from "@/hooks/useGridFeature/useGridController";
import { apSettlMgmtApi } from "./ApSettlMgmtApi";
import {
  apSettlMgmtFeatureConfig,
  type ApSettlMgmtModel,
} from "./ApSettlMgmtModel";
import { MAIN_COLUMN_DEFS } from "./ApSettlMgmtColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

interface ControllerArgs {
  model: ApSettlMgmtModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
}

export function useApSettlMgmtController({
  model,
  searchRef,
  filtersRef,
}: ControllerArgs) {
  const base = useGridController({
    config: apSettlMgmtFeatureConfig,
    model,
    searchRef,
    filtersRef,
  });

  const doAction = useCallback(
    (apiCall: () => Promise<any>) => {
      apiCall().then(() => searchRef.current?.());
    },
    [searchRef],
  );

  // master(config) 자식 그리드만 재조회 (코스트센터 저장 후 등에 사용)
  const refetchSubTabs = useCallback(() => {
    const row = model.selected.config?.ref.current;
    if (row) {
      // base 의 cascade 가 row 클릭 시 발화되는 로직과 동일 — 단순히 master row 클릭 핸들러 호출
      base.handleRowClicked.config(row);
    }
  }, [base.handleRowClicked, model.selected.config]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_CREATE",
        label: "BTN_AP_SETTLEMENT_CREATE",
        onClick: () =>
          doAction(() => apSettlMgmtApi.createClose(filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_DELETE",
        label: "BTN_AP_SETTLEMENT_DELETE",
        onClick: () =>
          doAction(() => apSettlMgmtApi.cancelClose(filtersRef.current)),
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
      {
        type: "button",
        key: "BTB_SAVE",
        label: "BTB_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          apSettlMgmtApi.save(saveRows).then(() => searchRef.current?.());
        },
      },
      {
        type: "button",
        key: "BTN_ATTACH_DOC",
        label: "BTN_ATTACH_DOC",
        onClick: () => {},
      },
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: "매입정산관리",
        fetchFn: () => apSettlMgmtApi.getList(filtersRef.current),
        rows: model.grids.config.rows,
      }),
    ],
    [filtersRef, searchRef, doAction, model.grids.config.rows],
  );

  const summaryActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: [],
        menuName: "종합내역",
        fetchFn: () =>
          apSettlMgmtApi.getSummaryList({
            CLOSE_ID: model.selected.config?.ref.current?.CLOSE_ID,
          }),
        rows: model.grids.summary.rows,
      }),
    ],
    [model.selected.config, model.grids.summary.rows],
  );

  const costCenterActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_COST_ACCOUNT_ADD",
        label: "BTN_COST_ACCOUNT_ADD",
        onClick: () => {
          const row = model.selected.config?.ref.current;
          if (!row) return;
          doAction(() =>
            apSettlMgmtApi.addCostCenter({ CLOSE_ID: row.CLOSE_ID }),
          );
        },
      },
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          apSettlMgmtApi
            .saveCostCenter(saveRows)
            .then(() => refetchSubTabs());
        },
      },
      makeExcelGroupAction({
        columns: [],
        menuName: "코스트센터/계정별내역",
        fetchFn: () =>
          apSettlMgmtApi.getCostCenterList({
            CLOSE_ID: model.selected.config?.ref.current?.CLOSE_ID,
          }),
        rows: model.grids.costCenter.rows,
      }),
    ],
    [doAction, refetchSubTabs, model.selected.config, model.grids.costCenter.rows],
  );

  const materialCostActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: [],
        menuName: "원재료비내역",
        fetchFn: () =>
          apSettlMgmtApi.getMaterialCostList({
            CLOSE_ID: model.selected.config?.ref.current?.CLOSE_ID,
          }),
        rows: model.grids.materialCost.rows,
      }),
    ],
    [model.selected.config, model.grids.materialCost.rows],
  );

  const evidenceActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          apSettlMgmtApi.save(saveRows).then(() => searchRef.current?.());
        },
      },
      {
        type: "button",
        key: "LBL_FILE_DOWNLOAD",
        label: "LBL_FILE_DOWNLOAD",
        onClick: () => {},
      },
    ],
    [searchRef],
  );

  return {
    ...base,
    mainActions,
    summaryActions,
    costCenterActions,
    materialCostActions,
    evidenceActions,
  };
}
