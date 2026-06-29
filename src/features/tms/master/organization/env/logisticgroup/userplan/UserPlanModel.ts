import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import type { SearchMeta } from "@/features/search/search.meta.types";

export type GridKey = "main";

export function useUserPlanModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { meta, loading: searchMetaLoading } = useSearchMeta(menuCode);
  // 계획ID 조회 팝업 — 선택된 물류운영그룹(SRCH_PLN_LGST_GRP_CD)으로 필터
  const searchMeta = useMemo<SearchMeta[]>(
    () =>
      meta.map((m) => {
        if (m.type !== "POPUP" || !m.key.includes("PLN_ID")) return m;
        return {
          ...m,
          filterValueKey: "SRCH_PLN_LGST_GRP_CD",
          filterCol: "LGST_GRP_CD",
        };
      }),
    [meta],
  );

  // codeKey(combo) 컬럼이 없어 빈 codeMap. (combo 추가 시 useCommonStores 로 채움)
  const codeMap: Record<string, Record<string, string>> = {};

  return { ...base, codeMap, searchMeta, searchMetaLoading };
}

export type UserPlanModel = ReturnType<typeof useUserPlanModel>;
