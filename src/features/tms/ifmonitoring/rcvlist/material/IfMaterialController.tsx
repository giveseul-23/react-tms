import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { Lang } from "@/app/services/common/Lang";
import { ifMaterialApi as api } from "./IfMaterialApi";
import { MENU_CODE } from "./IfMaterial";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { GridKey, IfMaterialModel } from "./IfMaterialModel";

interface Args {
  model: IfMaterialModel;
}

const buildSubParams = (row: any) => ({
  IF_ID: row.IF_ID,
  ITEM_CD: row.ITEM_CD,
  CRE_DTTM: row.CRE_DTTM,
});

export function useIfMaterialController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      if (!row || String(row.rowStatus ?? "").trim() === "I") {
        return;
      }

      base.handleRowClick("main", row, [
        {
          to: "sub01",
          fetch: (r) => api.searchPlant(buildSubParams(r)),
        },
        {
          to: "sub02",
          fetch: (r) => api.searchSales(buildSubParams(r)),
        },
        {
          to: "sub03",
          fetch: (r) => api.searchUom(buildSubParams(r)),
        },
      ]);
    },
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      base.resetGrids(["sub01", "sub02", "sub03"]);
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [base, model.grids.main, onMainGridClick],
  );

  const onReProcess = useCallback(
    (e?: any) => {
      const selectedRows = Array.isArray(e?.data)
        ? e.data
        : e?.data
          ? [e.data]
          : [];

      if (selectedRows.length === 0) {
        showInfoModal(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }

      for (const row of selectedRows) {
        const ifId = String(row.IF_ID ?? "");

        if (row.IF_PRCS_STS === "R") {
          showInfoModal(Lang.get("LBL_ALREADY_RETRY", ifId));
          return;
        }

        if (row.IF_PRCS_STS !== "E") {
          showInfoModal(Lang.get("MSG_ALREADY_SUCCESS", ifId));
          return;
        }
      }

      base
        .callAjax(
          api.reprocess({
            dsSave: selectedRows,
          }),
          { successMsg: "MSG_SAVE_CMPLT", mask: "main" },
        )
        .then(() => base.search());
    },
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_REPRO",
        label: "BTN_REPRO",
        onClick: onReProcess,
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, onReProcess],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
