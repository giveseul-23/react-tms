import { useCallback, useMemo, useRef } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

import { dispathApDetailApi as api } from "./DispathApDetailApi";
import { MENU_CODE } from "./DispathApDetail";
import { MAIN_HEAD, MAIN_TAIL, buildDispathApColumns } from "./DispathApDetailColumns";
import type { DispathApDetailModel, GridKey } from "./DispathApDetailModel";

interface Args {
  model: DispathApDetailModel;
}

export function useDispathApDetailController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // dynamicColumns 캐시 (센차 me.dynamicColumns)
  const chgListRef = useRef<any[]>([]);

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const srch = model.rawFiltersRef.current ?? {};

      // 센차 getBodyColumnList: searchChgCd 로 동적 비용 컬럼 메타 조회 후 컬럼 재생성
      try {
        const chgRes: any = await api.searchChgCd({
          DIV_CD: srch["A.DIV_CD"] ?? srch.DIV_CD ?? "",
          LGST_GRP_CD: srch["A.LGST_GRP_CD"] ?? srch.LGST_GRP_CD ?? "",
          FRM_DLVRY_DT: srch.SRCH_A_DLVRY_DT_FROM ?? "",
          TO_DLVRY_DT: srch.SRCH_A_DLVRY_DT_TO ?? "",
          PAY_CARR_CD: srch.SRCH_A_PAY_CARR_CD ?? "",
        });
        const chgList = chgRes?.data?.dsOut ?? chgRes?.data?.data?.dsOut ?? [];
        chgListRef.current = chgList;
        model.setMainColumnDefs(
          buildDispathApColumns(MAIN_HEAD, MAIN_TAIL, chgList),
        );
      } catch (err) {
        console.error("searchChgCd failed", err);
        chgListRef.current = [];
      }

      return api.getList({ dynamicColumns: chgListRef.current, ...params });
    },
    [model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  // 센차 onMainGridClick — 선택만 (cascade 없음)
  const onMainGridClick = useCallback(
    (row: any) => base.handleRowClick("main", row),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.filtersRef, model.grids.main],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
