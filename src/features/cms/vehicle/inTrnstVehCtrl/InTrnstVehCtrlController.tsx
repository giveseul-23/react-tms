// src/views/inTrnstVehCtrl/InTrnstVehCtrlController.tsx
import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { inTrnstVehCtrlApi as api } from "./InTrnstVehCtrlApi";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { InTrnstVehCtrlModel, GridKey } from "./InTrnstVehCtrlModel";

interface Args {
  model: InTrnstVehCtrlModel;
}

export function useInTrnstVehCtrlController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getInTrnstVehList(params),
    [],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
      requestAnimationFrame(() => {
        model.mapRef.current?.fitMarkers();
      });
    },
    [model],
  );

  // 행 클릭: 해당 차량 위치로 지도 이동
  const handleRowClicked = useCallback(
    (row: any) => {
      model.grids.main.setSelected(row);
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

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SP_SIGNATURE_REFRESH",
        label: "BTN_SP_SIGNATURE_REFRESH",
        onClick: () => model.searchRef.current?.(),
      },
    ],
    [model],
  );

  void base;

  return {
    fetchInTrnstVehList: fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
  };
}
