import { useCallback, useRef, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { apDailyManagementApi as api } from "./ApDailyManagementApi";
import { MENU_CODE } from "./ApDailyManagement";
import {
  DAILY_MAIN_HEAD,
  DAILY_MAIN_TAIL,
  DAILY_DETAIL_HEAD,
  DAILY_DETAIL_TAIL,
  buildDailyColumns,
} from "./ApDailyManagementColumns";
import {
  makeExcelGroupAction,
  makeMemoGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ApDailyManagementModel, GridKey } from "./ApDailyManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: ApDailyManagementModel;
}

export function useApDailyManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // dynamicColumns 캐시 — DIV_CD + LGST_GRP_CD 조합이 바뀔 때만 재조회
  const chgCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const srchObj = model.rawFiltersRef.current;
      const divCd = srchObj.SRCH_AP_DIV_CD ?? "";
      const lgstGrpCd = srchObj.SRCH_AP_LGST_GRP_CD ?? "";
      const cacheKey = `${divCd}|${lgstGrpCd}`;

      if (chgCacheRef.current.key !== cacheKey) {
        try {
          const chgRes: any = await api.getUsedChgCd({
            DIV_CD: divCd,
            LGST_GRP_CD: lgstGrpCd,
          });
          const chgList =
            chgRes?.data?.result ?? chgRes?.data?.data?.dsOut ?? [];

          chgCacheRef.current = { key: cacheKey, list: chgList };

          model.setMainColumnDefs(
            buildDailyColumns(DAILY_MAIN_HEAD, DAILY_MAIN_TAIL, chgList, {
              isMainGrid: true,
            }),
          );
          model.setDetailColumnDefs(
            buildDailyColumns(DAILY_DETAIL_HEAD, DAILY_DETAIL_TAIL, chgList, {
              isMainGrid: false,
            }),
          );
        } catch (err) {
          console.error("getUsedChgCd failed", err);
        }
      }

      return api.getDailyList({
        dynamicColumns: chgCacheRef.current.list,
        DIV_CD: divCd,
        LGST_GRP_CD: lgstGrpCd,
        DLVRY_DT_FROM: srchObj.SRCH_AP_DLVRY_DT_FRM,
        DLVRY_DT_TO: srchObj.SRCH_AP_DLVRY_DT_TO,
        ...params,
      });
    },
    [model],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: () => {
            const srchObj = model.rawFiltersRef.current;
            return api.getDetailList({
              dynamicColumns: chgCacheRef.current.list,
              DIV_CD: srchObj.SRCH_AP_DIV_CD,
              LGST_GRP_CD: srchObj.SRCH_AP_LGST_GRP_CD,
              DLVRY_DT_FROM: srchObj.SRCH_AP_DLVRY_DT_FRM,
              DLVRY_DT_TO: srchObj.SRCH_AP_DLVRY_DT_TO,
            });
          },
        },
      ]),
    [base, model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>) =>
      apiCall().then(() => model.searchRef.current?.()),
    [model.searchRef],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CREATE_DAILY_EXPENSE",
        label: "BTN_CREATE_DAILY_EXPENSE",
        onClick: () =>
          doAction(() => api.createDailyResult(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_CANCEL_DAILY_EXPENSE",
        label: "BTN_CANCEL_DAILY_EXPENSE",
        onClick: () =>
          doAction(() => api.cancelDailyResult(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_DLY_SETL",
        label: "BTN_DLY_SETL",
        onClick: () => doAction(() => api.closeDaily(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_DLY_SETL_CANCEL",
        label: "BTN_DLY_SETL_CANCEL",
        onClick: () =>
          doAction(() => api.cancelDailyClose(model.filtersRef.current)),
      },
      {
        type: "dropdown",
        key: "BTN_FUEL_MGMT",
        label: "BTN_FUEL_MGMT",
        items: [],
      },
      {
        type: "dropdown",
        key: "BTN_REGI_RATE_MGMT",
        label: "BTN_REGI_RATE_MGMT",
        items: [],
      },
      makeMemoGroupAction({
        saveMemo: (rows, text) => api.saveMemo(rows, text),
        cancelMemo: (rows) => api.cancelMemo(rows),
        onDone: () => model.searchRef.current?.(),
      }),
      {
        type: "dropdown",
        key: "BTN_RE_CALC",
        label: "BTN_RE_CALC",
        items: [],
      },
      makeSaveAction({
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.save(saveRows).then(() => model.searchRef.current?.());
        },
      }),
      {
        type: "dropdown",
        key: "BTN_FREIGHT_EXCEL_UP",
        label: "BTN_FREIGHT_EXCEL_UP",
        items: [],
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getDailyList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [doAction, menuName, model.filtersRef, model.grids.main, model.searchRef],
  );

  const detailActions = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.detail.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return api.getDetailList({
            DLV_REQ_DT: main?.DLV_REQ_DT,
            VEH_NO: main?.VEH_NO,
            SETL_DOC_NO: main?.SETL_DOC_NO,
          });
        },
        rows: model.grids.detail.rows,
      }),
    ],
    [menuName, model.grids.detail, model.grids.main.selectedRef],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
