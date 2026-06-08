import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "detail";

export function useSmsGroupModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 라벨 매핑 없음 (물류그룹/수신자는 팝업 선택) — codeMap 은 빈 객체.
  const codeMap: Record<string, Record<string, string>> = {};

  return { ...base, codeMap };
}

export type SmsGroupModel = ReturnType<typeof useSmsGroupModel>;
