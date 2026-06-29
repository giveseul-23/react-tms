import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { stoShipmentManagementApi } from "./StoShipmentManagementApi";
import { AUTH, MENU_CODE } from "./StoShipmentManagement";
import type {
  GridKey,
  StoShipmentManagementModel,
} from "./StoShipmentManagementModel";

interface Args {
  model: StoShipmentManagementModel;
}

const todayYmd = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");

export function useStoShipmentManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback((params: Record<string, unknown>) => {
    return stoShipmentManagementApi.getList({
      ...params,
      ORD_TP: "TMSTO",
      SHPM_TP: "20",
      START_SHPM_OP_STS: "1005",
    });
  }, []);

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const onAddMain = useCallback(() => {
    const filters = model.rawFiltersRef.current ?? {};
    const lastModified = model.grids.main.rows
      .filter((row: any) => row.EDIT_STS)
      .at(-1);
    const row = {
      DIV_CD: filters.SRCH_SHPM_DIV_CD,
      LGST_GRP_CD: filters.SRCH_SHPM_LGST_GRP_CD,
      DLVRY_DT: lastModified?.DLVRY_DT ?? todayYmd(),
    };

    if (!row.DIV_CD || !row.LGST_GRP_CD) {
      base.alert(Lang.get("MSG_LOGISTICSGROUP_SELECT_CHK"), Lang.get("TTL_ALERT"));
      return;
    }

    base.addRow("main", row);
  }, [base, model.grids.main.rows, model.rawFiltersRef]);

  const onSaveMain = useCallback(
    () => base.saveGrid("main", stoShipmentManagementApi.save),
    [base],
  );

  const mainActions = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => fetchList(model.filtersRef.current ?? {}),
        rows: model.grids.main.rows,
        upload: { gridId: AUTH.grids.main, onUploaded: () => base.search() },
        templateDownload: { gridId: AUTH.grids.main, fileName: menuName },
      }),
    ],
    [
      base,
      fetchList,
      menuName,
      model.filtersRef,
      model.grids.main,
      onAddMain,
      onSaveMain,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
