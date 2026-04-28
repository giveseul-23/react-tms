// src/views/inTrnstVehCtrl/InTrnstVehCtrlController.tsx
import { useCallback, MutableRefObject } from "react";
import { driveHistoryApi } from "./DriveHistoryApi";
import { DriveHistoryModel } from "./DriveHistoryModel";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import type { StopMarker } from "@/app/components/map/TmapView";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: DriveHistoryModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDriveHistoryController({
  model,
  searchRef,
}: ControllerProps) {
  const { openPopup, closePopup } = usePopup();
  // ── fetch ───────────────────────────────────────────────────
  const fetchInTrnstVehList = useCallback(
    (params: Record<string, unknown>) =>
      driveHistoryApi.getInTrnstVehList(params),
    [],
  );

  // ── 조회 완료 콜백 ──────────────────────────────────────────
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.setSelectedRow(null);
      // 조회 직후 마커 영역에 맞게 지도 fit
      requestAnimationFrame(() => {
        model.mapRef.current?.fitMarkers();
      });
    },
    [model],
  );

  // ── 행 클릭: 배차 실주행경로(trace) + 정차지(routes) 표시 ───
  // legacy onMainGridClick: removeAll → showRealPath + showDispatchRoutes → zoomToExtentMap
  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedRow(row);
      const map = model.mapRef.current;
      if (!map) return;

      // 기존 trace/stop 모두 초기화
      map.clearTrace();
      map.clearStopMarkers();

      const dspchNo = row?.DSPCH_NO;
      if (!dspchNo) return;

      const showError = (msg: string) =>
        openPopup({
          title: "",
          content: (
            <ConfirmModal
              type="error"
              title="조회 오류"
              description={msg}
              onClose={closePopup}
            />
          ),
          width: "sm",
        });

      const extractRows = (res: any): any[] =>
        res?.data?.result ?? res?.data?.data?.dsOut ?? res?.data?.data ?? [];

      // searchDispathTrace + getDlvryRoute 병렬 호출
      Promise.all([
        driveHistoryApi.searchDispathTrace({ DSPCH_NO: dspchNo }),
        driveHistoryApi.getDlvryRoute({ DSPCH_NO: dspchNo }),
      ])
        .then(([traceRes, routeRes]: any[]) => {
          if (traceRes?.data?.success === false) {
            showError(traceRes.data.msg ?? "주행경로 조회 실패");
            return;
          }
          if (routeRes?.data?.success === false) {
            showError(routeRes.data.msg ?? "정차지 조회 실패");
            return;
          }

          // trace polyline (drawTrace 는 폴리라인 + 중간 거점만, 출발/도착은 drawStopMarkers 에서)
          const traceRows = extractRows(traceRes);
          const tracePoints = traceRows.map((r: any) => ({
            lat: Number(r.LAT),
            lon: Number(r.LON),
          }));
          map.drawTrace(tracePoints);

          // stop markers — 출발=S / 도착=E / 경유지=1,2,3,... / 라벨=LOC_NM
          const routeRows = extractRows(routeRes);
          const stops: StopMarker[] = routeRows.map((r: any, i: number) => {
            let kind: "start" | "end" | "via";
            if (i === 0) kind = "start";
            else if (i === routeRows.length - 1) kind = "end";
            else kind = "via";
            const locNm = r.LOC_NM ?? "";
            return {
              id: `stop-${i}`,
              lat: Number(r.LAT),
              lon: Number(r.LON),
              label: locNm,
              kind,
            };
          });
          map.drawStopMarkers(stops);

          // legacy zoomToExtentMap — trace + stops 모두 포함
          map.fitAll();
        })
        .catch((err: any) => {
          const message =
            err?.response?.data?.error?.message ??
            err?.response?.data?.msg ??
            String(err?.message ?? err);
          showError(message);
        });
    },
    [model, openPopup, closePopup],
  );

  return {
    fetchInTrnstVehList,
    handleSearch,
    handleRowClicked,
  };
}
