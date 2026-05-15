import { useCallback, useMemo, MutableRefObject } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { tempOilPriceApi as api } from "./TempOilPriceApi";
import {
  OIL_PRICE_COLUMN_DEFS,
  PERIOD_COLUMN_DEFS,
} from "./TempOilPriceColumns";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeCommonActions,
} from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { TempOilPriceModel, GridKey } from "./TempOilPriceModel";

interface Args {
  model: TempOilPriceModel;
  activeTabRef: MutableRefObject<string>;
}

export function useTempOilPriceController({ model, activeTabRef }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      if (activeTabRef.current === "PERIOD") {
        return api.getTempOilPriceByPeriod(params);
      }
      return api.getList(params);
    },
    [activeTabRef],
  );

  const onMasterRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("master", row, [
        {
          to: "oilPrice",
          fetch: (r) => api.getTempOilPrice({ LGST_GRP_CD: r.LGST_GRP_CD }),
        },
      ]),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      if (activeTabRef.current === "PERIOD") {
        model.grids.period.setData(data);
        return;
      }
      model.grids.master.setData(data);
      onMasterRowClicked(data?.rows?.[0]);
    },
    [model, activeTabRef, onMasterRowClicked],
  );

  const handleOilPriceAdd = useCallback(() => {
    const main = model.grids.master.selectedRef.current;
    if (!main) return;
    base.addRow("oilPrice", {
      LGST_GRP_CD: main.LGST_GRP_CD,
      LGST_GRP_NM: main.LGST_GRP_NM,
    });
  }, [model, base]);

  const handleOilPriceSave = useCallback(() => {
    const rows = model.grids.oilPrice.ref.current?.rows ?? [];
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) return;
    api.save({ dsSave: dirty }).then(() => base.search());
  }, [model, base]);

  const oilPriceActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleOilPriceAdd }),
      makeSaveAction({ onClick: handleOilPriceSave }),
      makeExcelGroupAction({
        columns: OIL_PRICE_COLUMN_DEFS,
        menuName: "용차유가관리",
        fetchFn: () => api.getTempOilPrice(model.filtersRef.current),
        rows: model.grids.oilPrice.rows,
      }),
    ],
    [handleOilPriceAdd, handleOilPriceSave, model],
  );

  const masterActions: ActionItem[] = useMemo(() => [], []);

  const periodActions: ActionItem[] = useMemo(
    () =>
      makeCommonActions({
        excel: {
          columns: PERIOD_COLUMN_DEFS,
          menuName: "용차유가 기간별조회",
          fetchFn: () =>
            api.getTempOilPriceByPeriod(model.filtersRef.current),
          rows: model.grids.period.rows,
        },
      }),
    [model],
  );

  return {
    fetchList,
    onSearchCallback,
    onMasterRowClicked,
    masterActions,
    oilPriceActions,
    periodActions,
  };
}
