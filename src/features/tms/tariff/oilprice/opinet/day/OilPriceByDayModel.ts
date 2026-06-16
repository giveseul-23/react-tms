import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 일자별 평균유가 / sub01: 광역시도별 / sub02: 시군구별
export type GridKey = "main" | "sub01" | "sub02";

// 추세조회 차트 1포인트 (서버 getTimeData: [time, OIL_PRICE])
export type OilPricePoint = {
  dateLabel: string;
  OIL_PRICE: number | null;
};

export function useOilPriceByDayModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 광역시도코드 (서버 store lvl1Cd / module TMS / LVL1_CD)
  const { codeMap } = useCommonStores({
    lvl1Cd: { module: "TMS", sqlProp: "CODE", keyParam: "LVL1_CD" },
  });

  return { ...base, codeMap };
}

export type OilPriceByDayModel = ReturnType<typeof useOilPriceByDayModel>;
