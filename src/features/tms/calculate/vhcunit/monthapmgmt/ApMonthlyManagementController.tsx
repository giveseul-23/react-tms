import { useCallback, useRef, useMemo, MutableRefObject } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { apMonthlyManagementApi as api } from "./ApMonthlyManagementApi";
import {
  MONTHLY_MAIN_HEAD,
  MONTHLY_MAIN_TAIL,
  buildMonthlyColumns,
} from "./ApMonthlyManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ApMonthlyManagementModel, GridKey } from "./ApMonthlyManagementModel";

interface Args {
  model: ApMonthlyManagementModel;
  rawFiltersRef: MutableRefObject<Record<string, string>>;
}

export function useApMonthlyManagementController({
  model,
  rawFiltersRef,
}: Args) {
  const base = useBaseController<GridKey>({ model });

  // dynamicColumns 캐시
  const chgCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const srchObj = rawFiltersRef.current;
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
    [rawFiltersRef, model],
  );

  const handleSearch = useCallback(
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

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CREATE_MONTHLY_AP",
        label: "BTN_CREATE_MONTHLY_AP",
        onClick: () =>
          doAction(
            () => api.createMonthlyResult(model.filtersRef.current),
            "월 실적이 생성되었습니다.",
          ),
      },
      {
        type: "button",
        key: "BTN_CANCEL_MONTHLY_AP",
        label: "BTN_CANCEL_MONTHLY_AP",
        onClick: () =>
          doAction(
            () => api.cancelMonthlyResult(model.filtersRef.current),
            "월 실적이 취소되었습니다.",
          ),
      },
      {
        type: "dropdown",
        key: "BTN_MANUAL_RATE_MGMT",
        label: "BTN_MANUAL_RATE_MGMT",
        items: [],
      },
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.save(saveRows).then(() => base.search());
        },
      },
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_CONFIRM",
        label: "BTN_AP_SETTLEMENT_CONFIRM",
        onClick: () =>
          doAction(
            () => api.confirm(model.filtersRef.current),
            "지급 확정되었습니다.",
          ),
      },
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_CONFIRM_CANCEL",
        label: "BTN_AP_SETTLEMENT_CONFIRM_CANCEL",
        onClick: () =>
          doAction(
            () => api.cancelConfirm(model.filtersRef.current),
            "지급 확정이 취소되었습니다.",
          ),
      },
      makeExcelGroupAction({
        columns: model.mainColumnDefs,
        menuName: "월실적관리",
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [doAction, model, base],
  );

  return {
    fetchList,
    handleSearch,
    mainActions,
  };
}
