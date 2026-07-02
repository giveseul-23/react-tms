// 배차상세정보 팝업 Controller — DispatchDetailPop 에서 분리.
//  데이터 로더/핸들러/검증/액션배열 + 인터랙티브 컬럼(dspchCols) 보유.
//  상태는 useDispatchDetailPopModel 이 소유, 여기서는 그 setter/값을 사용해 로직만 담당.

import { useEffect, useMemo, useRef } from "react";
import {
  commitRowChanges,
  captureOrig,
} from "@/app/components/grid/gridUtils/rowStatus";
import { newRid } from "@/app/feature/useBaseModel";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/app/components/ui/popover";
import { ActionItem } from "@/app/components/ui/GridActionsBar";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { useApiHandler } from "@/hooks/useApiHandler";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import DispatchMemoPopup from "@/app/components/popup/DispatchMemoPopup";
import PredictEstimateTimetoArrivalPop from "@/features/tms/pln/dispatchPlan/popup/PredictEstimateTimetoArrivalPop";
import SplitQtyPop from "@/features/tms/pln/dispatchPlan/popup/SplitQtyPop";
import { Lang } from "@/app/services/common/Lang";
import { DSPCH_OP_STS } from "@/app/components/grid/status/statusEnums";
import { dispatchPlanVehApi as api } from "@/features/tms/pln/dspchplnveh/DispatchPlanVehApi";
import { MENU_CODE } from "@/features/tms/pln/dspchplnveh/DispatchPlanVeh";
import {
  DSPCH_INFO_COLS,
  ORDER_COLS,
} from "@/app/components/popup/dispatchDetail/DispatchDetailPopColumns";
import type { DispatchDetailPopModel } from "@/app/components/popup/dispatchDetail/DispatchDetailPopModel";

// API 응답 rows 추출 (dsOut / result 양쪽 지원)
const rowsOf = (res: any) => res?.data?.data?.dsOut ?? res?.data?.result ?? [];

// 저장(dsSave)용 행에 EDIT_STS:"U" 부여 (센차 rowStatus='U' 대응)
const markU = (rows: any[]) => rows.map((r) => ({ ...r, EDIT_STS: "U" }));

// raw 배열 그리드 행에 안정 id(__rid__) + 원본 스냅샷 부여.
//   commitRowChanges 가 그리드 행(p.node.data)과 원본 state 를 __rid__/참조로 매칭하려면
//   원본 행에 __rid__ 가 있어야 한다 (useBaseModel ensureRid 와 동일 역할).
const withRid = (rows: any[]) =>
  rows.map((r) => {
    const next = { ...r, __rid__: newRid() };
    captureOrig(next);
    return next;
  });

type ControllerArgs = {
  model: DispatchDetailPopModel;
  initValue: Record<string, string>;
  cntrVeh: boolean;
};

export function useDispatchDetailPopController({
  model,
  initValue,
  cntrVeh,
}: ControllerArgs) {
  const { menuName } = useMenuMeta();
  const showError = useErrorAlert();
  const { handleApi } = useApiHandler();
  const { openPopup, closePopup } = usePopup();

  const {
    setDspchRowData,
    dspchRowData,
    setRouteRowData,
    routeRowData,
    setAssignShpmRow,
    setAssignItemRow,
    setUnAssignShpmRow,
    setUnAssignItemRow,
    setUnAssignSearching,
    unAssignShpmRow,
    unallocCond,
    selDspch,
    setSelDspch,
    dspchCheckedRef,
    codeMap,
    editingRidRef,
    setDspchMasking,
    setRouteMasking,
    setAllocMasking,
    setUnallocMasking,
  } = model;

  // 제약해제여부(YN)↔사유(RSN) 실시간 가이드 — 이 화면 로컬 규칙.
  //   YN 체크 ON → 즉시 경고 + 사유 셀 필수(빨강) 표시. OFF → 사유 자동 클리어.
  const dspchCols = useMemo(
    () =>
      DSPCH_INFO_COLS.map((c: any) => {
        if (c.field === "CONSTRAINT_OVRD_YN") {
          return {
            ...c,
            editable: false, // 토글은 아래 커스텀 체크박스가 직접 처리
            cellRenderer: (p: any) => {
              const row = p.node?.data;
              if (!row || p.node?.rowPinned) return null;
              const checked = p.value === "Y";
              return (
                <div className="flex items-center justify-center h-full">
                  <input
                    type="checkbox"
                    className="ag-input-field-input ag-checkbox-input"
                    checked={checked}
                    onChange={() => {
                      const rowIndex = p.node.rowIndex;
                      if (checked) {
                        // Y → N: 사유 동시 클리어
                        commitRowChanges(setDspchRowData, row, {
                          CONSTRAINT_OVRD_YN: "N",
                          CONSTRAINT_OVRD_RSN_CD: "",
                        });
                      } else {
                        // 편집 시작 전 마커 억제 → commit re-render 시 에러 메시지 안 뜸.
                        editingRidRef.current = row.__rid__ ?? null;
                        commitRowChanges(setDspchRowData, row, {
                          CONSTRAINT_OVRD_YN: "Y",
                        });
                      }
                      // commitRowChanges 의 re-render 후 처리하도록 지연.
                      setTimeout(() => {
                        if (checked) {
                          // YN→N: RSN 값 변화 없어 ag-grid 가 refresh 안 함 → 마커 수동 갱신.
                          p.api?.refreshCells({
                            rowNodes: p.node ? [p.node] : undefined,
                            columns: ["CONSTRAINT_OVRD_RSN_CD"],
                            force: true,
                          });
                        } else {
                          // 사유 선택 유도 — RSN 셀 편집 시작(콤보 오픈 + 포커스).
                          p.api?.startEditingCell({
                            rowIndex,
                            colKey: "CONSTRAINT_OVRD_RSN_CD",
                          });
                        }
                      }, 0);
                    }}
                  />
                </div>
              );
            },
          };
        }
        if (c.field === "CONSTRAINT_OVRD_RSN_CD") {
          return {
            ...c,
            editable: true, // 사유 선택 가능 (제약해제 Y인 행)
            cellRenderer: (p: any) => {
              const row = p.node?.data;
              if (!row || p.node?.rowPinned) return p.value ?? null;
              const code = p.value;
              const label =
                code == null || code === ""
                  ? ""
                  : (codeMap.constraintOvrdCd?.[String(code)] ?? code);
              const need =
                row.CONSTRAINT_OVRD_YN === "Y" &&
                !label &&
                editingRidRef.current !== row.__rid__; // 편집 중이면 마커 숨김
              if (need) {
                // regexTp/자릿수 검증과 동일한 인라인 마커 — "!" 배지 + 셀 밖 floating 메시지.
                return (
                  <Popover open>
                    <PopoverAnchor asChild>
                      <div className="flex items-center gap-1 h-full w-full">
                        <span className="min-w-0 truncate text-red-600">
                          {label}
                        </span>
                        <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                          !
                        </span>
                      </div>
                    </PopoverAnchor>
                    <PopoverContent
                      side="bottom"
                      align="start"
                      sideOffset={2}
                      hideWhenDetached
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      className="w-auto max-w-[260px] px-2 py-1 text-[11px] text-red-600 border border-red-200 bg-red-50 shadow rounded"
                    >
                      제약해제 사유를 선택해 주세요.
                    </PopoverContent>
                  </Popover>
                );
              }
              return (
                <span className="px-2 py-0.5 rounded-lg text-xs">
                  {label || "-"}
                </span>
              );
            },
          };
        }
        return c;
      }),
    [codeMap, setDspchRowData, editingRidRef],
  );

  const runMask = <T,>(setMask: (b: boolean) => void, p: Promise<T>) => {
    setMask(true);
    return p.finally(() => setMask(false));
  };

  // 확인 다이얼로그 (base.confirm 동일 패턴) — "확인" 시 onYes 실행
  const confirmMsg = (msg: string, onYes: () => void, title = "확인") => {
    openPopup({
      type: "confirm",
      width: "lg",
      content: (
        <ConfirmModal
          title={title}
          description={msg}
          type="confirm"
          onClose={() => {
            closePopup();
            onYes();
          }}
        />
      ),
    });
  };

  // 요청 시퀀스 가드 — 같은 종류의 조회가 겹칠 때(연속 선택/탭전환/할당 후 재조회) 최신 응답만 반영.
  //   응답이 도착순과 무관하게 out-of-order 로 와도, 마지막 요청 seq 와 다르면 폐기 → 잘못/빈 화면 방지.
  const seqRef = useRef<Record<string, number>>({});
  const nextSeq = (key: string) =>
    (seqRef.current[key] = (seqRef.current[key] ?? 0) + 1);
  const isLatest = (key: string, seq: number) => seq === seqRef.current[key];

  // 할당주문 행의 품목 조회 (SHPM_ID 기준)
  const loadAssignItems = (row: any) => {
    if (!row?.SHPM_ID) {
      setAssignItemRow([]);
      return;
    }
    const seq = nextSeq("assignItem");
    api
      .searchAssignedShipmentDetail({ SHPM_ID: row.SHPM_ID })
      .then((res) => {
        if (!isLatest("assignItem", seq)) return;
        setAssignItemRow(rowsOf(res));
      });
  };

  // 미할당주문 행의 품목 조회 (SHPM_ID 기준)
  const loadUnAssignItems = (row: any) => {
    if (!row?.SHPM_ID) {
      setUnAssignItemRow([]);
      return;
    }
    const seq = nextSeq("unassignItem");
    api
      .searchUnAssignedShipmentDetail({ SHPM_ID: row.SHPM_ID })
      .then((res) => {
        if (!isLatest("unassignItem", seq)) return;
        setUnAssignItemRow(rowsOf(res));
      });
  };

  const subParams = (record: any) => ({
    DSPCH_NO: record.DSPCH_NO,
    TRIP_ID: record.TRIP_ID,
    PLN_ID: record.PLN_ID,
    TTL_FI_DIST: record.TTL_FI_DIST,
  });

  // 배송경로(경유지) 조회 — 처리 중 배송경로 그리드 마스킹
  const loadRoute = (record: any) => {
    if (!record) {
      setRouteRowData([]);
      return Promise.resolve();
    }
    const seq = nextSeq("route");
    return runMask(setRouteMasking, api.searchPlanStop(subParams(record))).then(
      (res) => {
        if (!isLatest("route", seq)) return;
        setRouteRowData(rowsOf(res));
      },
    );
  };

  // 할당주문 조회 (첫 행 품목까지) — 처리 중 할당주문 그리드 마스킹
  const loadAssigned = (record: any) => {
    if (!record) {
      setAssignShpmRow([]);
      setAssignItemRow([]);
      return Promise.resolve();
    }
    const seq = nextSeq("assigned");
    return runMask(
      setAllocMasking,
      api.searchAssignedShipment(subParams(record)),
    ).then((res) => {
      if (!isLatest("assigned", seq)) return;
      const rows = rowsOf(res);
      setAssignShpmRow(rows);
      loadAssignItems(rows[0]);
    });
  };

  // 배차행 선택 → 배송경로 + 할당주문 동시 재조회 (record 없으면 서브 비움)
  const loadSub = (record: any) => {
    setSelDspch(record ?? null);
    return Promise.all([loadRoute(record), loadAssigned(record)]);
  };

  // 배차그리드 체크박스 선택 변경 — 주문할당 대상(체크 1건) 추적.
  //   행 클릭(cascade 표시)과 무관하게, "사용자가 체크한 배차"만 할당 대상으로 본다.
  const onDspchSelectionRows = (rows: any[]) => {
    dspchCheckedRef.current = rows ?? [];
  };

  // 미할당주문 조회 (배송유형 조건) → 첫 행 품목까지
  const handleUnallocOrderSearch = () => {
    const seq = nextSeq("unalloc");
    setUnAssignSearching(true);
    api
      .getUnallocOrderList({
        DIV_CD: initValue.DIV_CD,
        LGST_GRP_CD: initValue.LGST_GRP_CD,
        PLN_ID: initValue.PLN_ID,
        DLVRY_DT: initValue.DLVRY_DT,
        DLVRY_TP: unallocCond.DLVRY_TP === "ALL" ? "" : unallocCond.DLVRY_TP,
      })
      .then((res) => {
        if (!isLatest("unalloc", seq)) return;
        const rows = rowsOf(res);
        setUnAssignShpmRow(rows);
        loadUnAssignItems(rows[0]);
      })
      .finally(() => {
        // 더 최신 요청이 진행 중이면 그 요청이 스피너를 관리하도록 둔다.
        if (isLatest("unalloc", seq)) setUnAssignSearching(false);
      });
  };

  // 주문할당 — 선택 미할당주문 행을 "체크한 배차"(정확히 1건)에 할당 → 미할당/할당 재조회.
  //   대상 배차는 auto-first(selDspch)가 아니라 배차그리드 체크박스 선택 기준.
  // 공용 할당 코어 — 체크한 대상 배차(정확히 1건)에 넘어온 미할당 행들을 할당
  const assignShipments = (rows: any[]) => {
    const checked = dspchCheckedRef.current ?? [];
    if (checked.length === 0) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    if (checked.length > 1) {
      showError(Lang.get("MSG_CHECK_SINGLE_RECORD"));
      return;
    }
    const targetDspch = checked[0];
    if (!targetDspch?.DSPCH_NO) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    runMask(
      setUnallocMasking,
      api.saveAssignedShipment(
        rows.map((r) => ({ ...r, DSPCH_NO: targetDspch.DSPCH_NO })),
      ),
    ).then(() => {
      handleUnallocOrderSearch();
      // 메인 배차목록도 재조회 (수량/적재율 갱신) + 방금 할당한 배차 선택 유지
      fetchDspchAndSelect(targetDspch.DSPCH_NO);
    });
  };

  // 주문할당 버튼 — 체크된 미할당 행들 할당
  const onAssignShipment = (e: any) =>
    assignShipments((e?.data ?? []) as any[]);

  // 미할당주문 행 더블클릭 — 주문할당과 동일 처리(더블클릭한 행 1건)
  const onUnallocRowDblClick = (row: any) =>
    assignShipments(row ? [row] : []);

  // 주문할당취소 — 선택 할당주문 행을 미할당으로 → 할당/배송경로/미할당 재조회
  const onUnassignedShipment = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    runMask(setAllocMasking, api.saveUnAssignedShipment(rows)).then(() => {
      // 메인 배차목록도 재조회 (수량/적재율 갱신) + 보던 배차 선택 유지
      fetchDspchAndSelect(selDspch?.DSPCH_NO);
      handleUnallocOrderSearch();
    });
  };

  // 할당주문 그리드 액션 — 주문할당취소 (dispatchPlan 할당주문 탭 동일 기능)
  const allocActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_UNASSIGNED_SHIPMENT",
      label: "BTN_UNASSIGNED_SHIPMENT",
      onClick: onUnassignedShipment,
    },
  ];

  // 미할당주문 그리드 액션 — 주문할당 + 엑셀(dispatchPlan 미할당탭 동일 기능)
  const unallocActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_ASSIGN_SHIPMENT",
      label: "BTN_ASSIGN_SHIPMENT",
      onClick: onAssignShipment,
    },
    makeExcelGroupAction({
      excelColumns: () => ORDER_COLS,
      menuCode: MENU_CODE,
      menuName,
      fetchFn: () =>
        api.getUnallocOrderList({
          DIV_CD: initValue.DIV_CD,
          LGST_GRP_CD: initValue.LGST_GRP_CD,
          PLN_ID: initValue.PLN_ID,
          DLVRY_DT: initValue.DLVRY_DT,
          DLVRY_TP: unallocCond.DLVRY_TP === "ALL" ? "" : unallocCond.DLVRY_TP,
        }),
      rows: unAssignShpmRow,
    }),
  ];

  // 미할당 품목 라인분할 — 선택 품목 단건 → 라인분할 저장 → 동일 SHPM 품목 재조회
  const onSplitLineUnalloc = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    const sub = rows[0];
    runMask(
      setUnallocMasking,
      api.saveSplitShipmentLine([{ ...sub, rowStatus: "U" }]),
    ).then(() => handleUnallocOrderSearch());
  };
  // 미할당 품목 수량분할 — 선택 품목 단건 → SplitQtyPop → 수량분할 저장 → 재조회
  const onSplitQtyUnalloc = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    const sub = rows[0];
    openPopup({
      title: "BTN_ITEM_QTY_SPLIT",
      width: "lg",
      content: (
        <SplitQtyPop
          record={{ ...sub, DSPCH_NO: selDspch?.DSPCH_NO }}
          onConfirm={(payload) => {
            closePopup();
            runMask(setUnallocMasking, api.saveSplitShipmentQty(payload)).then(
              () => handleUnallocOrderSearch(),
            );
          }}
          onClose={closePopup}
        />
      ),
    });
  };
  // 미할당주문 품목 그리드 액션 — 라인분할 / 수량분할 (dispatchPlan unallocSubActions 동일)
  const unallocSubActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_ITEM_LINE_SPLIT",
      label: "BTN_ITEM_LINE_SPLIT",
      onClick: onSplitLineUnalloc,
    },
    {
      type: "button",
      key: "BTN_ITEM_QTY_SPLIT",
      label: "BTN_ITEM_QTY_SPLIT",
      onClick: onSplitQtyUnalloc,
    },
  ];

  // 배차목록 재조회 코어 — 조회 후 대상 배차 선택(pickDspchNo 있으면 그 배차, 없으면 첫 행)해 하위 재조회.
  const fetchDspchAndSelect = (pickDspchNo?: string) =>
    api
      .searchDispatchPop({
        DSPCH_NO: initValue.DSPCH_NO,
        VEH_ID: initValue.VEH_ID,
        DLVRY_DT: initValue.DLVRY_DT,
        DIV_CD: initValue.DIV_CD,
        LGST_GRP_CD: initValue.LGST_GRP_CD,
        PLN_ID: initValue.PLN_ID,
      })
      .then((res) => {
        const rows = withRid(rowsOf(res));
        setDspchRowData(rows);
        // 재조회 시 이전 체크 선택 초기화 (auto-first 는 cascade 표시용일 뿐, 할당 대상 아님).
        dspchCheckedRef.current = [];
        const target = pickDspchNo
          ? rows.find((r) => String(r.DSPCH_NO) === String(pickDspchNo))
          : undefined;
        return loadSub(target ?? rows[0]);
      });

  // 배차목록 재조회 → 첫 배차행 기준 하위(할당주문/배송경로) 자동 재조회 (저장/처리 후 호출)
  const refreshDspch = () => fetchDspchAndSelect();

  // 저장 (센차 onSave) — 수정행(EDIT_STS:"U")만 saveDispatchRtnNo 저장.
  //  제약무시(CONSTRAINT_OVRD_YN:"Y") 인데 사유(CONSTRAINT_OVRD_RSN_CD) 미입력이면 저장 불가.
  const onSaveDispatchRtnNo = () => {
    const dirty = dspchRowData.filter((r) => r.EDIT_STS === "U");
    const invalidRsn = dirty.some(
      (r) =>
        (r.CONSTRAINT_OVRD_YN === "Y" || r.CONSTRAINT_OVRD_YN === true) &&
        !r.CONSTRAINT_OVRD_RSN_CD,
    );
    if (invalidRsn) {
      showError(Lang.get("MSG_REQ_CONSTRAINT_OVRD_RSN"));
      return;
    }
    runMask(
      setDspchMasking,
      handleApi(api.saveDispatchRtnNo(dirty)).then(refreshDspch),
    ).catch(() => {});
  };

  // ── 배차목록 액션 (dspchplnveh dedActions 동일 기능, 팝업 행=DSPCH_NO 보유) ──
  // 신규배차 생성 (Sencha onCreateNewDspch) — 선택 차량 행으로 빈 배차 생성
  const onCreateNewDspch = () => {
    const params = {
      VEH_ID: initValue.VEH_ID,
      DRVR_ID: initValue.DRVR_ID,
      DRVR_NM: initValue.DRVR_NM,
      DLVRY_DT: initValue.DLVRY_DT,
      DIV_CD: initValue.DIV_CD,
      LGST_GRP_CD: initValue.LGST_GRP_CD,
      PLN_ID: initValue.PLN_ID,
      CARR_CD: initValue.CARR_CD,
      PAY_CARR_CD: initValue.PAY_CARR_CD,
      VEH_TP_CD: initValue.VEH_TP_CD,
      AP_PROC_TP: initValue.AP_PROC_TP,
      VEH_OP_TP: initValue.VEH_OP_TP,
    };
    runMask(
      setDspchMasking,
      api.saveCreateEmptyDispatch([params]).then(refreshDspch),
    );
  };
  // 배차취소(자차)
  const onCancelDspch = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    runMask(
      setDspchMasking,
      api.saveCancelPlanDedDispatch(markU(rows)).then(refreshDspch),
    );
  };
  // 계획확정
  const onSetPlanned = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_EXCEPTION_DISPATCH_SET_TO_PLAN_SELECT"));
      return;
    }
    confirmMsg(Lang.get("MSG_CONFIRM_DSPCH_OPEN_ONLY"), () => {
      runMask(
        setDspchMasking,
        api.savePlannedPlanDispatch(markU(rows)).then(refreshDspch),
      );
    });
  };
  // 계획확정취소
  const onReturnOpen = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_EXCEPTION_DISPATCH_RTN_TO_OPEN_SELECT"));
      return;
    }
    runMask(
      setDspchMasking,
      api.saveCancelPlannedPlanDispatch(markU(rows)).then(refreshDspch),
    );
  };
  // 메모 등록 (단건)
  const onMemoReg = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    if (rows.length > 1) {
      showError(Lang.get("MSG_CHECK_SINGLE_RECORD"));
      return;
    }
    const row = rows[0];
    if (!row?.DSPCH_NO) {
      showError("배차가 없어 메모를 등록할 수 없습니다.");
      return;
    }
    openPopup({
      title: "LBL_MEMO",
      width: "4xl",
      content: (
        <DispatchMemoPopup
          row={row}
          statusLabel={
            codeMap.dspchOpSts?.[row.DSPCH_OP_STS] ??
            String(row.DSPCH_OP_STS ?? "")
          }
          fetchMemo={(dspchNo) => api.searchDispatchMemo({ DSPCH_NO: dspchNo })}
          saveMemo={(record) => api.saveDispatchMemo(record)}
          onSaved={() => {
            closePopup();
            refreshDspch();
          }}
          onClose={closePopup}
        />
      ),
    });
  };
  // 메모 취소 (단건)
  const onMemoCancel = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    if (rows.length > 1) {
      showError(Lang.get("MSG_CHECK_SINGLE_RECORD"));
      return;
    }
    confirmMsg("메모를 취소하시겠습니까?", () => {
      runMask(setDspchMasking, api.cancelDspchMemo(rows).then(refreshDspch));
    });
  };
  // 경유순서 자동조정 (단건) — saveAutoChangeStopSeq
  const onAutoChangeStopSeq = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_EXCEPTION_STOP_RESEQUENCE_DISPATCH_SELECT"));
      return;
    }
    if (rows.length > 1) {
      showError(Lang.get("MSG_STOP_RE_SEQ_DISPATCH_CHK"));
      return;
    }
    runMask(
      setDspchMasking,
      api
        .saveAutoChangeStopSeq(rows.map((r) => ({ ...r, rowStatus: "U" })))
        .then(refreshDspch),
    );
  };

  // 배차목록 그리드 액션 — dedActions 와 라벨 동일 버튼은 동일 기능 연결.
  // (BTN_SAVE → onSaveDispatchRtnNo: 회전수/제약무시 저장)
  // 임시용차(cntrVeh)면 배차생성(BTN_MANAGE_DSPCH)·저장(BTN_SAVE) 숨김
  //  → 메모 / 계획확정 / 경유순서자동조정 3개만 노출 (센차 cntrVeh 동일).
  const dspchActions: ActionItem[] = [
    ...(cntrVeh
      ? []
      : ([
          {
            type: "group",
            key: "BTN_MANAGE_DSPCH",
            label: "BTN_MANAGE_DSPCH",
            items: [
              {
                type: "button",
                key: "LBL_CREATE_NEW_DSPCH",
                label: "LBL_CREATE_NEW_DSPCH",
                onClick: onCreateNewDspch,
              },
              {
                type: "button",
                key: "BTN_DISPATCH_CANCEL",
                label: "BTN_DISPATCH_CANCEL",
                onClick: onCancelDspch,
              },
            ],
          },
        ] as ActionItem[])),
    {
      type: "group",
      key: "LBL_MEMO",
      label: "LBL_MEMO",
      items: [
        {
          type: "button",
          key: "BTN_REGISTRATION",
          label: "BTN_REGISTRATION",
          onClick: onMemoReg,
        },
        {
          type: "button",
          key: "BTN_CANCEL",
          label: "BTN_CANCEL",
          onClick: onMemoCancel,
        },
      ],
    },
    {
      type: "group",
      key: "BTN_SET_TO_PLANNED",
      label: "BTN_SET_TO_PLANNED",
      items: [
        {
          type: "button",
          key: "BTN_SET_TO_PLANNED",
          label: "BTN_SET_TO_PLANNED",
          onClick: onSetPlanned,
        },
        {
          type: "button",
          key: "BTN_RETURN_TO_OPEN",
          label: "BTN_RETURN_TO_OPEN",
          onClick: onReturnOpen,
        },
      ],
    },
    ...(cntrVeh
      ? []
      : ([
          {
            type: "button",
            key: "BTN_SAVE",
            label: "BTN_SAVE",
            onClick: onSaveDispatchRtnNo,
          },
        ] as ActionItem[])),
    {
      type: "button",
      key: "BTN_STOP_RESEQUENCE",
      label: "BTN_STOP_RESEQUENCE",
      onClick: onAutoChangeStopSeq,
    },
  ];

  // ── 배송경로 액션 (dispatchPlan stopActions 동일 기능) ──
  // 선택 배차행(selDspch) + 배송경로 행(routeRowData) 기준
  const validatorPredictEta = (row: any) => {
    if (!row?.DSPCH_NO) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return false;
    }
    if (row.DSPCH_OP_STS >= DSPCH_OP_STS.IN_TRANSIT) {
      showError(Lang.get("MSG_PRIDICT_ETA_EXCEPTION_WHEN_IN_TRANSIT"));
      return false;
    }
    if (row.DSPCH_OP_STS >= DSPCH_OP_STS.COMPLETED) {
      showError(Lang.get("MSG_PRIDICT_ETA_EXCEPTION_WHEN_DELIVERED"));
      return false;
    }
    return true;
  };
  const validatorCalcEta = (row: any) => {
    if (!row?.DSPCH_NO) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return false;
    }
    if (row.DSPCH_OP_STS < DSPCH_OP_STS.IN_TRANSIT) {
      showError(
        Lang.get("MSG_CAL_ETA_EXCEPTION_BEFORE_TRANSIT_PARTIALLY_DELIVERED"),
      );
      return false;
    }
    if (row.DSPCH_OP_STS === DSPCH_OP_STS.COMPLETED) {
      showError(Lang.get("MSG_CAL_ETA_EXCEPTION_DELIVERED"));
      return false;
    }
    if (
      row.DSPCH_OP_STS === DSPCH_OP_STS.IN_TRANSIT ||
      row.DSPCH_OP_STS === DSPCH_OP_STS.DELIVERED_PARTIALLY
    ) {
      const blocked = routeRowData.find(
        (d) => d.ATA_DTTM != null && d.ATD_DTTM == null,
      );
      if (blocked) {
        showError(
          Lang.get("MSG_CAL_ETA_EXCEPTION_IN_TRANSIT", [
            row.VEH_NO,
            blocked.LOC_NM,
          ]),
        );
        return false;
      }
    }
    return true;
  };

  // ETA 예측 — 운송시작일 입력 팝업 → predictEta → 배송경로 재조회
  const onPredictEta = () => {
    if (!validatorPredictEta(selDspch)) return;
    openPopup({
      title: "BTN_PREDICT_ETA",
      width: "sm",
      content: (
        <PredictEstimateTimetoArrivalPop
          onConfirm={(data) => {
            closePopup();
            runMask(
              setRouteMasking,
              api.predictEta({
                ATD_DTTM: data.TRNS_STDT_DATE,
                DSPCH_NO: selDspch.DSPCH_NO,
                TRIP_ID: selDspch.TRIP_ID,
                TRIP_SEQ: selDspch.TRIP_SEQ,
                DIV_CD: initValue.DIV_CD,
                LGST_GRP_CD: initValue.LGST_GRP_CD,
              }),
            ).then(() => loadRoute(selDspch));
          }}
          onClose={closePopup}
        />
      ),
    });
  };
  // ETA 계산 → 배송경로 재조회
  const onCalcEta = () => {
    if (!validatorCalcEta(selDspch)) return;
    runMask(setRouteMasking, api.calcEta({ DSPCH_NO: selDspch.DSPCH_NO })).then(
      () => loadRoute(selDspch),
    );
  };
  // 경유순서 저장
  const onSaveStopOrder = () => {
    if (!selDspch?.DSPCH_NO) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    runMask(
      setRouteMasking,
      api.saveStopOrder({ DSPCH_NO: selDspch.DSPCH_NO, stops: routeRowData }),
    ).then(() => loadRoute(selDspch));
  };

  // 경유순서 조정(+/-) 공통 검증 — 배차행(selDspch) + 단건 선택 + 차고지/경계/타입 검증.
  //   dir "plus"=위로(이전 경유처와 swap), "minus"=아래로(다음 경유처와 swap).
  //   prev/next 는 STOP_SEQ 기준 routeRowData 인접 행(행에 __rid__ 없어 STOP_SEQ 로 매칭).
  const checkAdjustStopSeq = (
    routeRows: any[],
    dir: "plus" | "minus",
  ): boolean => {
    if (!selDspch?.DSPCH_NO) {
      showError(Lang.get("MSG_SELECT_NO_DATA")); // 센차 mainGrid 선택('DFT')
      return false;
    }
    if (!routeRows.length) {
      showError(Lang.get("MSG_SELECT_STOP_CHK"));
      return false;
    }
    if (routeRows.length > 1) {
      showError(Lang.get("MSG_STOP_SEQUENCE_ADJUST_ONE_STOP"));
      return false;
    }
    const present = routeRows[0];
    if (present.STOP_TP === "99") {
      showError(Lang.get("MSG_ERR_MOVE_GARAGE_STOP"));
      return false;
    }
    const idx = routeRowData.findIndex(
      (r) => String(r.STOP_SEQ) === String(present.STOP_SEQ),
    );
    if (dir === "plus") {
      if (Number(present.STOP_SEQ) === 1) {
        showError(Lang.get("MSG_STOP_SEQUENCE_PREVIOUS_STOP_VALID_CHK"));
        return false;
      }
      const prev = routeRowData[idx - 1];
      if (!prev || present.STOP_TP !== prev.STOP_TP) {
        showError(Lang.get("MSG_STOP_SEQUENCE_VALID_CHK"));
        return false;
      }
    } else {
      // 마지막 경유처면 아래로 이동 불가 (센차 gridTotalCnt 의도 — 마지막 행 판정)
      if (idx === routeRowData.length - 1) {
        showError(Lang.get("MSG_LAST_STOP_SEQ"));
        return false;
      }
      const next = routeRowData[idx + 1];
      if (!next || present.STOP_TP !== next.STOP_TP) {
        showError(Lang.get("MSG_STOP_SEQUENCE_VALID_CHK"));
        return false;
      }
    }
    return true;
  };

  // 경유순서 조정 저장 — rowStatus 'U' + DOCK_CMMT_YN 존재 시 확인 후 저장 → 배송경로 재조회.
  const adjustStopSeq = (rows: any[], apiFn: (r: any[]) => Promise<any>) => {
    const payload = markU(rows);
    const hasDockCmmt = rows.some((r) => r.DOCK_CMMT_YN === "Y");
    const doSave = () =>
      runMask(setRouteMasking, apiFn(payload)).then(() => loadRoute(selDspch));
    if (hasDockCmmt) {
      confirmMsg(
        Lang.get("MSG_ASK_SAVE_STOP_SEQ_DOCK_CMMT"),
        doSave,
        Lang.get("TTL_CONFIRM"),
      );
    } else {
      doSave();
    }
  };

  // 경유순서 조정(+) — 선택 경유처를 위로
  const onAdjustStopSeqPlus = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) return;
    if (!checkAdjustStopSeq(rows, "plus")) return;
    adjustStopSeq(rows, api.saveAdjustPlanStopSeqPlus);
  };
  // 경유순서 조정(-) — 선택 경유처를 아래로
  const onAdjustStopSeqMinus = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) return;
    if (!checkAdjustStopSeq(rows, "minus")) return;
    adjustStopSeq(rows, api.saveAdjustPlanStopSeqMinus);
  };

  // 배송경로 그리드 액션 — stopActions 와 라벨 동일 버튼은 동일 기능 연결.
  // (BTN_SPLIT_STOP 은 원본도 빈 스텁 → 미연동 유지)
  const routeActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_PREDICT_ETA",
      label: "BTN_PREDICT_ETA",
      onClick: onPredictEta,
    },
    {
      type: "button",
      key: "BTN_CALCULATE_ETA",
      label: "BTN_CALCULATE_ETA",
      onClick: onCalcEta,
    },
    { type: "button", key: "BTN_SPLIT_STOP", label: "BTN_SPLIT_STOP" },
    {
      type: "button",
      key: "BTN_ADJUST_STOP_SEQ_PLUS",
      label: "BTN_ADJUST_STOP_SEQ_PLUS",
      onClick: onAdjustStopSeqPlus,
    },
    {
      type: "button",
      key: "BTN_ADJUST_STOP_SEQ_MINUS",
      label: "BTN_ADJUST_STOP_SEQ_MINUS",
      onClick: onAdjustStopSeqMinus,
    },
    {
      type: "button",
      key: "BTN_ADJUST_STOP_SEQ",
      label: "BTN_ADJUST_STOP_SEQ",
      onClick: onSaveStopOrder,
    },
  ];

  // 진입 시 배차목록 조회
  useEffect(() => {
    refreshDspch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initValue]);

  return {
    dspchCols,
    dspchActions,
    routeActions,
    allocActions,
    unallocActions,
    unallocSubActions,
    loadSub,
    onDspchSelectionRows,
    loadAssignItems,
    loadUnAssignItems,
    onUnallocRowDblClick,
    handleUnallocOrderSearch,
  };
}
