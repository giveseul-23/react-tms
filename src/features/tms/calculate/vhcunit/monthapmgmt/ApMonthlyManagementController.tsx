import { useCallback, useRef, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { apMonthlyManagementApi as api } from "./ApMonthlyManagementApi";
import { MENU_CODE } from "./ApMonthlyManagement";
import {
  MONTHLY_MAIN_HEAD,
  MONTHLY_MAIN_TAIL,
  buildMonthlyColumns,
} from "./ApMonthlyManagementColumns";
import {
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  ApMonthlyManagementModel,
  GridKey,
} from "./ApMonthlyManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: ApMonthlyManagementModel;
}

export function useApMonthlyManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // dynamicColumns 캐시
  const chgCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const srchObj = model.rawFiltersRef.current;
      const divCd = srchObj.SRCH_AP_DIV_CD ?? "";
      const lgstGrpCd = srchObj.SRCH_AP_LGST_GRP_CD ?? "";
      const endDate = srchObj.SRCH_TO_DTTM ?? "";
      const cacheKey = `${divCd}|${lgstGrpCd}|${endDate}`;

      if (chgCacheRef.current.key !== cacheKey) {
        try {
          const chgRes: any = await api.getUsedChgCd({
            DIV_CD: divCd,
            LGST_GRP_CD: lgstGrpCd,
            END_DATE: endDate,
          });
          const chgList =
            chgRes?.data?.result ?? chgRes?.data?.data?.dsOut ?? [];
          chgCacheRef.current = { key: cacheKey, list: chgList };
          model.setMainColumnDefs(
            buildMonthlyColumns(MONTHLY_MAIN_HEAD, MONTHLY_MAIN_TAIL, chgList),
          );
        } catch (err) {
          console.error("getUsedChgCd failed", err);
        }
      }

      return api.getList({
        dynamicColumns: chgCacheRef.current.list,
        DIV_CD: divCd,
        LGST_GRP_CD: lgstGrpCd,
        END_DATE: endDate,
        ...params,
      });
    },
    [model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>, msg = "처리되었습니다.") =>
      base.callAjax(apiCall(), msg).then(() => base.search()),
    [base],
  );

  const handleSave = useCallback(
    () =>
      base.saveGrid("main", (payload) =>
        api.save({
          dsSave: payload.dsSave,
          MENU_CD: MENU_CODE,
        }),
      ),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CREATE_MONTHLY_AP",
        label: "BTN_CREATE_MONTHLY_AP",
        onClick: () =>
          doAction(() => api.createMonthlyResult(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_CANCEL_MONTHLY_AP",
        label: "BTN_CANCEL_MONTHLY_AP",
        onClick: () =>
          doAction(() => api.cancelMonthlyResult(model.filtersRef.current)),
      },
      {
        type: "dropdown",
        key: "BTN_MANUAL_RATE_MGMT",
        label: "BTN_MANUAL_RATE_MGMT",
        items: [],
      },
      makeSaveAction({ onClick: handleSave }),
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_CONFIRM",
        label: "BTN_AP_SETTLEMENT_CONFIRM",
        onClick: () => doAction(() => api.confirm(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_CONFIRM_CANCEL",
        label: "BTN_AP_SETTLEMENT_CONFIRM_CANCEL",
        onClick: () =>
          doAction(() => api.cancelConfirm(model.filtersRef.current)),
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, doAction, base],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
