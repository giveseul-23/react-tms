import { useCallback, MutableRefObject } from "react";
import { organizationApi } from "./OrganizationApi";
import { OrganizationModel } from "./OrganizationModel";
import {
  DIVISION_COLUMN_DEFS,
  LOGISTICS_GROUP_COLUMN_DEFS,
} from "./OrganizationColumns";
import { makeCommonActions } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";

type ControllerProps = {
  model: OrganizationModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useOrganizationController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      organizationApi.getDivisionList(params),
    [],
  );

  const fetchLogisticsGroup = useCallback(
    (row: any) => {
      if (!row) {
        model.setLogisticsGroupRowData([]);
        return;
      }
      organizationApi
        .getLogisticsGroupList({ DIV_CD: row.DIV_CD })
        .then((res: any) =>
          model.setLogisticsGroupRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      fetchLogisticsGroup(row);
    },
    [fetchLogisticsGroup],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setDivisionGridData(data);
      model.resetSubGrids();
    },
    [model],
  );

  const divisionActions = makeCommonActions({
    add: true,
    save: {
      onClick: (e: any) => {
        const saveRows = dirtyRows(e.data);
        if (saveRows.length === 0) return;
        organizationApi
          .saveDivision(saveRows)
          .then(() => searchRef.current?.());
      },
    },
    excel: {
      columns: DIVISION_COLUMN_DEFS,
      menuName: "조직구성관리-디비전",
      fetchFn: () => organizationApi.getDivisionList(filtersRef.current),
      rows: model.divisionGridData.rows,
    },
  });

  const logisticsGroupActions = makeCommonActions({
    add: true,
    save: {
      onClick: (e: any) => {
        const saveRows = dirtyRows(e.data);
        if (saveRows.length === 0) return;
        organizationApi.saveLogisticsGroup(saveRows).then(() => {});
      },
    },
    excel: {
      columns: LOGISTICS_GROUP_COLUMN_DEFS,
      menuName: "조직구성관리-물류운영그룹",
      fetchFn: () => organizationApi.getLogisticsGroupList(filtersRef.current),
      rows: model.logisticsGroupRowData,
    },
  });

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    divisionActions,
    logisticsGroupActions,
  };
}
