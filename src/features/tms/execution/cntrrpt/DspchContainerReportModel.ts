import { useBaseModel } from "@/app/feature/useBaseModel";

// main: 일자별(byDay) / sub01: 점포별(byLoc) / sub02: 차량별(byVeh)
export type GridKey = "main" | "sub01" | "sub02";

export function useDspchContainerReportModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 combo 없음 — codeKey 미사용. 빈 codeMap 노출(DataGrid prop 일관성).
  const codeMap = {} as Record<string, Record<string, string>>;

  return { ...base, codeMap };
}

export type DspchContainerReportModel = ReturnType<typeof useDspchContainerReportModel>;
