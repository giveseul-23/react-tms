import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { ifDeliveryDocumentApi as api } from "./IfDeliveryDocumentApi";
import { MENU_CODE } from "./IfDeliveryDocument";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  IfDeliveryDocumentModel,
  GridKey,
} from "./IfDeliveryDocumentModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import { showInfoModal } from "@/app/components/popup/showInfoModal";

interface Args {
  model: IfDeliveryDocumentModel;
}

export function useIfDeliveryDocumentController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      if (!row) {
        base.resetGrids(["detail"]);
        return;
      }

      return base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) => api.getDetailList({ IF_ID: r.IF_ID, ORD_NO: r.ORD_NO }),
        },
      ]);
    },
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
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
        .callAjax(api.reprocess({ dsSave: selectedRows }), { successMsg: "MSG_SAVE_CMPLT", mask: "main" })
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
