import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dfChargeApi as api } from "./DfChargeApi";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./DfChargeColumns";
import type { DfChargeModel, GridKey } from "./DfChargeModel";
import { makeAddAction, makeExcelGroupAction, makeSaveAction } from "@/app/components/grid/actions/commonActions";
import { ActionItem } from "@/app/components/ui/GridActionsBar";
import { Lang } from "@/app/services/common/Lang";

interface ControllerArgs {
  model: DfChargeModel;
}

export function useDfChargeController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  // 외부 탭 등 화면 고유 조건이 있으면 params 에 합쳐서 전달
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 행 클릭 — selection + 자식(detail) cascade reset/fetch ─
  // handleRowClick 한 줄로 selection set / reset / fetch 모두 처리.
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) => api.getDetailList({ CHG_CD: r.CHG_CD }),
        },
      ]),
    [base],
  );

  // ── 메인 조회 콜백 (onSearch) — 첫 행 자동 선택 + cascade ──────
  // 메인 cascade 정의는 onMainGridClick 한 곳만 — onSearchCallback 가 그걸 재사용.
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 메인 행 추가 ─────────────────────────────────────────────
  // base.addRow 가 EDIT_STS: "I" 자동 주입 + push.
  const onAddMain = useCallback(() => {
    base.resetGrids(["detail"]);
    base.addRow("main", {
      RDNG_RCD: "9999"
    });
  }, [base]);

  // ── 상세 행 추가 — 부모(메인) 행 검증 ─────────────────────────
  // requireParentRow 가 미선택/미저장 시 alert + false 반환.
  const onAddDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "메인코드")) return;
    base.addRow("detail", {
      CHG_CD: main.CHG_CD,
    });
  }, [model, base]);

  const checkBeforeSave = useCallback(() => {
    const rows = model.grids.main.ref.current?.rows ?? [];

    const modifiedRows = rows.filter((row: any) => 
      row.EDIT_STS === 'I' || row.EDIT_STS === 'U'
    );

    if (modifiedRows.length === 0) return true;

    for (const row of modifiedRows) {
      const chgCd = row.CHG_CD ?? '';
      const dfChgOpDivTcd = row.DF_CHG_OP_DIV_TCD;
      const alwChgCanYn = row.ALW_CHG_CAN_YN;

      // 조건 1: CHG_CD의 첫 글자가 숫자인지 체크
      if (chgCd.length > 0 && /^[0-9]/.test(chgCd)) {
        base.alert(Lang.get("MSG_VALID_CHARGE_CODE"));
        return false;
      }

      // 조건 2: CONFIRM 또는 MONTHLY 이면서 취소 가능 여부가 true(Y)인 경우
      if ((dfChgOpDivTcd === 'CONFIRM' || dfChgOpDivTcd === 'MONTHLY') && alwChgCanYn) {
        base.alert(Lang.get("MSG_FAIL_CONFIRM_CAN_YN"));
        return false;
      }
    }
    return true;
  }, [model, base]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        beforeSave: checkBeforeSave,
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base, checkBeforeSave],
  );

  // ── 상세 저장 — 부모 행 기반 cascade 재조회 ────────────────────
  // afterSave: { cascadeFrom, fetch } 객체 형태 — 저장 후 자기 자신만 재조회.
  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.saveDetail, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getDetailList({ CHG_CD: main.CHG_CD }),
        },
      }),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: Lang.get("MENU_DF_BASED_CHARGE_CODE"),
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, model],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
      makeExcelGroupAction({
        columns: DETAIL_COLUMN_DEFS,
        menuName: Lang.get("MENU_DF_BASED_CHARGE_CODE"),
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main
            ? api.getDetailList({ CHG_CD: main.CHG_CD })
            : Promise.resolve({ data: { result: [] } });
        },
        rows: model.grids.detail.rows,
      }),
    ],
    [onAddDetail, onSaveDetail, model],
  );


  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
