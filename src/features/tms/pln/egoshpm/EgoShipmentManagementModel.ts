import { useBaseModel } from "@/app/feature/useBaseModel";

// 그리드 이름 union — 그리드 추가 시 여기 확장. TODO
export type GridKey = "main";

export function useEgoShipmentManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 lookup 이 필요하면 useCommonStores 로 codeMap 추가. TODO
  const codeMap = {} as Record<string, Record<string, string>>;

  return { ...base, codeMap };
}

export type EgoShipmentManagementModel = ReturnType<typeof useEgoShipmentManagementModel>;
