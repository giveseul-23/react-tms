import { useBaseModel } from "@/app/feature/useBaseModel";

// 서버 Pchart 는 Power BI iframe 임베드 화면이라 ag-grid 그리드/스토어가 없다.
// 컴파일/배선 유지를 위해 최소 union 만 둔다. TODO: 임베드 토큰/config state 도입 시 교체.
export type GridKey = "main";

export function usePchartModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type PchartModel = ReturnType<typeof usePchartModel>;
