// src/views/inTrnstVehCtrl/InTrnstVehCtrlController.tsx
import { useCallback, MutableRefObject } from "react";
import { inTrnstVehCtrlApi } from "@/features/cms/vehicle/inTrnstVehCtrl/InTrnstVehCtrlApi";
import { InTrnstVehCtrlModel } from "./InTrnstVehCtrlModel";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: InTrnstVehCtrlModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useInTrnstVehCtrlController({
  model,
  searchRef,
}: ControllerProps) {
  // ── fetch ───────────────────────────────────────────────────
  const fetchInTrnstVehList = useCallback(
    (params: Record<string, unknown>) =>
      inTrnstVehCtrlApi.getInTrnstVehList(params),
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

  const mainActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_SP_SIGNATURE_REFRESH",
      label: "BTN_SP_SIGNATURE_REFRESH",
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
