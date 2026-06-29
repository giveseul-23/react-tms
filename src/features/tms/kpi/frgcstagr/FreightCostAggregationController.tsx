import { useCallback, useMemo, useRef } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { freightCostAggregationApi as api } from "./FreightCostAggregationApi";
import { MENU_CODE } from "./FreightCostAggregation";
import {
  MAIN_HEAD,
  MAIN_TAIL,
  buildFreightColumns,
} from "./FreightCostAggregationColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  FreightCostAggregationModel,
  GridKey,
} from "./FreightCostAggregationModel";

interface Args {
  model: FreightCostAggregationModel;
}

export function useFreightCostAggregationController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  // 동적 BODY 컬럼 캐시 — LGST_GRP_CD 가 바뀔 때만 재조회
  const chgCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  // ── 메인 조회 — 요금코드 메타로 동적 컬럼 재생성 후 조회 ───────────
  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const s = getSearch();
      const lgstGrpCd = s.SRCH_DSP_LGST_GRP_CD ?? "";

      if (chgCacheRef.current.key !== lgstGrpCd) {
        try {
          const chgRes: any = await api.getChargeCode({
            LGST_GRP_CD: lgstGrpCd,
          });
          const chgList =
            chgRes?.data?.result ?? chgRes?.data?.data?.dsOut ?? [];
          chgCacheRef.current = { key: lgstGrpCd, list: chgList };
          model.setMainColumnDefs(
            buildFreightColumns(MAIN_HEAD, MAIN_TAIL, chgList),
          );
        } catch (err) {
          console.error("getChargeCodeCfWithoutLgst failed", err);
        }
      }

      // 차량 표시값이 '모두' 면 VEH_NO 미전송 (서버 onSaveAfterSearch)
      const vehNo =
        s.SRCH_DSP_VEH_ID_NM === "모두" ? null : (s.SRCH_DSP_VEH_ID_NM ?? null);

      return api.getList({
        AP_PROC_TP: s.SRCH_AP_PROC_TP ?? "",
        ZERO_INCLD: s.SRCH_ZERO_INCLD ?? "",
        VEH_NO: vehNo,
        ...params,
      });
    },
    [getSearch, model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  // ── 액션: 엑셀 다운로드 ───────────────────────────────────────────
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

  return { fetchList, onSearchCallback, mainActions };
}
