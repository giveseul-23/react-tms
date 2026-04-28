import { useCallback, MutableRefObject } from "react";
import { ifDeliveryDocumentApi } from "./IfDeliveryDocumentApi";
import { IfDeliveryDocumentModel } from "./IfDeliveryDocumentModel";
import { MAIN_COLUMN_DEFS } from "./IfDeliveryDocumentColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: IfDeliveryDocumentModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useIfDeliveryDocumentController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      ifDeliveryDocumentApi.getList({ userTz: "Asia/Seoul", ...params }),
    [],
  );

  const fetchDetail = useCallback((row: any) => {
    if (!row) return Promise.resolve([]);
    return ifDeliveryDocumentApi
      .getDetailList({ IF_ID: row.IF_ID, ORD_NO: row.ORD_NO })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      fetchDetail(row).then((rows: any) => model.setDetailRowData(rows));
    },
    [model, fetchDetail],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
      handleRowClicked(data.rows?.[0]);
    },
    [model, handleRowClicked],
  );

  const mainActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_REPRO",
      label: "BTN_REPRO",
      onClick: () => {
        ifDeliveryDocumentApi
          .reprocess(filtersRef.current)
          .then(() => searchRef.current?.());
      },
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "판매문서수신내역",
      fetchFn: () => ifDeliveryDocumentApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const detailActions: any[] = [];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    detailActions,
  };
}
