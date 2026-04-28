import { useCallback, useRef, MutableRefObject } from "react";
import { apDailyManagementApi } from "./ApDailyManagementApi";
import { ApDailyManagementModel } from "./ApDailyManagementModel";
import {
  DAILY_MAIN_HEAD,
  DAILY_MAIN_TAIL,
  DAILY_DETAIL_HEAD,
  DAILY_DETAIL_TAIL,
  buildDailyColumns,
} from "./ApDailyManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: ApDailyManagementModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
  rawFiltersRef: MutableRefObject<Record<string, string>>;
};

export function useApDailyManagementController({
  model,
  searchRef,
  filtersRef,
  rawFiltersRef,
}: ControllerProps) {
  // dynamicColumns 캐시 — DIV_CD + LGST_GRP_CD 조합이 바뀔 때만 재조회
  const chgCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const srchObj = rawFiltersRef.current;
      const divCd = srchObj.SRCH_AP_DIV_CD ?? "";
      const lgstGrpCd = srchObj.SRCH_AP_LGST_GRP_CD ?? "";
      const cacheKey = `${divCd}|${lgstGrpCd}`;

      // 1) 동적 컬럼 메타 — 캐시 히트 시 스킵
      if (chgCacheRef.current.key !== cacheKey) {
        try {
          const chgRes: any = await apDailyManagementApi.getUsedChgCd({
            DIV_CD: divCd,
            LGST_GRP_CD: lgstGrpCd,
          });
          const chgList =
            chgRes?.data?.result ?? chgRes?.data?.data?.dsOut ?? [];

          chgCacheRef.current = { key: cacheKey, list: chgList };

          // 컬럼 state 갱신 → 데이터 렌더 전에 컬럼이 먼저 세팅됨
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

      // 2) 목록 조회 — dynamicColumns 동봉
      return apDailyManagementApi.getDailyList({
        dynamicColumns: chgCacheRef.current.list,
        DIV_CD: divCd,
        LGST_GRP_CD: lgstGrpCd,
        DLVRY_DT_FROM: srchObj.SRCH_AP_DLVRY_DT_FRM,
        DLVRY_DT_TO: srchObj.SRCH_AP_DLVRY_DT_TO,
        ...params,
      });
    },
    [rawFiltersRef, model],
  );

  const fetchDetail = useCallback(
    (row: any) => {
      if (!row) return Promise.resolve([]);
      const srchObj = rawFiltersRef.current;

      return apDailyManagementApi
        .getDetailList({
          dynamicColumns: chgCacheRef.current.list,
          DIV_CD: srchObj.SRCH_AP_DIV_CD,
          LGST_GRP_CD: srchObj.SRCH_AP_LGST_GRP_CD,
          DLVRY_DT_FROM: srchObj.SRCH_AP_DLVRY_DT_FRM,
          DLVRY_DT_TO: srchObj.SRCH_AP_DLVRY_DT_TO,
        })
        .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
        .catch((err) => {
          throw Error(err);
        });
    },
    [rawFiltersRef],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      fetchDetail(row).then((rows: any) => {
        model.setDetailRowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: model.pageSize,
        });
      });
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

  const doAction = useCallback(
    (apiCall: () => Promise<any>) => {
      apiCall().then(() => searchRef.current?.());
    },
    [searchRef],
  );

  const mainActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_CREATE_DAILY_EXPENSE",
      label: "BTN_CREATE_DAILY_EXPENSE",
      onClick: () =>
        doAction(() =>
          apDailyManagementApi.createDailyResult(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_CANCEL_DAILY_EXPENSE",
      label: "BTN_CANCEL_DAILY_EXPENSE",
      onClick: () =>
        doAction(() =>
          apDailyManagementApi.cancelDailyResult(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_DLY_SETL",
      label: "BTN_DLY_SETL",
      onClick: () =>
        doAction(() => apDailyManagementApi.closeDaily(filtersRef.current)),
    },
    {
      type: "button",
      key: "BTN_DLY_SETL_CANCEL",
      label: "BTN_DLY_SETL_CANCEL",
      onClick: () =>
        doAction(() =>
          apDailyManagementApi.cancelDailyClose(filtersRef.current),
        ),
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
    {
      type: "dropdown",
      key: "BTN_MEMO",
      label: "BTN_MEMO",
      items: [],
    },
    {
      type: "dropdown",
      key: "BTN_RE_CALC",
      label: "BTN_RE_CALC",
      items: [],
    },
    {
      type: "button",
      key: "BTN_SAVE",
      label: "BTN_SAVE",
      onClick: (e: any) => {
        const saveRows = dirtyRows(e.data);
        if (saveRows.length === 0) return;
        apDailyManagementApi.save(saveRows).then(() => searchRef.current?.());
      },
    },
    {
      type: "dropdown",
      key: "BTN_FREIGHT_EXCEL_UP",
      label: "BTN_FREIGHT_EXCEL_UP",
      items: [],
    },
    makeExcelGroupAction({
      columns: model.mainColumnDefs,
      menuName: "일일실적관리",
      fetchFn: () => apDailyManagementApi.getDailyList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const detailActions = [
    makeExcelGroupAction({
      columns: model.detailColumnDefs,
      menuName: "상세내역",
      fetchFn: () =>
        apDailyManagementApi.getDetailList({
          DLV_REQ_DT: model.selectedHeaderRowRef.current?.DLV_REQ_DT,
          VEH_NO: model.selectedHeaderRowRef.current?.VEH_NO,
          SETL_DOC_NO: model.selectedHeaderRowRef.current?.SETL_DOC_NO,
        }),
      rows: model.detailRowData.rows,
    }),
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    detailActions,
  };
}
