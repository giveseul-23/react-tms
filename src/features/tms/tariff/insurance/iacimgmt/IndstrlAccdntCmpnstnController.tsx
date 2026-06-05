import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { indstrlAccdntCmpnstnApi as api } from "./IndstrlAccdntCmpnstnApi";
import { MENU_CODE } from "./IndstrlAccdntCmpnstn";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  IndstrlAccdntCmpnstnModel,
  GridKey,
} from "./IndstrlAccdntCmpnstnModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: IndstrlAccdntCmpnstnModel;
}

export function useIndstrlAccdntCmpnstnController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onRateRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("rate", row, [
        {
          to: "chg",
          fetch: (r) =>
            api.getChgList({
              INSRNC_ID: r.INSRNC_ID,
              AP_PROC_TP: r.AP_PROC_TP,
            }),
        },
      ]),
    [base],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["rate", "chg"]);
      if (!row) return;
      const rateRows = await base.searchSub(
        "rate",
        api.getRateList({ DIV_CD: row.DIV_CD, LGST_GRP_CD: row.LGST_GRP_CD }),
      );
      if (rateRows[0]) onRateRowClicked(rateRows[0]);
    },
    [model, base, onRateRowClicked],
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
    base.addRow("rate", { XXX_CD: main.XXX_CD });
  }, [model, base]);

  const handleDetailSave = useCallback(() => {
    const rows = model.grids.rate.ref.current?.rows ?? [];
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) return;
    api.save({ dsSave: dirty }).then(() => base.search());
  }, [model, base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_DF_CREATE",
        label: "BTN_DF_CREATE",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_TEMP_AP_CREATE",
        label: "BTN_TEMP_AP_CREATE",
        onClick: () => {},
      },
    ],
    [],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleDetailAdd }),
      makeSaveAction({ onClick: handleDetailSave }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.rate.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getRateList(model.filtersRef.current),
        rows: model.grids.rate.rows,
      }),
    ],
    [
      handleDetailAdd,
      handleDetailSave,
      menuName,
      model.filtersRef,
      model.grids.rate,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onRateRowClicked,
    mainActions,
    detailActions,
  };
}
