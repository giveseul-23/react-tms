// ──────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { countryApi } from "@/features/tms/master/domain/country/CountryApi";
import { useApiHandler } from "@/hooks/useApiHandler";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useGuard } from "@/hooks/useGuard";
import { downExcelSearch, downExcelSearched } from "@/views/common/common";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { CountryModel } from "./CountryModel";
import { MAIN_COLUMN_DEFS } from "./CountryColumns.tsx";

type ControllerProps = {
  menuCd: string;
  model: CountryModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

/**
 * useTenderReceiveDispatchController
 *
 * 센차 Controller의 handler 함수들을 React 방식으로 구현합니다.
 * - useApiHandler: 센차의 saveGrid / callAjax 역할
 * - usePopup: 센차의 openWindow 역할
 * - useGuard: 센차의 isCheckSelectRecord 역할
 */
export function useCountryController({
  menuCd,
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const { handleApi } = useApiHandler();
  const { openPopup, closePopup } = usePopup();
  const { guardHasData } = useGuard();

  // ── fetchDispatchList (센차: mainInfo store proxy url) ────────
  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) =>
      countryApi.getDispatchList(menuCd, { ...params }),
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
  const mainActions = [
    // 센차: BTN_TENDER_ACCEPT handler:'onTenderAccepted'
    {
      type: "button",
      key: "추가",
      label: "추가",
      onClick: (e: any) => {},
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {},
    },
    {
      type: "group",
      key: "엑셀",
      label: "엑셀",
      items: [
        {
          type: "button",
          key: "조회된모든데이터다운로드",
          label: "조회된모든데이터다운로드",
          onClick: () => {
            downExcelSearch({
              columns: MAIN_COLUMN_DEFS({}),
              menuName: "국가관리",
              fetchFn: () => countryApi.getDispatchList(filtersRef.current),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: MAIN_COLUMN_DEFS({}),
              rows: model.gridData.rows,
              menuName: "국가관리",
            });
          },
        },
      ],
    },
  ];

  // ── 시도 액션
  const stateActions = [
    {
      type: "button",
      key: "추가",
      label: "추가",
      onClick: (e: any) => {},
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {},
    },
    {
      type: "group",
      key: "엑셀",
      label: "엑셀",
      items: [
        {
          type: "button",
          key: "조회된모든데이터다운로드",
          label: "조회된모든데이터다운로드",
          onClick: () => {
            downExcelSearch({
              columns: MAIN_COLUMN_DEFS({}),
              menuName: "국가관리",
              fetchFn: () => countryApi.getDispatchList(filtersRef.current),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: MAIN_COLUMN_DEFS({}),
              rows: model.gridData.rows,
              menuName: "국가관리",
            });
          },
        },
      ],
    },
  ];

  // ── 우편번호 액션
  const zipActions = [
    {
      type: "button",
      key: "추가",
      label: "추가",
      onClick: (e: any) => {},
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {},
    },
    {
      type: "group",
      key: "엑셀",
      label: "엑셀",
      items: [
        {
          type: "button",
          key: "조회된모든데이터다운로드",
          label: "조회된모든데이터다운로드",
          onClick: () => {
            downExcelSearch({
              columns: MAIN_COLUMN_DEFS({}),
              menuName: "국가관리",
              fetchFn: () => countryApi.getDispatchList(filtersRef.current),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: MAIN_COLUMN_DEFS({}),
              rows: model.gridData.rows,
              menuName: "국가관리",
            });
          },
        },
      ],
    },
  ];

  // ── 시군구 액션
  const cityActions = [
    {
      type: "button",
      key: "추가",
      label: "추가",
      onClick: (e: any) => {},
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {},
    },
    {
      type: "group",
      key: "엑셀",
      label: "엑셀",
      items: [
        {
          type: "button",
          key: "조회된모든데이터다운로드",
          label: "조회된모든데이터다운로드",
          onClick: () => {
            downExcelSearch({
              columns: MAIN_COLUMN_DEFS({}),
              menuName: "국가관리",
              fetchFn: () => countryApi.getDispatchList(filtersRef.current),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: MAIN_COLUMN_DEFS({}),
              rows: model.gridData.rows,
              menuName: "국가관리",
            });
          },
        },
      ],
    },
  ];

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
