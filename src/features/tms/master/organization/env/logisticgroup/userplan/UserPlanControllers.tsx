import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { userPlanApi } from "./UserPlanApi";
import { MENU_CD, AUTH } from "./UserPlan";
import type { UserPlanModel, GridKey } from "./UserPlanModel";

interface Args {
  model: UserPlanModel;
}

export function useUserPlanController({ model }: Args) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) => userPlanApi.getUserPlanList(MENU_CD, params),
      save: userPlanApi.save,
    },
  });
  const { menuName } = useMenuMeta();

  const onAdd = useCallback(() => base.addRow("main", {}), [base]);
  const onSave = useCallback(
    () => base.saveGrid("main", userPlanApi.save),
    [base],
  );

  // 추가 / 저장 / 엑셀 — 공통 팩토리(makeCommonActions).
  const mainActions = useMemo(
    () => [
      makeAddAction({ onClick: onAdd }),
      makeSaveAction({ onClick: onSave }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () =>
          userPlanApi.getUserPlanList(MENU_CD, model.filtersRef.current),
        rows: model.grids.main.rows,
        upload: { gridId: AUTH.grids.main, onUploaded: () => base.search() },
        templateDownload: { gridId: AUTH.grids.main },
      }),
    ],
    [onAdd, onSave, menuName, model.grids.main, model.filtersRef, base],
  );

  return { ...base, mainActions };
}
