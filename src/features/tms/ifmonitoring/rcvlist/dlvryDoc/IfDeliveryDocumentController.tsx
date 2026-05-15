import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { ifDeliveryDocumentApi as api } from "./IfDeliveryDocumentApi";
import { MAIN_COLUMN_DEFS } from "./IfDeliveryDocumentColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { IfDeliveryDocumentModel, GridKey } from "./IfDeliveryDocumentModel";

interface Args {
  model: IfDeliveryDocumentModel;
}

export function useIfDeliveryDocumentController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      api.getList({ userTz: "Asia/Seoul", ...params }),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) => api.getDetailList({ IF_ID: r.IF_ID, ORD_NO: r.ORD_NO }),
        },
      ]),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_REPRO",
        label: "BTN_REPRO",
        onClick: () => {
          base
            .callAjax(api.reprocess(model.filtersRef.current), "재처리되었습니다.")
            .then(() => base.search());
        },
      },
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: "판매문서수신내역",
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [model, base],
  );

  const detailActions: ActionItem[] = useMemo(() => [], []);

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
