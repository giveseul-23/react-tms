// 배차상세정보 팝업 Model — DispatchDetailPop 에서 분리.
//  로컬 state(6그리드 rowData/선택/미할당조건/마스킹) + 공통코드 스토어 + refs 보유.
//  (본 팝업은 useBaseModel 이 아닌 로컬 state 기반이므로 전용 hook 으로 상태를 모은다.)

import { useEffect, useRef, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";

export function useDispatchDetailPopModel(
  initValue: Record<string, string>,
  onClosed?: () => void,
) {
  // 팝업이 닫힐 때(언마운트) onClosed 1회 호출 — 메인 화면 전체 재조회.
  //   헤더 X / 내부 닫기 등 닫힘 경로와 무관하게 동작. 최신 콜백은 ref 로 참조.
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;
  useEffect(() => () => onClosedRef.current?.(), []);

  const [vehNo, setVehNo] = useState(initValue.VEH_NO);
  const [drvrNm, setDrvrNm] = useState(initValue.DRVR_NM);
  const [vehTpCd, setVehTpCd] = useState(initValue.VEH_TP_CD);

  const [dspchRowData, setDspchRowData] = useState<any[]>([]);
  const [routeRowData, setRouteRowData] = useState<any[]>([]);
  const [assignShpmRow, setAssignShpmRow] = useState<any[]>([]);
  const [assignItemRow, setAssignItemRow] = useState<any[]>([]);
  const [unAssignShpmRow, setUnAssignShpmRow] = useState<any[]>([]);
  const [unAssignItemRow, setUnAssignItemRow] = useState<any[]>([]);
  const [unAssignSearching, setUnAssignSearching] = useState(false);

  // 미할당주문 조회조건 — 배송유형만
  const [unallocCond, setUnallocCond] = useState<Record<string, string>>({
    DLVRY_TP: "ALL",
  });
  const [unallocCondOpen, setUnallocCondOpen] = useState(true);

  const { stores, codeMap } = useCommonStores({
    vehTpCd: { sqlProp: "selectVehTpList" },
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    dlvryTpList: { sqlProp: "CODE", keyParam: "HARIM_ORD_DLV_TP_CD" },
    constraintOvrdCd: { sqlProp: "CODE", keyParam: "CONSTRAINT_OVRD_CD" },
    stopTp: { sqlProp: "CODE", keyParam: "STOP_TP" },
    itmUom: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
  });

  const [selDspch, setSelDspch] = useState<any>(null); // 선택된 배차행

  // 배차그리드에서 체크박스로 선택된 행들 — 주문할당 대상(정확히 1건)에 사용.
  //   auto-first(cascade 표시용 selDspch)와 무관하게 "사용자가 체크한 배차"만 할당 대상.
  const dspchCheckedRef = useRef<any[]>([]);

  // 사유(RSN) 편집 중인 행 __rid__ — 편집 중이면 에러 마커를 숨긴다(콤보 오픈 시 메시지 가림 방지).
  const editingRidRef = useRef<string | null>(null);

  // 그리드별 마스킹(작업 차단 오버레이) — 처리 중 ON, settle 시 자동 OFF.
  // base.callAjax({ mask }) 와 동일 효과 (DataGrid loading prop).
  const [dspchMasking, setDspchMasking] = useState(false);
  const [routeMasking, setRouteMasking] = useState(false);
  const [allocMasking, setAllocMasking] = useState(false);
  const [unallocMasking, setUnallocMasking] = useState(false);

  return {
    vehNo,
    setVehNo,
    drvrNm,
    setDrvrNm,
    vehTpCd,
    setVehTpCd,
    dspchRowData,
    setDspchRowData,
    routeRowData,
    setRouteRowData,
    assignShpmRow,
    setAssignShpmRow,
    assignItemRow,
    setAssignItemRow,
    unAssignShpmRow,
    setUnAssignShpmRow,
    unAssignItemRow,
    setUnAssignItemRow,
    unAssignSearching,
    setUnAssignSearching,
    unallocCond,
    setUnallocCond,
    unallocCondOpen,
    setUnallocCondOpen,
    stores,
    codeMap,
    selDspch,
    setSelDspch,
    dspchCheckedRef,
    editingRidRef,
    dspchMasking,
    setDspchMasking,
    routeMasking,
    setRouteMasking,
    allocMasking,
    setAllocMasking,
    unallocMasking,
    setUnallocMasking,
  };
}

export type DispatchDetailPopModel = ReturnType<
  typeof useDispatchDetailPopModel
>;
