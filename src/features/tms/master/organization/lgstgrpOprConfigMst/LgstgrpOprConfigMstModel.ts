// src/features/tms/master/organization/lgstgrpOprConfigMst/LgstgrpOprConfigMstModel.ts
//
// 센차: LgstGrpConfigMasterModel.js (mainInfo / sub01Info / sub02Info / sub03Info stores).
// useBaseModel 이 menuCode 한 인자로 storageKey + grid 슬롯(lazy) 모두 자동 셋업.
// 화면 고유 state — 외부 탭 (configTabs / activeType) 만 추가.

import { useEffect, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { lgstgrpOprConfigApi } from "./LgstgrpOprConfigApi";

// 그리드 키 — 센차 grid reference 와 동일
//   main  : 메인 그리드 (lgstgrpcnfgmastrmain)
//   mainLang : 메인-다국어 (mainLang)  ← main 행 클릭 시 fetch
//   detail : 상세       (detail)
//   detailLang : 상세-다국어 (detailLang)  ← sub01 행 클릭 시 fetch
export type GridKey = "main" | "detail" | "detailLang" | "mainLang";

type ConfigTab = { key: string; label: string };

export function useLgstgrpOprConfigMstModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 센차: viewModel.data.currentType / activeType — 외부 탭
  const [configTabs, setConfigTabs] = useState<ConfigTab[]>([]);
  const [activeType, setActiveType] = useState<string>("");

  // 센차: onInit → loadTypeTabs
  useEffect(() => {
    lgstgrpOprConfigApi
      .getConfigTypeList()
      .then((res: any) => {
        const rows = res.data?.data?.dsOut ?? res.data?.result ?? [];
        const tabs: ConfigTab[] = rows.map((r: any) => ({
          key: r.CODE ?? r.CONFIG_TP_CD,
          label: r.NAME ?? r.CONFIG_TP_NM ?? r.CODE,
        }));
        setConfigTabs(tabs);
        if (tabs.length > 0) setActiveType(tabs[0].key);
      })
      .catch((err) =>
        console.error("[LgstgrpOprConfigMst] getConfigTypeList failed", err),
      );
  }, []);

  const { codeMap } = useCommonStores({
    langTp: { sqlProp: "CODE", keyParam: "LANG_TP" },
  });

  return { ...base, configTabs, activeType, setActiveType, codeMap };
}

export type LgstgrpOprConfigMstModel = ReturnType<
  typeof useLgstgrpOprConfigMstModel
>;
