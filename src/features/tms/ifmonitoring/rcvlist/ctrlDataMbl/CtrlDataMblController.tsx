import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { Lang } from "@/app/services/common/Lang";
import { ctrlDataMblApi as api } from "./CtrlDataMblApi";
import { MENU_CODE } from "./CtrlDataMbl";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { CtrlDataMblModel, GridKey } from "./CtrlDataMblModel";

interface Args {
  model: CtrlDataMblModel;
}

export function useCtrlDataMblController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      base.handleRowClick("main", row);
    },
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
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
            dsSave: selectedRows.map((r: any) => ({ ...r, rowStatus: "U" })),
          }),
          "MSG_SAVE_CMPLT",
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
        rows: model.grids.main.rows,
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
