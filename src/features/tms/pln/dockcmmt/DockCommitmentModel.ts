import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import type { DockColumn, DockEvent } from "./DockScheduler";

// main: 배차 목록 그리드 / sub01(스케줄러)은 ag-grid 가 아님 → state 로 별도 보유.
export type GridKey = "main";

export function useDockCommitmentModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 도크유형 / 착지구분(STOP_TP) / 배차진행상태(DSPCH_OP_STS)
  const { codeMap } = useCommonStores({
    dockTcd: { sqlProp: "CODE", keyParam: "DOCK_TCD" },
    stopTpList: { sqlProp: "CODE", keyParam: "STOP_TP" },
    dspchOpStsList: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
  });

  // 스케줄러 상태 — 도크(리소스/컬럼) + 확약(이벤트). 센차 me.columns / me.elist 대응.
  const [docks, setDocks] = useState<DockColumn[]>([]);
  const [events, setEvents] = useState<DockEvent[]>([]);

  return { ...base, codeMap, docks, setDocks, events, setEvents };
}

export type DockCommitmentModel = ReturnType<typeof useDockCommitmentModel>;
