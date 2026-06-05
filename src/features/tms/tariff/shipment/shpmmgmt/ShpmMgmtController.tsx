import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { shpmMgmtApi as api } from "./ShpmMgmtApi";
import { MENU_CODE } from "./ShpmMgmt";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ShpmMgmtModel, GridKey } from "./ShpmMgmtModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: ShpmMgmtModel;
}

export function useShpmMgmtController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // zone 행 클릭 → rate + zoneCond 동시 fetch
  const onZoneRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("zone", row, [
        {
          to: "rate",
          fetch: (r) => api.getRateList({ LANE_ID: r.LANE_ID }),
        },
        {
          to: "zoneCond",
          fetch: (r) => api.getZoneCondList({ LANE_ID: r.LANE_ID }),
        },
      ]),
    [base],
  );

  // lgst 행 클릭 → zone fetch + 첫 행 cascade
  const onLgstRowClicked = useCallback(
    async (row: any) => {
      model.grids.lgst.setSelected(row);
      base.resetGrids(["zone", "rate", "zoneCond"]);
      if (!row) return;
      const zoneRows = await base.searchSub(
        "zone",
        api.getZoneList({
          TRF_CD: row.TRF_CD,
          LGST_GRP_CD: row.LGST_GRP_CD,
          CHG_CD: row.CHG_CD,
        }),
      );
      if (zoneRows[0]) onZoneRowClicked(zoneRows[0]);
    },
    [model, base, onZoneRowClicked],
  );

  // main 행 클릭 → lgst fetch + 첫 행 cascade
  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["lgst", "zone", "rate", "zoneCond"]);
      if (!row) return;
      const lgstRows = await base.searchSub(
        "lgst",
        api.getLgstList({ TRF_CD: row.TRF_CD }),
      );
      if (lgstRows[0]) onLgstRowClicked(lgstRows[0]);
    },
    [model, base, onLgstRowClicked],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const handleDetail01Add = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) return;
    base.addRow("lgst", { XXX_CD: main.XXX_CD });
  }, [model, base]);

  const handleDetail01Save = useCallback(() => {
    const rows = model.grids.lgst.ref.current?.rows ?? [];
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) return;
    api.save({ dsSave: dirty }).then(() => base.search());
  }, [model, base]);

  const handleDetail02Save = useCallback(() => {
    const rows = model.grids.zone.ref.current?.rows ?? [];
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) return;
    api.save({ dsSave: dirty }).then(() => base.search());
  }, [model, base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BUTTON_COPY_CONTRACT",
        label: "BUTTON_COPY_CONTRACT",
        onClick: () => {},
      },
      makeAddAction(),
      makeSaveAction(),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model],
  );

  const detail01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleDetail01Add }),
      makeSaveAction({ onClick: handleDetail01Save }),
    ],
    [handleDetail01Add, handleDetail01Save],
  );

  const detail02Actions: ActionItem[] = useMemo(
    () => [makeSaveAction({ onClick: handleDetail02Save })],
    [handleDetail02Save],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onLgstRowClicked,
    onZoneRowClicked,
    mainActions,
    detail01Actions,
    detail02Actions,
  };
}
