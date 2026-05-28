import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail";

export function useDispatchOrganizationSettingModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // ── 공통 코드 lookup (Cell Renderer 의 codeKey 매핑용) ─────────
  const { codeMap } = useCommonStores({
    shpmTpList: { sqlProp: "CODE", keyParam: "SHPM_TP" },
    ynList: { sqlProp: "CODE", keyParam: "YN" },
  });

  return { ...base, codeMap };
}

export type DispatchOrganizationSettingModel = ReturnType<typeof useDispatchOrganizationSettingModel>;