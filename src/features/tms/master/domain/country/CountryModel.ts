import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "state" | "city" | "zip";

export function useCountryModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    mapTpList: { sqlProp: "CODE", keyParam: "MAP_TP" },
    ctryTzTcdList: { sqlProp: "CODE", keyParam: "CTRY_TZ_TCD" },
    timezoneStore: {
      sqlProp: "/tmsCommonService/searchTimzones",
    },
  });

  return { ...base, codeMap };
}

export type CountryModel = ReturnType<typeof useCountryModel>;
