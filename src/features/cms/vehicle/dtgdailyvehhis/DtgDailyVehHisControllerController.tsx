// src/views/dtgdailyvehhis/DtgDailyVehHisControllerController.tsx
import { useCallback } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dtgDailyVehHisControllerApi as api } from "./DtgDailyVehHisControllerApi";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import type { StopMarker } from "@/app/components/map/TmapView";
import type {
  DtgDailyVehHisControllerModel,
  GridKey,
} from "./DtgDailyVehHisControllerModel";

interface Args {
  model: DtgDailyVehHisControllerModel;
}

export function useDtgDailyVehHisControllerController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();

  // useSearchExecute(paramMode:"RAW") 가 SRCH_* 접두 rawFilters 를 전달 →
  // 서버 키로 리매핑 후 호출
  const fetchList = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;

    return api.getInTrnstVehList({
      SRCH_PSTN_DTTM_FROM: srchObj.SRCH_PSTN_DTTM_FRM,
      SRCH_PSTN_DTTM_TO: srchObj.SRCH_PSTN_DTTM_TO,
      SRCH_VEH_NO: srchObj.SRCH_VEH_NO,
    });
  }, [model.rawFiltersRef]);

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
    },
    [model],
  );

  // 행 클릭: 주행 이력 있으면 trace, 없으면 지도 clear
  const handleRowClicked = useCallback(
    (row: any) => {
      model.grids.main.setSelected(row);

      if (row?.DRIVING_HIS_YN === "N") {
        model.mapRef.current?.clearTrace();
        model.mapRef.current?.clearStopMarkers();
        return;
      }

      const vehNo = model.rawFiltersRef.current["SRCH_VEH_NO_NM"];
      const params = {
        PSTN_DTTM: row?.HIS_DATE,
        VEH_NO: vehNo,
      };

      api
        .searchDtgDailyHistory(params)
        .then((res: any) => {
          if (res?.data?.success === false) {
            openPopup({
              title: "",
              content: (
                <ConfirmModal
                  type="error"
                  description={res.data.msg ?? "조회 중 오류가 발생했습니다."}
                  onClose={closePopup}
                />
              ),
              width: "sm",
            });
            return;
          }
          const rows: any[] =
            res.data.result ?? res.data.data?.dsOut ?? res.data.data ?? [];
          if (rows.length === 0) {
            openPopup({
              title: "",
              content: (
                <ConfirmModal
                  type="info"
                  title="조회 결과"
                  description="조회된 데이터가 없습니다."
                  onClose={closePopup}
                />
              ),
              width: "sm",
            });
            return;
          }
          const points = rows.map((r) => ({
            lat: Number(r.LAT),
            lon: Number(r.LON),
          }));
          model.mapRef.current?.drawTrace(points);

          const first = rows[0];
          const last = rows[rows.length - 1];
          const stops: StopMarker[] = [
            {
              id: "trace-start",
              lat: Number(first.LAT),
              lon: Number(first.LON),
              kind: "start",
              label: first.LOC_NM ?? first.PSTN_DTTM ?? undefined,
            },
          ];
          if (rows.length > 1) {
            stops.push({
              id: "trace-end",
              lat: Number(last.LAT),
              lon: Number(last.LON),
              kind: "end",
              label: last.LOC_NM ?? last.PSTN_DTTM ?? undefined,
            });
          }
          model.mapRef.current?.drawStopMarkers(stops);
        })
        .catch((err: any) => {
          const message =
            err?.response?.data?.error?.message ??
            err?.response?.data?.msg ??
            String(err?.message ?? err);
          openPopup({
            title: "",
            content: (
              <ConfirmModal
                type="error"
                description={message}
                onClose={closePopup}
              />
            ),
            width: "sm",
          });
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
