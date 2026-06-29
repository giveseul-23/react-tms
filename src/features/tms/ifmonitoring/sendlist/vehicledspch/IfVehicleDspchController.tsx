import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { Lang } from "@/app/services/common/Lang";
import { ifVehicleDspchApi as api } from "./IfVehicleDspchApi";
import { MENU_CODE } from "./IfVehicleDspch";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { GridKey, IfVehicleDspchModel } from "./IfVehicleDspchModel";

interface Args {
  model: IfVehicleDspchModel;
}

export function useIfVehicleDspchController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(() => {}, []);

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
    },
    [model.grids.main],
  );

  const onReprocess = useCallback(
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
        if (row.IF_PRCS_STS !== "E") {
          showInfoModal(
            Lang.get("MSG_ALREADY_SUCCESS", String(row.IF_ID ?? "")),
          );
          return;
        }
      }

      base
        .callAjax(
          api.reprocess({
            dsSave: selectedRows.map((row: any) => ({
              ...row,
              rowStatus: "U",
            })),
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
        onClick: onReprocess,
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, onReprocess],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
