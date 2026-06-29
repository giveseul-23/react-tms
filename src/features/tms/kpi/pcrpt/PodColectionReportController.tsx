import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { podColectionReportApi as api } from "./PodColectionReportApi";
import { MENU_CODE } from "./PodColectionReport";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { PodColectionReportModel, GridKey } from "./PodColectionReportModel";

interface Args {
  model: PodColectionReportModel;
}

function pick(raw: Record<string, any>, ...keys: string[]): string {
  for (const k of keys) {
    const v = raw?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "")
      return String(v).trim();
  }
  return "";
}

function toYmdCompact(v: unknown): string {
  return String(v ?? "").replace(/-/g, "").slice(0, 8);
}

// 서버 getParamsForSubGridSelect 대응 — 클릭한 행에서 하위 그리드 조회 파라미터 추출
const sub01Params = (r: any) => ({
  CARR_CD: r?.CARR_CD ?? "",
  LGST_GRP_CD: r?.LGST_GRP_CD ?? "",
  DLVRY_DT_FR: r?.DLVRY_DT_FR ?? "",
  DLVRY_DT_TO: r?.DLVRY_DT_TO ?? "",
});
const sub02Params = (r: any) => ({
  CARR_CD: r?.CARR_CD ?? "",
  LGST_GRP_CD: r?.LGST_GRP_CD ?? "",
  DLVRY_DT: r?.DLVRY_DT ?? "",
});

export function usePodColectionReportController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // 센차 onSearch 대응 — 조회조건에서 DLVRY_DT_FR/TO, CARR_CD 추출
  const getSearchParams = useCallback(() => {
    const s = model.rawFiltersRef.current ?? {};
    return {
      DLVRY_DT_FR: toYmdCompact(
        pick(
          s,
          "SRCH_DLVRY_DT_FRM",
          "SRCH_DLVRY_DT_FROM",
          "DLVRY_DT_FR",
        ),
      ),
      DLVRY_DT_TO: toYmdCompact(
        pick(s, "SRCH_DLVRY_DT_TO", "DLVRY_DT_TO"),
      ),
      CARR_CD: pick(s, "SRCH_CARR_CD", "CARR_CD"),
    };
  }, [model.rawFiltersRef]);

  // ── 메인 조회 — 물류운영그룹단위 ──────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      api.getMainList({ ...params, ...getSearchParams() }),
    [getSearchParams],
  );

  // sub01 클릭 → sub02 조회
  const onSub01GridClick = useCallback(
    (row: any) => {
      if (!row) {
        base.resetGrids(["sub02"]);
        return;
      }
      base.handleRowClick("sub01", row, [
        { to: "sub02", fetch: (r) => api.getSub02List(sub02Params(r)) },
      ]);
    },
    [base],
  );

  // sub01 결과 set 후 첫 행 자동 선택 → sub02 조회 (서버 onSub01InfoCallback)
  const loadSub01 = useCallback(
    async (mainRow: any) => {
      const rows = await base.searchSub(
        "sub01",
        api.getSub01List(sub01Params(mainRow)),
      );
      onSub01GridClick(rows?.[0]);
    },
    [base, onSub01GridClick],
  );

  // 메인 클릭 → sub01 조회 (sub02 reset)
  const onMainGridClick = useCallback(
    (row: any) => {
      if (!row) {
        base.resetGrids(["sub01", "sub02"]);
        return;
      }
      base.handleRowClick("main", row, undefined, {
        alsoReset: ["sub01", "sub02"],
      });
      void loadSub01(row);
    },
    [base, loadSub01],
  );

  // ── 조회 콜백 — 메인 set + 첫 행 자동 선택 → cascade ───────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 그리드별 액션 (엑셀 다운로드만) ───────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.getMainList({
            ...model.filtersRef.current,
            ...getSearchParams(),
          }),
        rows: () => model.grids.main.rows,
      }),
    ],
    [getSearchParams, menuName, model.filtersRef, model.grids.main],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.getSub01List(sub01Params(model.grids.main.selectedRef.current)),
        rows: () => model.grids.sub01.rows,
      }),
    ],
    [menuName, model.grids.main.selectedRef, model.grids.sub01],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.getSub02List(sub02Params(model.grids.sub01.selectedRef.current)),
        rows: () => model.grids.sub02.rows,
      }),
    ],
    [menuName, model.grids.sub01.selectedRef, model.grids.sub02],
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
