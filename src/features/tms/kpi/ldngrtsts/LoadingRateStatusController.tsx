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

// 서버 getParamsForSubGridSelect / onMainGridClick·onSub01GridClick 대응
const sub01Params = (
  s: Record<string, any>,
  mainRow: any,
  pbox: string,
  dynamicColumns: any[],
) => ({
  DLVRY_DT: mainRow?.DLVRY_DT ?? "",
  DIV_CD: s.SRCH_A_DIV_CD ?? "",
  LGST_GRP_CD: s.SRCH_A_LGST_GRP_CD ?? "",
  PBOX_WGT_YN: pbox,
  dynamicColumns,
  VEH_OP_TP: s.SRCH_VEH_OP_TP ?? "",
});

const sub02Params = (
  s: Record<string, any>,
  sub01Row: any,
  mainRow: any,
  pbox: string,
) => ({
  DLVRY_DT: sub01Row?.DLVRY_DT ?? mainRow?.DLVRY_DT ?? "",
  DIV_CD: s.SRCH_A_DIV_CD ?? "",
  LGST_GRP_CD: s.SRCH_A_LGST_GRP_CD ?? "",
  VEH_TP_CD: sub01Row?.VEH_TP_CD ?? "",
  PBOX_WGT_YN: pbox,
  VEH_OP_TP: s.SRCH_VEH_OP_TP ?? "",
});

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
      if (!row) {
        base.resetGrids(["sub01", "sub02"]);
        return;
      }
      const s = getSearch();
      base.handleRowClick("main", row, [
        {
          to: "sub01",
          fetch: () =>
            api.getSub01List(
              sub01Params(
                s,
                row,
                getPboxCond(),
                vehTpCacheRef.current.list,
              ),
            ),
        },
      ]);
    },
    [base, getSearch, getPboxCond],
  );

  // ── sub01 클릭 → 차량단위 상세(sub02) 조회 ────────────────────────
  const onSub01GridClick = useCallback(
    (row: any) => {
      if (!row) {
        base.resetGrids(["sub02"]);
        return;
      }
      const s = getSearch();
      const mainRow = model.grids.main.selectedRef.current;
      base.handleRowClick("sub01", row, [
        {
          to: "sub02",
          fetch: () =>
            api.getSub02List(sub02Params(s, row, mainRow, getPboxCond())),
        },
      ]);
    },
    [base, getSearch, getPboxCond, model.grids.main.selectedRef],
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
        fetchFn: () => {
          const s = getSearch();
          return api.getSub01List(
            sub01Params(
              s,
              model.grids.main.selectedRef.current,
              getPboxCond(),
              vehTpCacheRef.current.list,
            ),
          );
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [getPboxCond, getSearch, menuName, model.grids.main.selectedRef, model.grids.sub01],
  );

  // sub02 엑셀 — 보이는/조회데이터 + 전체데이터(searchAllData)
  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.getAllData({
            ...model.filtersRef.current,
            PBOX_WGT_YN: getPboxCond(),
          }),
        rows: model.grids.sub02.rows,
      }),
    ],
    [getPboxCond, menuName, model.filtersRef, model.grids.sub02],
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
