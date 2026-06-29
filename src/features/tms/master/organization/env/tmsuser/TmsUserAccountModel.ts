import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub02" | "sub03";

export function useTmsUserAccountModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  const { codeMap } = useCommonStores({
    usrTpList: { module: "TMS", sqlProp: "CODE", keyParam: "USR_TP" },
    custList: { module: "TMS", sqlProp: "selectCustomerCodeNameAll" },
  });

  return { ...base, codeMap };
}

export type TmsUserAccountModel = ReturnType<typeof useTmsUserAccountModel>;
