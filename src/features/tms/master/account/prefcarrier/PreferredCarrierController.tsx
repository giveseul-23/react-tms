import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { preferredCarrierApi as api } from "./PreferredCarrierApi";
import { MAIN_COLUMN_DEFS } from "./PreferredCarrierColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { PreferredCarrierModel, GridKey } from "./PreferredCarrierModel";
import { Lang } from "@/app/services/common/Lang";

interface ControllerArgs {
  model: PreferredCarrierModel;
}

export function usePreferredCarrierController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  // 외부 탭 등 화면 고유 조건이 있으면 params 에 합쳐서 전달
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  // ── 메인 행 추가 ─────────────────────────────────────────────
  // base.addRow 가 EDIT_STS: "I" 자동 주입 + push.
  const onAddMain = useCallback(() => {
    base.addRow("main", {});
  }, [base]);

  // ── 메인 저장 — 삭제행 있으면 confirm 후 저장 ─────────────────
  // confirmOnDelete 옵션 한 줄로 처리. 후처리는 기본값 "refresh"(메인 재조회).
  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base],
  );

  // ── 그리드별 actions 배열 ─────────────────────────────────────
  // 추가/저장/사용자정의 버튼 결정은 모두 여기서. View 는 binding 만.
  // ActionItem[] 타입 명시 — 화면 고유 버튼 추가 시 type 추론 도움.
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: Lang.get("MENU_PREF_CARR_MGMT"),
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, model],
  );


  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}