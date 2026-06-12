import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01";

export function useChargeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { codeMap } = useCommonStores({
    supersedeTpList: {
      sqlProp: "CODE",
      keyParam: "SUPERSEDE_TP"
    },
    rdngRcdList: {
      sqlProp: "CODE",
      keyParam: "RDNG_RCD"
    },
    calcOptTypeList: [
      { CODE: "", NAME: "　" },
      { CODE: "+", NAME: "+" },
      { CODE: "-", NAME: "-" },
      { CODE: "*", NAME: "*" },
      { CODE: "/", NAME: "/" },
      { CODE: "(", NAME: "(" },
      { CODE: ")", NAME: ")" },
    ],
  });

  return { ...base, codeMap };
}

export type ChargeModel = ReturnType<typeof useChargeModel>;
