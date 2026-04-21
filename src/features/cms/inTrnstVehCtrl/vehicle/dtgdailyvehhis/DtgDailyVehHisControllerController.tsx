// src/views/inTrnstVehCtrl/InTrnstVehCtrlController.tsx
import { useCallback, MutableRefObject } from "react";
import { dtgDailyVehHisControllerApi } from "./DtgDailyVehHisControllerApi";
import { DtgDailyVehHisControllerModel } from "./DtgDailyVehHisControllerModel";

type ControllerProps = {
  model: DtgDailyVehHisControllerModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDtgDailyVehHisControllerController({
  model,
  searchRef,
}: ControllerProps) {
  // ── fetch ───────────────────────────────────────────────────
  // useSearchExecute(paramMode:"RAW")가 SRCH_* 접두 rawFilters를 전달 →
  // 서버가 기대하는 키로 리매핑 후 호출
  const fetchInTrnstVehList = useCallback(
    (params: Record<string, unknown>) =>
      dtgDailyVehHisControllerApi.getInTrnstVehList({
        SRCH_PSTN_DTTM_FROM: params["SRCH_PSTN_DTTM_FRM"],
        SRCH_PSTN_DTTM_TO: params["SRCH_PSTN_DTTM_TO"],
        VEH_NO: params["SRCH_VEH_NO_NM"],
      }),
    [],
  );

  // ── 조회 완료 콜백 ──────────────────────────────────────────
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.setSelectedRow(null);
      // // 조회 직후 마커 영역에 맞게 지도 fit
      // requestAnimationFrame(() => {
      //   model.mapRef.current?.fitMarkers();
      // });
    },
    [model],
  );

  // ── 행 클릭: 해당 차량 위치로 지도 이동 ─────────────────────
  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedRow(row);
      const lat = Number(row?.LAT);
      const lon = Number(row?.LON);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        lat !== 0 &&
        lon !== 0
      ) {
        model.mapRef.current?.panTo(lat, lon, 14);
      }
    },
    [model],
  );

  const mainActions = [
    {
      type: "button",
      key: "새로고침",
      label: "새로고침",
      onClick: () => searchRef.current?.(),
    },
    {
      type: "button",
      key: "전체보기",
      label: "전체보기",
      onClick: () => model.mapRef.current?.fitMarkers(),
    },
  ];

  return {
    fetchInTrnstVehList,
    handleSearch,
    handleRowClicked,
    mainActions,
  };
}
