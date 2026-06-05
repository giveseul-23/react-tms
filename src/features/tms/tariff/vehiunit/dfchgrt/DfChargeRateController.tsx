import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dfChargeRateApi as api } from "./DfChargeRateApi";
import { MENU_CODE } from "./DfChargeRate";
import {
  makeAddAction,
  makeCommonActions,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DfChargeRateModel, GridKey } from "./DfChargeRateModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: DfChargeRateModel;
}

export function useDfChargeRateController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // rtItem 행 클릭 → rtItemVehTp + rtItemVeh 동시 fetch
  const onRtItemRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("rtItem", row, [
        {
          to: "rtItemVehTp",
          fetch: (r) =>
            api.getRateItmVehTypeList({ TRF_CD: r.TRF_CD, CHG_CD: r.CHG_CD }),
        },
        {
          to: "rtItemVeh",
          fetch: (r) =>
            api.getRateItmVehList({ TRF_CD: r.TRF_CD, CHG_CD: r.CHG_CD }),
        },
      ]),
    [base],
  );

  // main 클릭 → rtItem + rtCarr + rtVehTp 동시 fetch + rtItem 첫 행 cascade
  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids([
        "rtItem",
        "rtCarr",
        "rtVehTp",
        "rtItemVehTp",
        "rtItemVeh",
      ]);
      if (!row) return;
      const [itemRows] = await Promise.all([
        base.searchSub("rtItem", api.getRateItemList({ TRF_CD: row.TRF_CD })),
        base.searchSub("rtCarr", api.getRateCarrList({ TRF_CD: row.TRF_CD })),
        base.searchSub("rtVehTp", api.getRateVehTpList({ TRF_CD: row.TRF_CD })),
      ]);
      if (itemRows[0]) onRtItemRowClicked(itemRows[0]);
    },
    [model, base, onRtItemRowClicked],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const handleDetailAdd = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) return;
    base.addRow("rtItem", { XXX_CD: main.XXX_CD });
  }, [model, base]);

  const handleDetailSave = useCallback(() => {
    const rows = model.grids.rtItem.ref.current?.rows ?? [];
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) return;
    api.save({ dsSave: dirty }).then(() => base.search());
  }, [model, base]);

  const mainActions: ActionItem[] = useMemo(
    () =>
      makeCommonActions({
        add: true,
        save: true,
        excel: {
          excelColumns: () => model.grids.main.getExcelColumns(),
          menuCode: MENU_CODE,
          menuName: menuName,
          fetchFn: () => api.getList(model.filtersRef.current),
          rows: model.grids.main.rows,
        },
      }),
    [menuName, model.filtersRef, model.grids.main],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleDetailAdd }),
      makeSaveAction({ onClick: handleDetailSave }),
    ],
    [handleDetailAdd, handleDetailSave],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onRtItemRowClicked,
    mainActions,
    detailActions,
  };
}
