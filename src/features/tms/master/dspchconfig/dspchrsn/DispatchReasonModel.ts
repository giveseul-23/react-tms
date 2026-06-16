import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "detail";

export function useDispatchReasonModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 서버 stores 에 bindStore 없음 → 공통코드 lookup 불필요.
  const codeMap = {} as Record<string, Record<string, string>>;

  return { ...base, codeMap };
}

export type DispatchReasonModel = ReturnType<typeof useDispatchReasonModel>;
