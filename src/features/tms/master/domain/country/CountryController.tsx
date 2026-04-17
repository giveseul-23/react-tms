// ──────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { countryApi } from "@/features/tms/master/domain/country/CountryApi.ts";
import { CountryModel } from "./CountryModel";
import { MAIN_COLUMN_DEFS } from "./CountryColumns.tsx";
import { makeCommonActions } from "@/app/components/grid/commonActions";

type ControllerProps = {
  menuCd: string;
  model: CountryModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useCountryController({
  menuCd,
  model,
  filtersRef,
}: ControllerProps) {
  // ── fetchDispatchList (센차: mainInfo store proxy url) ────────
  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) =>
      countryApi.getCountryList(menuCd, { ...params }),
    [],
  );

  // ── handleSearch (센차: onMainInfoCallback + gridsReset) ──────
  // 조회 완료 시 SearchFilters → DataGrid 데이터 전달 및 서브그리드 초기화
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();

      handleRowClicked(data.rows?.[0]);
    },
    [model],
  );

  const fetchStateList = useCallback((row: any) => {
    const ctryCd = row.CTRY_CD;
    if (!ctryCd) return Promise.resolve([]);

    return countryApi.getStateList(menuCd, { CTRY_CD: ctryCd });
  });

  const fetchZipList = useCallback((row: any) => {
    const ctryCd = row.CTRY_CD;
    if (!ctryCd) return Promise.resolve([]);

    return countryApi.getZipList(menuCd, { CTRY_CD: ctryCd });
  });

  const fetchCityList = useCallback((row: any) => {
    const ctryCd = row.CTRY_CD;
    const sttCd = row.STT_CD;
    if (!(ctryCd && sttCd)) return Promise.resolve([]);

    return countryApi
      .getCityList(menuCd, {
        CTRY_CD: ctryCd,
        STT_CD: sttCd,
      })
      .then((res: any) => {
        model.setSubCityRowData(res.data.data?.dsOut ?? []);
      })
      .catch((err) => {
        throw new Error(err);
      });
  });

  // ── handleRowClicked (센차: onMainGridClick + searchConnectedGrid) ──
  // 행 클릭 시 3개 서브 API를 Promise.all 로 병렬 조회
  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);

      Promise.all([fetchStateList(row), fetchZipList(row)])
        .then(([stateRes, zipRes]: any[]) => {
          model.setSubStateRowData(stateRes.data.data?.dsOut ?? []);
          model.setSubZipRowData(zipRes.data.data?.dsOut ?? []);
          if (stateRes.data.success) {
            fetchCityList(stateRes.data.data?.dsOut[0] ?? []);
          }
        })
        .catch((err) => {
          console.error("[Country] row click sub-fetch failed", err);
        });
    },
    [model],
  );

  const handleSubRowClicked = useCallback((row: any) => {
    model.setSubCityRowData([]);
    fetchCityList(row);
  });

  // ── 메인 그리드 액션 (센차: TenderReceiveDispatchMain dockedItems toolbar) ──
  const mainActions = makeCommonActions({
    add: true,
    save: true,
    excel: {
      columns: MAIN_COLUMN_DEFS({}),
      menuName: "국가관리",
      fetchFn: () => countryApi.getCountryList(menuCd, filtersRef.current),
      rows: model.gridData.rows,
    },
  });

  // ── 시도 액션
  const stateActions = makeCommonActions({
    add: true,
    save: true,
    excel: {
      columns: MAIN_COLUMN_DEFS({}),
      menuName: "국가관리",
      fetchFn: () => countryApi.getStateList(menuCd, filtersRef.current),
      rows: model.gridData.rows,
    },
  });

  // ── 우편번호 액션
  const zipActions = makeCommonActions({
    add: true,
    save: true,
    excel: {
      columns: MAIN_COLUMN_DEFS({}),
      menuName: "국가관리",
      fetchFn: () => countryApi.getZipList(menuCd, filtersRef.current),
      rows: model.gridData.rows,
    },
  });

  // ── 시군구 액션
  const cityActions = makeCommonActions({
    add: true,
    save: true,
    excel: {
      columns: MAIN_COLUMN_DEFS({}),
      menuName: "국가관리",
      fetchFn: () => countryApi.getCityList(menuCd, filtersRef.current),
      rows: model.gridData.rows,
    },
  });

  return {
    fetchDispatchList,
    handleSearch,
    handleRowClicked,
    handleSubRowClicked,
    mainActions,
    stateActions,
    zipActions,
    cityActions,
  };
}
