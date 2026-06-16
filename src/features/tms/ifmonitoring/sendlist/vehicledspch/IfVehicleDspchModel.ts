import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 단일 그리드 — 차량배차정보 송신 목록
export type GridKey = "main";

export function useIfVehicleDspchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 인터페이스유형 / 처리상태 / 처리메시지코드 / 송신시스템
  const { codeMap } = useCommonStores({
    interfaceType: { sqlProp: "CODE", keyParam: "IF_TCD" },
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
    ifPrcsMsgCd: { sqlProp: "CODE", keyParam: "IF_PRCS_MSG_CD" },
    invSys: { sqlProp: "CODE", keyParam: "HARIM_INV_SYS_ID" },
  });

  return { ...base, codeMap };
}

export type IfVehicleDspchModel = ReturnType<typeof useIfVehicleDspchModel>;
