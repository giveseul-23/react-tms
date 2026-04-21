// src/views/inTrnstVehCtrl/InTrnstVehCtrlController.tsx
import { useCallback, MutableRefObject } from "react";
import { dtgDailyVehHisControllerApi } from "./DtgDailyVehHisControllerApi";
import { DtgDailyVehHisControllerModel } from "./DtgDailyVehHisControllerModel";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";

type ControllerProps = {
  model: DtgDailyVehHisControllerModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDtgDailyVehHisControllerController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const { openPopup, closePopup } = usePopup();
  // ── fetch ───────────────────────────────────────────────────
  // useSearchExecute(paramMode:"RAW")가 SRCH_* 접두 rawFilters를 전달 →
  // 서버가 기대하는 키로 리매핑 후 호출
  const fetchInTrnstVehList = useCallback(
    (params: Record<string, unknown>) =>
      dtgDailyVehHisControllerApi.getInTrnstVehList({
        SRCH_PSTN_DTTM_FROM: params["SRCH_PSTN_DTTM_FRM"],
        SRCH_PSTN_DTTM_TO: params["SRCH_PSTN_DTTM_TO"],
        SRCH_VEH_NO: params["SRCH_VEH_NO_NM"],
      }),
    [],
  );

  // ── 조회 완료 콜백 ──────────────────────────────────────────
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.setSelectedRow(null);
    },
    [model],
  );

  // ── 행 클릭: 주행 이력 있으면 trace 그리기, 없으면 지도 clear ─
  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedRow(row);

      // legacy: DRIVING_HIS_YN === 'N' 이면 지도 초기화 후 return
      if (row?.DRIVING_HIS_YN === "N") {
        model.mapRef.current?.clearTrace();
        return;
      }

      const vehNo = filtersRef.current["SRCH_VEH_NO_NM"];
      const params = {
        PSTN_DTTM: row?.HIS_DATE,
        VEH_NO: vehNo,
      };

      dtgDailyVehHisControllerApi
        .searchDtgDailyHistory(params)
        .then((res: any) => {
          if (res?.data?.success === false) {
            openPopup({
              title: "",
              content: (
                <ConfirmModal
                  type="error"
                  title="조회 오류"
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
                title="조회 오류"
                description={message}
                onClose={closePopup}
              />
            ),
            width: "sm",
          });
        });
    },
    [model, filtersRef, openPopup, closePopup],
  );

  return {
    fetchInTrnstVehList,
    handleSearch,
    handleRowClicked,
  };
}
