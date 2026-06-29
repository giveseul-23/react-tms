import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useSmsMonitorModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 대상시스템전송상태(인터페이스 처리상태)
  const { codeMap } = useCommonStores({
    interfaceStatus: { module: "TMS", sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
  });

  return { ...base, codeMap };
}

export type SmsMonitorModel = ReturnType<typeof useSmsMonitorModel>;
