// src/features/tms/calculate/apsettlmgmt/ApSettlMgmtModel.ts
//
// useBaseModel 이 menuCode 한 인자로 storageKey + grid 슬롯(lazy) +
// searchRef/filtersRef + layout(localStorage) 자동 셋업.
// 화면 고유 — 공통코드 lookup (codeMap) 만 추가.

import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 9 그리드 — master 1 + 8 sub.
//   config         : 메인 (master)
//   summary        : 종합내역 탭 (detail-left)
//   monthlyFare    : SUMMARY 의 right-grid 탭 1
//   hireDispatchPay: SUMMARY 의 right-grid 탭 2
//   freightPay     : SUMMARY 의 right-grid 탭 3
//   indirectPay    : SUMMARY 의 right-grid 탭 4
//   costCenter     : 코스트센터/계정별 탭
//   materialCost   : 원재료비 탭
//   evidence       : 증빙 탭
export type GridKey =
  | "config"
  | "summary"
  | "monthlyFare"
  | "hireDispatchPay"
  | "freightPay"
  | "indirectPay"
  | "costCenter"
  | "materialCost"
  | "evidence";

export function useApSettlMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { stores } = useCommonStores({
    apSetlDetailType: { sqlProp: "CODE", keyParam: "AP_SETL_DTL_TCD" },
    apSetlDescType: { sqlProp: "CODE", keyParam: "APPLD_VAL_TCD" },
    fiSts: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    costCenter: { sqlProp: "CODE", keyParam: "CST_CNTR_GL_RC_TCD" },
    cstDistSts: { sqlProp: "CODE", keyParam: "CST_DIST_STS" },
    cstCntrCd: { sqlProp: "selectCstCntrCodeName" },
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

  return { ...base, codeMap };
}

export type ApSettlMgmtModel = ReturnType<typeof useApSettlMgmtModel>;
