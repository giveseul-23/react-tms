import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { indstrlAccdntCmpnstnApi as api } from "./IndstrlAccdntCmpnstnApi";
import { MAIN_COLUMN_DEFS } from "./IndstrlAccdntCmpnstnColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { IndstrlAccdntCmpnstnModel, GridKey } from "./IndstrlAccdntCmpnstnModel";

interface Args {
  model: IndstrlAccdntCmpnstnModel;
}

export function useIndstrlAccdntCmpnstnController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

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
        key: "월대보험료등록",
        label: "월대보험료등록",
        onClick: () => {},
      },
      {
        type: "button",
        key: "용차/회당보험료등록",
        label: "용차/회당보험료등록",
        onClick: () => {},
      },
    ],
    [],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button" as const,
        key: "BTN_ADD",
        label: "BTN_ADD",
        onClick: handleDetailAdd,
      },
      {
        type: "button" as const,
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: handleDetailSave,
      },
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: "산재보험료관리",
        fetchFn: () => api.getRateList(model.filtersRef.current),
        rows: model.grids.rate.rows,
      }),
    ],
    [handleDetailAdd, handleDetailSave, model],
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
