import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 도크 / sub01: 운영시간 슬롯
export type GridKey = "main" | "sub01";

export function useDockModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 도크유형 (서버 dockTcd store: module TMS / DOCK_TCD)
  const { codeMap } = useCommonStores({
    dockTcd: { sqlProp: "CODE", keyParam: "DOCK_TCD" },
  });

  return { ...base, codeMap };
}

export type DockModel = ReturnType<typeof useDockModel>;
