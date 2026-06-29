import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { orderMonitorApi as api } from "./OrderMonitorApi";
import { MENU_CODE } from "./OrderMonitor";
import type { OrderMonitorModel, GridKey } from "./OrderMonitorModel";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: OrderMonitorModel;
}

export function useOrderMonitorController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 메인 조회 ─────────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getMainList(params),
    [],
  );

  // 비용계산식(sub01) 조회 — SHPM_NO 기준
  const fetchSub01 = useCallback(
    (main: any) => api.getSub01List({ SHPM_NO: main?.SHPM_NO }),
    [],
  );

  // 비용조건(sub02) 조회 — DSPCH_NO / AP_TP(=AP_PROC_TP) 기준
  const fetchSub02 = useCallback(
    (sub01: any) =>
      api.getSub02List({
        DSPCH_NO: sub01?.DSPCH_NO,
        AP_TP: sub01?.AP_PROC_TP,
      }),
    [],
  );

  // ── 조회 콜백 — main set + 첫 행 자동 선택(→ sub01 cascade) ─────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      base.resetGrids(["sub01", "sub02"]);
      const first = data?.rows?.[0];
      if (first) onMainGridClick(first);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, model.grids.main],
  );

  // 메인 클릭 → sub01 cascade (sub02 reset)
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [{ to: "sub01", fetch: fetchSub01 }],
        { alsoReset: ["sub02"] },
      ),
    [base, fetchSub01],
  );

  // sub01 클릭 → sub02 cascade
  const onSub01GridClick = useCallback(
    (row: any) =>
      base.handleRowClick("sub01", row, [{ to: "sub02", fetch: fetchSub02 }]),
    [base, fetchSub02],
  );

  // ── 그리드별 액션 (모니터링 — main 엑셀만) ─────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getMainList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    mainActions,
  };
}
