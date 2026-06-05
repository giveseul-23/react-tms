import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { overheadTariffManagementApi as api } from "./OverheadTariffManagementApi";
import { MENU_CODE } from "./OverheadTariffManagement";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  OverheadTariffManagementModel,
  GridKey,
} from "./OverheadTariffManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: OverheadTariffManagementModel;
}

export function useOverheadTariffManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSubChgRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("subChg", row, [
        {
          to: "subChgDtl",
          fetch: (r) =>
            api.getSubChgDtlList({
              TRF_CD: r.TRF_CD,
              LGST_GRP_CD: r.LGST_GRP_CD,
            }),
        },
      ]),
    [base],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["subChg", "subChgDtl"]);
      if (!row) return;
      const subRows = await base.searchSub(
        "subChg",
        api.getSubChgList({ TRF_CD: row.TRF_CD }),
      );
      if (subRows[0]) onSubChgRowClicked(subRows[0]);
    },
    [model, base, onSubChgRowClicked],
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
    base.addRow("subChgDtl", { XXX_CD: main.XXX_CD });
  }, [model, base]);

  const handleDetailSave = useCallback(() => {
    const rows = model.grids.subChgDtl.ref.current?.rows ?? [];
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
    onSubChgRowClicked,
    mainActions,
    detailActions,
  };
}
