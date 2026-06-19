import { useCallback } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchPlanVehApi as api } from "./DispatchPlanVehApi";
import type { DispatchPlanVehModel, GridKey } from "./DispatchPlanVehModel";

interface Args {
  model: DispatchPlanVehModel;
}

export function useDispatchPlanVehController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  // 상단 SearchFilters 가 넘기는 공통 검색 파라미터(부서/운영그룹/배송일/계획ID 등)
  const baseParams = () => model.filtersRef.current ?? {};

  // ── 상단 조회 → 좌측(물동형) + 우측(고정/임시) 동시 로드 ────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      api.searchShpmVolumePerLocation(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.locationShpmVolume.setData(data);
      const p = baseParams();
      base.searchSub("dedicatedTruck", api.searchDedicatedTruckDispatchList(p));
      base.searchSub("tempTruck", api.searchTempTruckDispatchList(p));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model.grids.locationShpmVolume, base],
  );

  // ── 좌측 탭별 재조회 (물동형 / 배차내역) — 카드 내 조회필드 합침 ──
  const loadVolume = useCallback(
    (extra: Record<string, unknown> = {}) =>
      base.searchSub(
        "locationShpmVolume",
        api.searchShpmVolumePerLocation({ ...baseParams(), ...extra }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base],
  );

  const loadDspch = useCallback(
    (extra: Record<string, unknown> = {}) =>
      base.searchSub(
        "locationDspch",
        api.searchDspchPerLocation({ ...baseParams(), ...extra }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base],
  );

  return {
    fetchList,
    onSearchCallback,
    loadVolume,
    loadDspch,
  };
}
