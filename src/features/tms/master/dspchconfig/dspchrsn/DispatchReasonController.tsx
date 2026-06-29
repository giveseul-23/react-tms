import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { Lang } from "@/app/services/common/Lang";
import { dispatchReasonApi as api } from "./DispatchReasonApi";
import type { DispatchReasonModel, GridKey } from "./DispatchReasonModel";

interface Args {
  model: DispatchReasonModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useDispatchReasonController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch ────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 상세 fetch — 신규(미저장) 행이면 조회 안 함 ────────────────
  const fetchDetail = useCallback((row: any) => {
    if (!row || String(row.EDIT_STS ?? "").trim() === "I") {
      return EMPTY_RESULT;
    }
    return api.getDetailList({ DSPCH_RSN_ID: row.DSPCH_RSN_ID });
  }, []);

  // ── 메인 행 클릭 — detail cascade ──────────────────────────────
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        { to: "detail", fetch: fetchDetail },
      ]),
    [base, fetchDetail],
  );

  // ── 메인 조회 콜백 — 첫 행 자동 선택 + cascade ─────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 행 추가 ────────────────────────────────────────────────────
  const onAddMain = useCallback(() => {
    base.resetGrids(["detail"]);
    base.addRow("main", {});
  }, [base]);

  const onAddDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_DSPCH_RSN_NM"))) return;
    base.addRow("detail", { DSPCH_RSN_ID: main.DSPCH_RSN_ID });
  }, [base, model.grids.main]);

  // ── 저장 ───────────────────────────────────────────────────────
  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.saveMain, { afterSave: "refresh" }),
    [base],
  );

  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.saveDetail, {
        afterSave: { cascadeFrom: "main", fetch: fetchDetail },
      }),
    [base, fetchDetail],
  );

  // ── 그리드별 actions ──────────────────────────────────────────
  const mainActions = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
    ],
    [onAddMain, onSaveMain],
  );

  const detailActions = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
    ],
    [onAddDetail, onSaveDetail],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
