import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { unsettlementDispatchApi as api } from "./UnsettlementDispatchApi";
import { MENU_CODE } from "./UnsettlementDispatch";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { UnsettlementDispatchModel, GridKey } from "./UnsettlementDispatchModel";

interface Args {
  model: UnsettlementDispatchModel;
}

export function useUnsettlementDispatchController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // 메인 조회 — SearchFilters 가 넘기는 params 그대로 전달
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // 조회 콜백 — 메인 그리드에 결과 set
  // 서버 onMainInfoCallback 은 DSPCH_NO 기준 행 선택 유지 로직 — base 가 __rid__ 로 자동 처리
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
