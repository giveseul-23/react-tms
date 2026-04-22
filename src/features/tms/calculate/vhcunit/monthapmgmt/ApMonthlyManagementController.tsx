import { useCallback, useRef, MutableRefObject } from "react";
import { apMonthlyManagementApi } from "./ApMonthlyManagementApi";
import { ApMonthlyManagementModel } from "./ApMonthlyManagementModel";
import {
  MONTHLY_MAIN_HEAD,
  MONTHLY_MAIN_TAIL,
  buildMonthlyColumns,
} from "./ApMonthlyManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: ApMonthlyManagementModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
  rawFiltersRef: MutableRefObject<Record<string, string>>;
};

export function useApMonthlyManagementController({
  model,
  searchRef,
  filtersRef,
  rawFiltersRef,
}: ControllerProps) {
  // dynamicColumns 캐시 — DIV_CD + LGST_GRP_CD + END_DATE 조합이 바뀔 때만 재조회
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

      // 1) 동적 컬럼 메타 — 캐시 히트 시 스킵
      if (chgCacheRef.current.key !== cacheKey) {
        try {
          const chgRes: any = await apMonthlyManagementApi.getUsedChgCd({
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

      // 2) 목록 조회 — dynamicColumns 동봉
      return apMonthlyManagementApi.getList({
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
      model.setGridData(data);
    },
    [model],
  );

  const handleRowClicked = useCallback(() => {}, []);

  const doAction = useCallback(
    (apiCall: () => Promise<any>) => {
      apiCall().then(() => searchRef.current?.());
    },
    [searchRef],
  );

  const mainActions = [
    {
      type: "button",
      key: "월실적생성",
      label: "월실적생성",
      onClick: () =>
        doAction(() =>
          apMonthlyManagementApi.createMonthlyResult(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "월실적취소",
      label: "월실적취소",
      onClick: () =>
        doAction(() =>
          apMonthlyManagementApi.cancelMonthlyResult(filtersRef.current),
        ),
    },
    {
      type: "dropdown",
      key: "수기비용엑셀양식다운로드",
      label: "수기비용엑셀양식다운로드",
      items: [],
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        apMonthlyManagementApi.save(saveRows).then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "확정",
      label: "확정",
      onClick: () =>
        doAction(() => apMonthlyManagementApi.confirm(filtersRef.current)),
    },
    {
      type: "button",
      key: "확정취소",
      label: "확정취소",
      onClick: () =>
        doAction(() =>
          apMonthlyManagementApi.cancelConfirm(filtersRef.current),
        ),
    },
    makeExcelGroupAction({
      columns: model.mainColumnDefs,
      menuName: "월실적관리",
      fetchFn: () => apMonthlyManagementApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
  };
}
