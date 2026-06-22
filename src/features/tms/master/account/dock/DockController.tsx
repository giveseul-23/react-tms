import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { toDsSave, ROW_STATUS } from "@/app/components/grid/gridUtils/rowStatus";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { dockApi as api } from "./DockApi";
import { MENU_CODE, AUTH } from "./Dock";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DockModel, GridKey } from "./DockModel";

interface Args {
  model: DockModel;
}

export function useDockController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 메인 fetch ────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getMainList(params),
    [],
  );

  // ── 메인 행 클릭 — sub01 cascade (BSNS_HRS_ID 기준) ──────────────
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "sub01",
          fetch: (r) => api.getSub01List({ BSNS_HRS_ID: r.BSNS_HRS_ID }),
        },
      ]),
    [base],
  );

  // ── 메인 조회 콜백 — 첫 행 자동 선택 + cascade ─────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 메인 행 추가 ──────────────────────────────────────────────
  const onAddMain = useCallback(() => base.addRow("main", {}), [base]);

  // ── 메인 저장 ─────────────────────────────────────────────────
  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.saveMain),
    [base],
  );

  // ── 운영슬롯 추가 — 선택 메인 도크의 BSNS_HRS_ID 상속 ──────────
  const onAddOpSlot = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "도크")) return;
    base.addRow("sub01", { BSNS_HRS_ID: main.BSNS_HRS_ID });
  }, [base, model.grids.main]);

  // ── 운영슬롯 삭제 — 선택 행(없으면 메인 행) 삭제 처리 후 재조회 ──
  const onDeleteOpSlot = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "도크")) return;
    let rows = model.grids.sub01.selectedRef.current as any;
    rows = Array.isArray(rows) ? rows : rows ? [rows] : [];
    if (!rows.length) rows = main ? [main] : [];
    if (!rows.length) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    const dsSave = toDsSave(
      rows.map((r: any) => ({ ...r, EDIT_STS: ROW_STATUS.UPDATE })),
    );
    void base
      .callAjax(api.deleteOpSlot({ dsSave }), { mask: "sub01" })
      .then(() => onMainGridClick(main));
  }, [base, model.grids.main, model.grids.sub01, onMainGridClick]);

  // ── 운영슬롯 저장 — 저장 후 부모행 기준 재조회 ─────────────────
  const onSaveOpSlot = useCallback(
    () =>
      base.saveGrid("sub01", api.saveOpSlot, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getSub01List({ BSNS_HRS_ID: main.BSNS_HRS_ID }),
        },
      }),
    [base],
  );

  // ── 그리드별 actions ──────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getMainList(model.filtersRef.current),
        rows: model.grids.main.rows,
        upload: { gridId: AUTH.grids.main, onUploaded: () => base.search() },
        templateDownload: { gridId: AUTH.grids.main, fileName: menuName },
      }),
    ],
    [base, menuName, model.grids.main, model.filtersRef, onAddMain, onSaveMain],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_BSNS_HRS_SLOT_NO_ADD",
        label: "LBL_BSNS_HRS_SLOT_NO_ADD",
        onClick: onAddOpSlot,
      },
      {
        type: "button",
        key: "LBL_BSNS_HRS_SLOT_NO_DEL",
        label: "LBL_BSNS_HRS_SLOT_NO_DEL",
        onClick: onDeleteOpSlot,
      },
      makeSaveAction({ onClick: onSaveOpSlot }),
    ],
    [onAddOpSlot, onDeleteOpSlot, onSaveOpSlot],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    sub01Actions,
  };
}
