import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "header" | "subCnfg" | "detail";

export function useLogisticGroupDefaultModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // main 행 선택 시 그 CNFG_CD 로 cnfgDtlTcd 재 fetch — detail 그리드 codeKey 라벨 변환용.
  const selectedCnfgCd = base.grids.subCnfg.selected?.CNFG_CD;
  const { codeMap } = useCommonStores(
    selectedCnfgCd
      ? {
          cnfgDtlTcd: {
            sqlProp: "/logisticGroupDefaultService/searchCnfgDtlCd",
            CNFG_CD: selectedCnfgCd,
            MENU_CD: menuCode,
          },
        }
      : {},
  );

  return { ...base, codeMap };
}

export type LogisticGroupDefaultModel = ReturnType<
  typeof useLogisticGroupDefaultModel
>;
