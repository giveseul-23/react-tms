// src/views/drvhstry/DriveHistoryController.tsx
import { useCallback } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { driveHistoryApi as api } from "./DriveHistoryApi";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import type { StopMarker } from "@/app/components/map/TmapView";
import type { DriveHistoryModel, GridKey } from "./DriveHistoryModel";

interface Args {
  model: DriveHistoryModel;
}

export function useDriveHistoryController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getInTrnstVehList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
      requestAnimationFrame(() => {
        model.mapRef.current?.fitMarkers();
      });
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.grids.main.setSelected(row);
      const map = model.mapRef.current;
      if (!map) return;

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

      Promise.all([
        api.searchDispathTrace({ DSPCH_NO: dspchNo }),
        api.getDlvryRoute({ DSPCH_NO: dspchNo }),
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

          const traceRows = extractRows(traceRes);
          const tracePoints = traceRows.map((r: any) => ({
            lat: Number(r.LAT),
            lon: Number(r.LON),
          }));
          map.drawTrace(tracePoints);

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

  void base;

  return {
    fetchInTrnstVehList: fetchList,
    onSearchCallback,
    handleRowClicked,
  };
}
