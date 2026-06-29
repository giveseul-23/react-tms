import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 헬퍼 / sub01: 소속(물류운영그룹)
export type GridKey = "main" | "sub01";

export function useAssistModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 헬퍼 유형(ASST_TCD, 모듈 ADM)
  const { codeMap } = useCommonStores({
    asstTcd: { sqlProp: "CODE", keyParam: "ASST_TCD", module: "ADM" },
  });

  return { ...base, codeMap };
}

export type AssistModel = ReturnType<typeof useAssistModel>;
