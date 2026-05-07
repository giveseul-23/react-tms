import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { logisticGroupDefaultApi as api } from "./LogisticGroupDefaultApi";
import { CNFG_HEADER_COLUMN_DEFS } from "./LogisticGroupDefaultColumns";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";
import type { LogisticGroupDefaultModel, GridKey } from "./LogisticGroupDefaultModel";

interface Args {
  model: LogisticGroupDefaultModel;
}

export function useLogisticGroupDefaultController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getLgstDefaultCnfgGrpList(params),
    [],
  );

  // header 클릭 → subCnfg fetch (detail alsoReset)
  const onHeaderGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "header",
        row,
        [
          {
            to: "subCnfg",
            fetch: (r) =>
              api.getLgstDefaultCnfgList({
                LGST_GRP_CNFG_GRP_CD: r.LGST_GRP_CNFG_GRP_CD,
              }),
          },
        ],
        { alsoReset: ["detail"] },
      ),
    [base],
  );

  // subCnfg 클릭 → detail fetch
  const onSubCnfgGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("subCnfg", row, [
        {
          to: "detail",
          fetch: (r) => api.getLgstDefaultDetailList({ CNFG_CD: r.CNFG_CD }),
        },
      ]),
    [base],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.grids.header.setData(data);
      onHeaderGridClick(data?.rows?.[0]);
    },
    [model.grids.header, onHeaderGridClick],
  );

  const detailActions = useMemo(
    () => [
      makeSaveAction(),
      makeExcelGroupAction({
        columns: CNFG_HEADER_COLUMN_DEFS,
        menuName: "운송사요청목록",
        fetchFn: () => api.getLgstDefaultCnfgGrpList(model.filtersRef.current),
        rows: model.grids.header.rows,
      }),
    ],
    [model],
  );

  return {
    fetchList,
    handleSearch,
    onHeaderGridClick,
    onSubCnfgGridClick,
    detailActions,
  };
}
