import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { vehicleDailyBaseRtnMgmtApi as api } from "./VehicleDailyBaseRtnMgmtApi";
import { MENU_CODE } from "./VehicleDailyBaseRtnMgmt";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  VehicleDailyBaseRtnMgmtModel,
  GridKey,
} from "./VehicleDailyBaseRtnMgmtModel";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface ControllerArgs {
  model: VehicleDailyBaseRtnMgmtModel;
}

export function useVehicleDailyBaseRtnMgmtController({
  model,
}: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const onAddMain = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;
    base.addRow("main", {
      LGST_GRP_CD: srchObj.SRCH_LGST_GRP_CD ?? "",
      BASE_RTN_CNT: 3,
    });
  }, [base, model.rawFiltersRef]);

  const parseDate = (value: string | Date) => {
    if (value instanceof Date) return value;

    if (/^\d{8}$/.test(value)) {
      return new Date(
        Number(value.slice(0, 4)),
        Number(value.slice(4, 6)) - 1,
        Number(value.slice(6, 8)),
      );
    }

    return new Date(value);
  };

  const onSaveMain = useCallback(() => {
    const saveWithValidation = async (p: { dsSave: any[] }) => {
      const invalidRow = p.dsSave.find((row: any) => {
        if (!row.START_DTTM || !row.END_DTTM) return false;

        return parseDate(row.START_DTTM) >= parseDate(row.END_DTTM);
      });

      if (invalidRow) {
        throw new Error(Lang.get("MSG_DATE_SEQ_CHK"));
      }

      return api.save(p);
    };

    return base.saveGrid("main", saveWithValidation, {
      confirmOnDelete: Lang.get("MSG_CHK_DELETE"),
    });
  }, [base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, menuName, model.grids.main, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
