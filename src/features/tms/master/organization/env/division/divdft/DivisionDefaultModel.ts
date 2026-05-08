import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail";

export function useDivisionDefaultModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // main 행 선택 시 그 CNFG_CD 로 cnfgDtlTcd 재 fetch — detail 그리드 codeKey 라벨 변환용.
  const selectedCnfgCd = base.grids.main.selected?.CNFG_CD;
  const { codeMap } = useCommonStores(
    selectedCnfgCd
      ? {
          cnfgDtlTcd: {
            sqlProp: "/divisionDefaultService/searchCnfgDtlCd",
            CNFG_CD: selectedCnfgCd,
            MENU_CD: menuCode,
          },
        }
      : {},
  );

  return { ...base, codeMap };
}

export type DivisionDefaultModel = ReturnType<typeof useDivisionDefaultModel>;
