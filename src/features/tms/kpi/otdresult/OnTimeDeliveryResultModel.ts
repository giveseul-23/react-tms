import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 단일 그리드 조회 화면 (서버 OnTimeDeliveryResult)
export type GridKey = "main";

export function useOnTimeDeliveryResultModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 납기준수여부 (서버 store dlvryYnList / TMS / TMS_OTD_STSFED)
  const { codeMap } = useCommonStores({
    dlvryYnList: { module: "TMS", sqlProp: "CODE", keyParam: "TMS_OTD_STSFED" },
  });

  return { ...base, codeMap };
}

export type OnTimeDeliveryResultModel = ReturnType<typeof useOnTimeDeliveryResultModel>;
