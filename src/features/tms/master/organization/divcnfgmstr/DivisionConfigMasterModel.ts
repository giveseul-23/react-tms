// src/features/tms/master/organization/divcnfgmstr/DivisionConfigMasterModel.ts
//
// useBaseModel 이 menuCode 한 인자로 storageKey + grid 슬롯(lazy) + searchRef/filtersRef
// 모두 자동 셋업.

import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 그리드 키 — LgstgrpOprConfigMst 와 동일 컨벤션
//   main  : 메인 그리드 (top-left, config)
//   sub01 : 상세       (top-right, detail) — main 행 클릭 시 fetch
//   sub02 : detail-i18n (bottom-left)      — sub01 행 클릭 시 fetch
//   sub03 : 메인-i18n   (bottom-right)     — main 행 클릭 시 fetch
export type GridKey = "divCd" | "divCd18n" | "divDtlCd" | "divDtlCd18n";

export function useDivisionConfigMasterModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    datCreTcd: { sqlProp: "CODE", keyParam: "DATA_CRE_TCD" },
    langTp: { sqlProp: "CODE", keyParam: "LANG_TP" },
  });
  return { ...base, codeMap };
}

export type DivisionConfigMasterModel = ReturnType<
  typeof useDivisionConfigMasterModel
>;
