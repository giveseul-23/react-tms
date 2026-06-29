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

function buildChgCdCacheKey(srch: Record<string, string>): string {
  return [
    srch.SRCH_A_DIV_CD ?? "",
    srch.SRCH_A_LGST_GRP_CD ?? "",
    srch.SRCH_A_DLVRY_DT_FROM ?? "",
    srch.SRCH_A_DLVRY_DT_TO ?? "",
    srch.SRCH_A_PAY_CARR_CD ?? "",
  ].join("|");
}

function buildChgCdParams(srch: Record<string, string>) {
  return {
    DIV_CD: srch.SRCH_A_DIV_CD ?? "",
    LGST_GRP_CD: srch.SRCH_A_LGST_GRP_CD ?? "",
    FRM_DLVRY_DT: srch.SRCH_A_DLVRY_DT_FROM ?? "",
    TO_DLVRY_DT: srch.SRCH_A_DLVRY_DT_TO ?? "",
    PAY_CARR_CD: srch.SRCH_A_PAY_CARR_CD ?? "",
  };
}

export function useDispathApDetailController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // dynamicColumns 캐시 (센차 me.dynamicColumns)
  const chgCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, string>,
    [model.rawFiltersRef],
  );

  const loadDynamicColumns = useCallback(
    async (srch: Record<string, string>) => {
      const cacheKey = buildChgCdCacheKey(srch);
      if (chgCacheRef.current.key === cacheKey) return;

      try {
        const chgRes: any = await api.searchChgCd(buildChgCdParams(srch));
        const chgList =
          chgRes?.data?.result ??
          chgRes?.data?.data?.dsOut ??
          chgRes?.data?.dsOut ??
          [];
        chgCacheRef.current = { key: cacheKey, list: chgList };
        model.setMainColumnDefs(
          buildDispathApColumns(MAIN_HEAD, MAIN_TAIL, chgList),
        );
      } catch (err) {
        console.error("searchChgCd failed", err);
        chgCacheRef.current = { key: cacheKey, list: [] };
        model.setMainColumnDefs(
          buildDispathApColumns(MAIN_HEAD, MAIN_TAIL, []),
        );
      }
    },
    [model],
  );

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const srch = getSearch();
      await loadDynamicColumns(srch);

      return api.getList({
        ...params,
        dynamicColumns: chgCacheRef.current.list,
      });
    },
    [getSearch, loadDynamicColumns],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const onMainGridClick = useCallback(
    (row: any) => base.handleRowClick("main", row),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        hideAll: true,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.getList({
            ...model.filtersRef.current,
            dynamicColumns: chgCacheRef.current.list,
          }),
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
