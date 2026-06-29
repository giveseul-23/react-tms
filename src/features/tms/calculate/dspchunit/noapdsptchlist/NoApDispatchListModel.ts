import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import { MAIN_COLUMN_DEFS } from "./NoApDispatchListColumns";

// 단일 그리드(main) — 운임미발행배차목록. 동적 컬럼(요율항목)은 조회 시 재생성.
export type GridKey = "main";

export function useNoApDispatchListModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 동적 컬럼 (조회 시 요율항목 CHG_CD 메타로 재생성)
  const [mainColumnDefs, setMainColumnDefs] =
    useState<any[]>(MAIN_COLUMN_DEFS);

  // 공통코드 — 서버 NoApDispatchListModel stores 대응
  const { codeMap } = useCommonStores({
    dlvryYnList: { sqlProp: "CODE", keyParam: "TMS_OTD_STSFED" },
    dspchEvntTcd: { sqlProp: "CODE", keyParam: "DSPCH_EVNT_TCD" },
    dspchOpStsList: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    dspchTpList: { sqlProp: "CODE", keyParam: "DSPCH_TP" },
  });

  return { ...base, mainColumnDefs, setMainColumnDefs, codeMap };
}

export type NoApDispatchListModel = ReturnType<typeof useNoApDispatchListModel>;
