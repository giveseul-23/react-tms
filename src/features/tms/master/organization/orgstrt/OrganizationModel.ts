import {useMemo} from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub02";

export function useOrganizationModel(menuCode: string) {
    const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

    const { stores } = useCommonStores({
    custList: { sqlProp: "selectCustomerCodeName"},
  });

    const codeMap = useMemo(() => {
      const map: Record<string, Record<string, string>> = {};
      Object.entries(stores).forEach(([storeKey, items]) => {
        map[storeKey] = {};
        (items ?? []).forEach((item: any) => {
          map[storeKey][item.CODE] = item.NAME;
        });
      });
      return map;
    }, [stores]);
  
  return {
    ...base,
    stores,
    codeMap,
  };
}


export type OrganizationModel = ReturnType<
  typeof useOrganizationModel
>;
