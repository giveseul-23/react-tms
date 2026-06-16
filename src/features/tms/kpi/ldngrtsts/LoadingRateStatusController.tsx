import { useCallback, useRef, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { loadingRateStatusApi as api } from "./LoadingRateStatusApi";
import { MENU_CODE } from "./LoadingRateStatus";
import { buildMainColumns, buildDescText } from "./LoadingRateStatusColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { LoadingRateStatusModel, GridKey } from "./LoadingRateStatusModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: LoadingRateStatusModel;
}

export function useLoadingRateStatusController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  // PBOX_WGT_YN 체크박스 → 'Y' / 'N' 정규화 (서버 getPboxCond)
  const getPboxCond = useCallback(() => {
    const v = getSearch().SRCH_PBOX_WGT_YN;
    return v === true || v === "Y" ? "Y" : "N";
  }, [getSearch]);

  // 동적 컬럼 메타 캐시 (DIV_CD + LGST_GRP_CD 조합이 바뀔 때만 재조회)
  const vehTpCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  const loadVehTpMeta = useCallback(async () => {
    const s = getSearch();
    const divCd = s.SRCH_A_DIV_CD ?? "";
    const lgstGrpCd = s.SRCH_A_LGST_GRP_CD ?? "";
    const cacheKey = `${divCd}|${lgstGrpCd}`;
    if (vehTpCacheRef.current.key !== cacheKey) {
      const res: any = await api.getVehTpLgst({
        DIV_CD: divCd,
        LGST_GRP_CD: lgstGrpCd,
      });
      const list = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
      vehTpCacheRef.current = { key: cacheKey, list };
      model.setMainColumnDefs(buildMainColumns(list));
      model.setDescText(buildDescText(list));
    }
    return vehTpCacheRef.current.list;
  }, [getSearch, model]);

  // ── 메인 조회 — 차량유형 메타로 컬럼 재생성 후 일자별 적재율 조회 ──
  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const dynamicColumns = await loadVehTpMeta();
      return api.getMainList({
        ...params,
        dynamicColumns,
        PBOX_WGT_YN: getPboxCond(),
      });
    },
    [loadVehTpMeta, getPboxCond],
  );

  // ── 조회 콜백 — 메인 set 후 하위 그리드 초기화 ────────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      base.resetGrids(["sub01", "sub02"]);
    },
    [base, model.grids.main],
  );

  // ── 메인 클릭 → 차량유형별 요약(sub01) 조회 ───────────────────────
  const onMainGridClick = useCallback(
    (row: any) => {
      base.handleRowClick("main", row, [
        {
          to: "sub01",
          fetch: () => {
            const s = getSearch();
            return api.getSub01List({
              DLVRY_DT: row?.DLVRY_DT,
              DIV_CD: s.SRCH_A_DIV_CD ?? "",
              LGST_GRP_CD: s.SRCH_A_LGST_GRP_CD ?? "",
              PBOX_WGT_YN: getPboxCond(),
              dynamicColumns: vehTpCacheRef.current.list,
              VEH_OP_TP: s.SRCH_VEH_OP_TP ?? "",
            });
          },
        },
      ]);
    },
    [base, getSearch, getPboxCond],
  );

  // ── sub01 클릭 → 차량단위 상세(sub02) 조회 ────────────────────────
  const onSub01GridClick = useCallback(
    (row: any) => {
      base.handleRowClick("sub01", row, [
        {
          to: "sub02",
          fetch: () => {
            const s = getSearch();
            return api.getSub02List({
              DLVRY_DT: row?.DLVRY_DT,
              DIV_CD: s.SRCH_A_DIV_CD ?? "",
              LGST_GRP_CD: s.SRCH_A_LGST_GRP_CD ?? "",
              VEH_TP_CD: row?.VEH_TP_CD,
              PBOX_WGT_YN: getPboxCond(),
              VEH_OP_TP: s.SRCH_VEH_OP_TP ?? "",
            });
          },
        },
      ]);
    },
    [base, getSearch, getPboxCond],
  );

  // ── 그리드별 액션 (엑셀) ──────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => fetchList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, fetchList],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getSub01List(model.filtersRef.current),
        rows: model.grids.sub01.rows,
      }),
    ],
    [menuName, model.grids.sub01, model.filtersRef],
  );

  // sub02 엑셀 — 보이는/조회데이터 + 전체데이터(searchAllData)
  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getAllData(model.filtersRef.current),
        rows: model.grids.sub02.rows,
      }),
    ],
    [menuName, model.grids.sub02, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    mainActions,
    sub01Actions,
    sub02Actions,
  };
}
