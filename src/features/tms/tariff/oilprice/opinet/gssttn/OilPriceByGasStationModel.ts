import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 주유소(오피넷) / sub01: 주유소별 평균유가(일자별)
export type GridKey = "main" | "sub01";

// 평균유가 추이 차트 1포인트 (서버 getTimeData: [time, OIL_PRICE])
export type OilPricePoint = {
  dateLabel: string;
  OIL_PRICE: number | null;
};

export function useOilPriceByGasStationModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 주유소상표구분코드 (서버 store pollDivCd / POLL_DIV_CD)
  const { codeMap } = useCommonStores({
    pollDivCd: { sqlProp: "CODE", keyParam: "POLL_DIV_CD" },
  });

  // 평균유가 추이 차트 데이터 (선택 주유소 기준)
  const [chartData, setChartData] = useState<OilPricePoint[]>([]);

  return { ...base, codeMap, chartData, setChartData };
}

export type OilPriceByGasStationModel = ReturnType<
  typeof useOilPriceByGasStationModel
>;
