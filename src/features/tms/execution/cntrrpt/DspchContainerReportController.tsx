import { useCallback, useMemo, useState } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { dspchContainerReportApi as api } from "./DspchContainerReportApi";
import { MENU_CODE } from "./DspchContainerReport";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DspchContainerReportModel, GridKey } from "./DspchContainerReportModel";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  buildMainColumnDefs,
  buildSub01ColumnDefs,
  buildSub02ColumnDefs,
} from "./DspchContainerReportColumns";

interface Args {
  model: DspchContainerReportModel;
}

type ReportTab = "DAY" | "LOC" | "VEH";

export function useDspchContainerReportController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const [activeTab, setActiveTab] = useState<ReportTab>("DAY");
  const [mainColumnDefs, setMainColumnDefs] = useState<any[]>(MAIN_COLUMN_DEFS);
  const [sub01ColumnDefs, setSub01ColumnDefs] = useState<any[]>(SUB01_COLUMN_DEFS);
  const [sub02ColumnDefs, setSub02ColumnDefs] = useState<any[]>(SUB02_COLUMN_DEFS);

  const getLgstGrpCd = useCallback(
    (params: Record<string, unknown> = {}) => {
      const raw = (model.rawFiltersRef.current ?? {}) as Record<string, any>;
      return String(
        raw.SRCH_A_LGST_GRP_CD ??
          raw.LGST_GRP_CD ??
          params.SRCH_A_LGST_GRP_CD ??
          params.LGST_GRP_CD ??
          "",
      );
    },
    [model.rawFiltersRef],
  );

  const withLgstGrpCd = useCallback(
    (params: Record<string, unknown> = {}) => ({
      ...params,
      LGST_GRP_CD: getLgstGrpCd(params),
    }),
    [getLgstGrpCd],
  );

  const refreshContainerColumns = useCallback(
    async (params: Record<string, unknown> = {}) => {
      const lgstGrpCd = getLgstGrpCd(params);
      const cntrRes = lgstGrpCd
        ? await api.searchLgstGrpCntr({ LGST_GRP_CD: lgstGrpCd })
        : null;
      const containers = cntrRes?.data?.data?.dsOut ?? cntrRes?.data?.result ?? [];
      setMainColumnDefs(buildMainColumnDefs(containers));
      setSub01ColumnDefs(buildSub01ColumnDefs(containers));
      setSub02ColumnDefs(buildSub02ColumnDefs(containers));
    },
    [getLgstGrpCd],
  );

  // ── 메인(일자별) 조회 ──────────────────────────────────────────
  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      await refreshContainerColumns(params);
      const searchParams = withLgstGrpCd(params);
      if (activeTab === "LOC") return api.getSub01List(searchParams);
      if (activeTab === "VEH") return api.getSub02List(searchParams);
      return api.getMainList(searchParams);
    },
    [activeTab, refreshContainerColumns, withLgstGrpCd],
  );

  // ── 조회 콜백 — 현재 선택된 탭 결과만 반영 ──
  const onSearchCallback = useCallback(
    (data: any) => {
      if (activeTab === "LOC") {
        model.grids.sub01.setData(data);
      } else if (activeTab === "VEH") {
        model.grids.sub02.setData(data);
      } else {
        model.grids.main.setData(data);
      }
    },
    [activeTab, model.grids.main, model.grids.sub01, model.grids.sub02],
  );

  // ── 그리드별 액션 (엑셀만) ─────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: async () => {
          await refreshContainerColumns(model.filtersRef.current);
          return api.getMainList(model.filtersRef.current);
        },
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, refreshContainerColumns],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: async () => {
          await refreshContainerColumns(model.filtersRef.current);
          return api.getSub01List(model.filtersRef.current);
        },
        rows: () => model.grids.sub01.rows,
      }),
    ],
    [menuName, model.grids.sub01, model.filtersRef, refreshContainerColumns],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: async () => {
          await refreshContainerColumns(model.filtersRef.current);
          return api.getSub02List(model.filtersRef.current);
        },
        rows: () => model.grids.sub02.rows,
      }),
    ],
    [menuName, model.grids.sub02, model.filtersRef, refreshContainerColumns],
  );

  // ── 탭 변경 — 해당 탭 그리드만 재조회 (서버 onTabChange) ─────────
  const onTabChange = useCallback(
    (key: string) => {
      if (key !== "DAY" && key !== "LOC" && key !== "VEH") return;
      setActiveTab(key);

      const filters = withLgstGrpCd(model.filtersRef.current);
      void refreshContainerColumns(filters).then(() => {
        if (key === "DAY") {
          return base.searchSub("main", api.getMainList(filters));
        }
        if (key === "LOC") {
          return base.searchSub("sub01", api.getSub01List(filters));
        }
        return base.searchSub("sub02", api.getSub02List(filters));
      });
    },
    [base, model.filtersRef, refreshContainerColumns, withLgstGrpCd],
  );

  return {
    fetchList,
    onSearchCallback,
    onTabChange,
    activeTab,
    mainActions,
    sub01Actions,
    sub02Actions,
    mainColumnDefs,
    sub01ColumnDefs,
    sub02ColumnDefs,
  };
}
