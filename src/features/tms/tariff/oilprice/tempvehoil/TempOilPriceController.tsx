import { useCallback, useMemo, MutableRefObject } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { tempOilPriceApi as api } from "./TempOilPriceApi";
import { MENU_CODE } from "./TempOilPrice";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeCommonActions,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { TempOilPriceModel, GridKey } from "./TempOilPriceModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: TempOilPriceModel;
  activeTabRef: MutableRefObject<string>;
}

export function useTempOilPriceController({ model, activeTabRef }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

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
        excelColumns: () => model.grids.oilPrice.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
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
          excelColumns: () => model.grids.period.getExcelColumns(),
          menuCode: MENU_CODE,
          menuName: menuName,
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
