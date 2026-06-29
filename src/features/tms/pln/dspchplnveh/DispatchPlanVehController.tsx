import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchPlanVehApi as api } from "./DispatchPlanVehApi";
import type { DispatchPlanVehModel, GridKey } from "./DispatchPlanVehModel";
import { ActionItem } from "@/app/components/ui/GridActionsBar";
import { MENU_CODE } from "./DispatchPlanVeh";
import { getFirstDispatchTripKey } from "./DispatchPlanVehColumns";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import {
  makeExcelGroupAction,
  makeExcelUploadAction,
  makeExcelTemplateDownloadAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { commonApi } from "@/app/services/common/commonApi";
import { Lang } from "@/app/services/common/Lang";
import {
  DSPCH_OP_STS,
  AP_FI_STS,
} from "@/app/components/grid/status/statusEnums";
import DispatchMemoPopup from "@/app/components/popup/DispatchMemoPopup";
import DspchCountPop from "./popup/DspchCountPop";
import DispatchPrintPop from "./popup/DispatchPrintPop";
import RegiSpotPop from "./popup/RegiSpotPop";
import SendSmsPopCarr from "./popup/SendSmsPopCarr";
import SendSmsAppInstallPop from "./popup/SendSmsAppInstallPop";
import CarrierChangePop from "./popup/CarrierChangePop";
import TonGroupChangePop from "./popup/TonGroupChangePop";
import ChangeVehiclePopup from "@/app/components/popup/ChangeVehiclePopup";
import DtoDTrckChangePop from "./popup/DtoDTrckChangePop";
import TtoDTrckChangePop from "./popup/TtoDTrckChangePop";
import DtoTTrckChangePop from "./popup/DtoTTrckChangePop";
import CreateItineraryDispatchPop from "../dispatchPlan/popup/CreateItineraryDispatchPop";
import CreateItineraryGrpDispatchPop from "../dispatchPlan/popup/CreateItineraryGrpDispatchPop";

interface Args {
  model: DispatchPlanVehModel;
}

// 다중 그리드 행을 저장(dsSave)용으로 EDIT_STS:"U" 부여 (센차 rowStatus='U' 대응)
const markU = (rows: any[]) => rows.map((r) => ({ ...r, EDIT_STS: "U" }));

export function useDispatchPlanVehController({ model }: Args) {
  const { menuName } = useMenuMeta();
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();

  // 상단 SearchFilters 가 넘기는 공통 검색 파라미터(부서/운영그룹/배송일/계획ID 등)
  const baseParams = useCallback(() => {
    const r = model.rawFiltersRef.current;
    return {
      DIV_CD: r.SRCH_DSPCH_DIV_CD,
      LGST_GRP_CD: r.SRCH_DSPCH_LGST_GRP_CD,
      DLVRY_DT: r.SRCH_DSPCH_DLVRY_DT,
      PLN_ID: r.SRCH_DSPCH_PLN_ID,
    };
  }, [model.rawFiltersRef]);

  // ── 상단 조회 → 좌측(물동형) + 우측(고정/임시) 동시 로드 ────────
  const fetchList = useCallback(() => {
    return api.searchShpmVolumePerLocation(baseParams());
  }, [baseParams]);

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.locationShpmVolume.setData(data);
      const p = baseParams();
      base.searchSub("locationDspch", api.searchDspchPerLocation(p));
      base.searchSub("dedicatedTruck", api.searchDedicatedTruckDispatchList(p));
      base.searchSub("tempTruck", api.searchTempTruckDispatchList(p));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model.grids.locationShpmVolume, base],
  );

  // ── 좌측 탭별 재조회 (물동형 / 배차내역) ──────────────────────
  const loadVolume = useCallback(
    (extra: Record<string, unknown> = {}) =>
      base.searchSub(
        "locationShpmVolume",
        api.searchShpmVolumePerLocation({ ...baseParams(), ...extra }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base],
  );

  const loadDspch = useCallback(
    (extra: Record<string, unknown> = {}) =>
      base.searchSub(
        "locationDspch",
        api.searchDspchPerLocation({ ...baseParams(), ...extra }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base],
  );

  // 전체 재조회 (센차 searchAll) — 저장/처리 후 호출
  const refresh = useCallback(() => base.search(), [base]);

  // ── 그리드 간 드래그드랍 (자차 ↔ 용차 교차만) ──────────────────
  //  자차→용차: DtoT 팝업 → saveSimpleDedicatedToTempDspch (IS_TRIP=Y 면 확인)
  //  용차→자차: TtoD 팝업 → saveTempDspchToDedicatedTrck
  //  같은 종류(자차↔자차/용차↔용차)는 드롭 대상 아님 (드롭존 미등록).
  // 자차→용차: 신규배차생성 차량선택 팝업(용차) → 선택차량을 할당차량으로 DtoT 확정.
  //  드롭한 용차 행은 쓰지 않고, 차량선택 팝업에서 고른 용차를 표시·검증용 target 으로 사용.
  //  (저장 payload 는 source(자차) 기준 그대로 — 서버가 선호용차 자동 선정)
  const openDtoTChange = useCallback(
    (source: any, rtnNo?: number) => {
      const p = baseParams();
      openPopup({
        title: "LBL_CREATE_NEW_DSPCH",
        width: "4xl",
        content: (
          <ChangeVehiclePopup
            fetchVehicles={(q) =>
              api.searchVehiclePop({
                lgstGrpCd: q.LGST_GRP_CD,
                carrCd: q.CARR_CD,
                carrNm: q.CARR_NM,
                vehId: q.VEH_ID,
                vehTpCd: q.VEH_TP_CD,
                vehNo: q.VEH_NO,
                vehOpTp: q.VEH_OP_TP,
              })
            }
            lockVehOpTp="110"
            initialValues={{
              LGST_GRP_CD: p.LGST_GRP_CD,
              VEH_TP_CD: source?.VEH_TP_CD,
            }}
            onConfirm={(veh) => {
              closePopup();
              openPopup({
                title: "BTN_CHANGE_TO_TEMP_VEH",
                width: "3xl",
                content: (
                  <DtoTTrckChangePop
                    source={source}
                    target={veh}
                    defaultRtn={rtnNo}
                    conditions={{
                      DLVRY_DT: p.DLVRY_DT,
                      LGST_GRP_CD: p.LGST_GRP_CD,
                      DIV_CD: p.DIV_CD,
                      PLN_ID: p.PLN_ID,
                    }}
                    onConfirm={(payload) => {
                      closePopup();
                      const doSave = () =>
                        base
                          .callAjax(
                            api.saveSimpleDedicatedToTempDspch(payload),
                            {
                              mask: "dedicatedTruck",
                            },
                          )
                          .then(refresh);
                      // trip 이면 모든 트립 차량 변경 확인 (센차 MSG_ALERT_TRIP_VEH_CHANGE)
                      if (payload.IS_TRIP === "Y") {
                        base.confirm(
                          Lang.get("MSG_ALERT_TRIP_VEH_CHANGE"),
                          doSave,
                        );
                      } else {
                        doSave();
                      }
                    }}
                    onClose={closePopup}
                  />
                ),
              });
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, baseParams, openPopup, closePopup, refresh],
  );

  const openTtoDChange = useCallback(
    (source: any, target: any, rtnNo?: number) => {
      const p = baseParams();
      openPopup({
        title: "BTN_CHANGE_TO_DED_VEH",
        width: "xl",
        content: (
          <TtoDTrckChangePop
            source={source}
            target={target}
            defaultRtn={rtnNo}
            conditions={{
              DLVRY_DT: p.DLVRY_DT,
              LGST_GRP_CD: p.LGST_GRP_CD,
              DIV_CD: p.DIV_CD,
              PLN_ID: p.PLN_ID,
            }}
            onConfirm={(payload) => {
              closePopup();
              base
                .callAjax(api.saveTempDspchToDedicatedTrck(payload), {
                  mask: "tempTruck",
                })
                .then(refresh);
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, baseParams, openPopup, closePopup, refresh],
  );

  // 드롭 라우터 — sourceGridId/targetGridId 로 교차 조합 분기.
  const onGridDrop = useCallback(
    (e: {
      sourceGridId: string;
      targetGridId: string;
      sourceRows: any[];
      targetRow: any;
      /** 회전카드 드롭 시 회전번호 (TtoD 회전수 기본값). */
      rtnNo?: number;
    }) => {
      const src = e.sourceRows?.[0];
      if (!src) return;
      if (
        e.sourceGridId === "dedicatedTruck" &&
        e.targetGridId === "tempTruck"
      ) {
        // 자차→용차: 배차(배송지) 없는 차량은 변경 불가 (센차 noShippingLoc)
        if (src.RTN_PATH_B1_R1 == null && src.RTN_PATH_B2_R1 == null) return;
        openDtoTChange(src, e.rtnNo);
      } else if (
        e.sourceGridId === "tempTruck" &&
        e.targetGridId === "dedicatedTruck"
      ) {
        // 용차→자차: 드롭한 자차 차량행이 target (분할 모드는 회전카드 → rtnNo 기본값)
        if (!e.targetRow) return;
        openTtoDChange(src, e.targetRow, e.rtnNo);
      }
      // 같은 종류 드롭은 무시
    },
    [openDtoTChange, openTtoDChange],
  );

  // 선택 검증 헬퍼
  const need = useCallback(
    (rows: any[], msgKey: string) => {
      if (!rows || rows.length === 0) {
        base.alert(Lang.get(msgKey));
        return false;
      }
      return true;
    },
    [base],
  );
  const needSingle = useCallback(
    (rows: any[], msgKey: string) => {
      if (rows.length > 1) {
        base.alert(Lang.get(msgKey));
        return false;
      }
      return true;
    },
    [base],
  );

  // ════════════════ 자차(dedicatedTruck) 핸들러 ════════════════

  // 차량교환/이동 — 2건 선택 → DtoD 교환 팝업
  const onVehicleSwapDed = useCallback(
    (rows: any[]) => {
      if (rows.length !== 2) {
        base.alert(Lang.get("MSG_SEL_VEH_TO_SWAP"));
        return;
      }
      const p = baseParams();
      openPopup({
        title: "BTN_VEHICLE_SWAP",
        width: "3xl",
        content: (
          <DtoDTrckChangePop
            source={rows[0]}
            target={rows[1]}
            conditions={{
              DLVRY_DT: p.DLVRY_DT,
              LGST_GRP_CD: p.LGST_GRP_CD,
              PLN_ID: p.PLN_ID,
            }}
            onConfirm={(payload) => {
              closePopup();
              base
                .callAjax(api.dedicatedTrckChange(payload), {
                  mask: "dedicatedTruck",
                })
                .then(refresh);
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, baseParams, openPopup, closePopup, refresh],
  );

  // 차량위치조회
  // 차량위치조회 — 우측 슬라이드 패널로 표시 (View 가 model.vehLocPanelOpen 을 구독)
  const onShowVehLocation = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_EXCEPTION_SHOW_VEHICLE_NO_SELECT_CHK")) return;
      model.setVehLocRows(rows);
      model.setVehLocPanelOpen(true);
    },
    [need, model],
  );

  // 패널이 열려 있을 때 체크/선택 변경 시 선택 차량으로 리프레시 (검증/오픈 없음)
  const refreshVehLoc = useCallback(
    (rows: any[]) => {
      if (model.vehLocPanelOpen) model.setVehLocRows(rows ?? []);
    },
    [model],
  );

  // 자차 배차취소
  const onCancelDspchDed = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      base.confirm(Lang.get("MSG_CANCEL_DSPCH_OPEN_STATUS"), () => {
        base
          .callAjax(api.saveCancelPlanDedDispatch(markU(rows)), {
            mask: "dedicatedTruck",
          })
          .then(refresh);
      });
    },
    [base, need, refresh],
  );

  // 자차 계획확정
  const onSetPlannedDed = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_EXCEPTION_DISPATCH_SET_TO_PLAN_SELECT")) return;
      base.confirm(Lang.get("MSG_CONFIRM_DSPCH_OPEN_ONLY"), () => {
        base
          .callAjax(api.savePlannedPlanDispatch(markU(rows)), {
            mask: "dedicatedTruck",
          })
          .then(refresh);
      });
    },
    [base, need, refresh],
  );

  // 자차 계획확정취소
  const onReturnOpenDed = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_EXCEPTION_DISPATCH_RTN_TO_OPEN_SELECT")) return;
      base
        .callAjax(api.saveCancelPlannedPlanDispatch(markU(rows)), {
          mask: "dedicatedTruck",
        })
        .then(refresh);
    },
    [base, need, refresh],
  );

  // 메모 등록(자차) — 공통 배차메모 팝업 (단건만)
  const onMemoRegDed = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      if (!needSingle(rows, "MSG_CHECK_SINGLE_RECORD")) return;
      const row = rows[0];

      // 자차 행은 DSPCH_NO 가 없고 회전별 배차키(TRIP_KEY_B1_Rn)로 들어옴 → 첫 배차키를 DSPCH_NO 로
      const dspchNo = getFirstDispatchTripKey(row);
      if (!dspchNo) {
        base.alert("배차된 회전이 없어 메모를 등록할 수 없습니다.");
        return;
      }
      const setRow = { ...row, DSPCH_NO: dspchNo };
      openPopup({
        title: "LBL_MEMO",
        width: "4xl",
        content: (
          <DispatchMemoPopup
            row={setRow}
            statusLabel={
              model.codeMap.dspchOpSts?.[row.DSPCH_OP_STS] ??
              String(row.DSPCH_OP_STS ?? "")
            }
            fetchMemo={(dspchNo) =>
              api.searchDispatchMemo({ DSPCH_NO: dspchNo })
            }
            saveMemo={(record) => api.saveDispatchMemo(record)}
            onSaved={() => {
              closePopup();
              refresh();
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [
      base,
      need,
      needSingle,
      openPopup,
      closePopup,
      refresh,
      model.codeMap.dspchOpSts,
    ],
  );

  // 메모 취소(자차) — 선택행 배차메모 등록취소 (단건만)
  const onMemoCancelDed = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      if (!needSingle(rows, "MSG_CHECK_SINGLE_RECORD")) return;
      base.confirm("메모를 취소하시겠습니까?", () => {
        base
          .callAjax(api.cancelDspchMemo(rows), { mask: "dedicatedTruck" })
          .then(refresh);
      });
    },
    [base, need, needSingle, refresh],
  );

  // 레포트 출력 — 옵션 팝업 (OZ 리포트 연동은 TODO)
  const onReport = useCallback(() => {
    openPopup({
      title: "BTN_REPORT",
      width: "md",
      content: (
        <DispatchPrintPop
          onConfirm={() => {
            closePopup();
            // TODO: OZ 리포트 호출 (PRINT_TYPE/PRINT_RANGE + baseParams)
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [openPopup, closePopup]);

  // ════════════════ 용차(tempTruck) 핸들러 ════════════════

  // 임시차량 등록
  const onRegSpotVeh = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_DEDICATED_DSPCH")) return;
      if (!needSingle(rows, "MSG_SELECT_DEDICATED_DSPCH")) return;
      const row = rows[0];
      openPopup({
        title: "BTN_REG_SPOT_VEH",
        width: "lg",
        content: (
          <RegiSpotPop
            initialValues={row}
            onConfirm={(patch) => {
              closePopup();
              base
                .callAjax(
                  api.saveDspchSpotVeh({
                    DSPCH_NO: row.DSPCH_NO,
                    LGST_GRP_CD: row.LGST_GRP_CD,
                    DIV_CD: row.DIV_CD,
                    PLN_ID: row.PLN_ID,
                    DLVRY_DT: row.DLVRY_DT,
                    VEH_ID: row.VEH_ID,
                    VEH_TP_CD: row.VEH_TP_CD,
                    VEH_TP_NM: row.VEH_TP_NM,
                    DRVR_ID: row.DRVR_ID,
                    VEH_NO: patch.VEH_NO,
                    DRVR_NM: patch.DRVR_NM,
                  }),
                )
                .then(refresh);
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, need, needSingle, openPopup, closePopup, refresh],
  );

  // 고정차량변경(용차→자차) — 차량선택 → TtoD 확정
  const onChangeToDedVeh = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SEL_VEH_TO_CHANGE")) return;
      if (!needSingle(rows, "MSG_SEL_VEH_TO_CHANGE")) return;
      const src = rows[0];
      const p = baseParams();
      openPopup({
        title: "BTN_CHANGE_TO_DED_VEH",
        width: "4xl",
        content: (
          <ChangeVehiclePopup
            fetchVehicles={(p) => api.searchDispatchChangeVehiclePop(p)}
            lockVehOpTp="100"
            initialValues={{
              LGST_GRP_CD: src.LGST_GRP_CD,
              DSPCH_NO: src.DSPCH_NO,
              ORG_VEH_ID: src.VEH_ID,
            }}
            onConfirm={(veh) => {
              closePopup();
              openPopup({
                title: "BTN_CHANGE_TO_DED_VEH",
                width: "xl",
                content: (
                  <TtoDTrckChangePop
                    source={src}
                    target={veh}
                    conditions={{
                      DLVRY_DT: p.DLVRY_DT,
                      LGST_GRP_CD: p.LGST_GRP_CD,
                      DIV_CD: p.DIV_CD,
                      PLN_ID: p.PLN_ID,
                    }}
                    onConfirm={(payload) => {
                      closePopup();
                      base
                        .callAjax(api.saveTempDspchToDedicatedTrck(payload), {
                          mask: "tempTruck",
                        })
                        .then(refresh);
                    }}
                    onClose={closePopup}
                  />
                ),
              });
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, need, needSingle, baseParams, openPopup, closePopup, refresh],
  );

  // 계약차 신규배차
  const onCreateNewDspch = useCallback(() => {
    const p = baseParams();
    openPopup({
      title: "LBL_CREATE_NEW_DSPCH",
      width: "4xl",
      content: (
        <ChangeVehiclePopup
          fetchVehicles={(q) =>
            api.searchVehiclePop({
              lgstGrpCd: q.LGST_GRP_CD,
              carrCd: q.CARR_CD,
              carrNm: q.CARR_NM,
              vehId: q.VEH_ID,
              vehTpCd: q.VEH_TP_CD,
              vehNo: q.VEH_NO,
              vehOpTp: q.VEH_OP_TP,
            })
          }
          lockVehOpTp="110"
          initialValues={{ LGST_GRP_CD: p.LGST_GRP_CD }}
          onConfirm={(veh) => {
            closePopup();
            base
              .callAjax(
                api.saveCreateEmptyDispatchCntrVeh([
                  {
                    ...veh,
                    DLVRY_DT: p.DLVRY_DT,
                    PLN_ID: p.PLN_ID,
                    LGST_GRP_CD: p.LGST_GRP_CD,
                    DIV_CD: p.DIV_CD,
                    DSPCH_TP: "10",
                    BATCH_NO: 1,
                    EDIT_STS: "U",
                  },
                ]),
                { mask: "tempTruck" },
              )
              .then(refresh);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, baseParams, openPopup, closePopup, refresh]);

  // 고정노선배차생성
  const onCreateItinerary = useCallback(() => {
    const bp = baseParams();
    const DIV_CD = bp.DIV_CD;
    const LGST_GRP_CD = bp.LGST_GRP_CD;
    const DLVRY_DT = bp.DLVRY_DT;
    const PLN_ID = bp.PLN_ID;
    openPopup({
      title: "BTN_CREATE_ITINERARY_PLAN",
      width: "xl",
      content: (
        <CreateItineraryDispatchPop
          initialValues={{ DIV_CD, LGST_GRP_CD, DLVRY_DT, PLN_ID }}
          onConfirm={(picked) => {
            closePopup();
            const rows = picked.map((p) => ({
              ...p,
              DIV_CD,
              LGST_GRP_CD,
              DLVRY_DT,
              PLN_ID,
            }));
            base
              .callAjax(api.saveCreateItineraryGroupDispatch(rows), {
                mask: "tempTruck",
              })
              .then(() =>
                base.searchSub("tempTruck", api.searchTempCarrierToChange(bp)),
              );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [baseParams, openPopup, closePopup, base]);

  //고정그룹배차생성
  const onCreateItineraryGrpDispatch = useCallback(() => {
    const bp = baseParams();
    const DIV_CD = bp.DIV_CD;
    const LGST_GRP_CD = bp.LGST_GRP_CD;
    const DLVRY_DT = bp.DLVRY_DT;
    const PLN_ID = bp.PLN_ID;
    const BATCH_NO = 1;

    openPopup({
      title: "BTN_CREATE_ITINERARY_GRP_PLAN",
      width: "2xl",
      content: (
        <CreateItineraryGrpDispatchPop
          initialValues={{ DIV_CD, LGST_GRP_CD, DLVRY_DT, PLN_ID, BATCH_NO }}
          onConfirm={(picked) => {
            closePopup();
            const rows = picked.map((p) => ({
              ...p,
              DIV_CD,
              LGST_GRP_CD,
              DLVRY_DT,
              PLN_ID,
              BATCH_NO,
            }));
            base
              .callAjax(api.saveCreateItineraryGroupDispatch(rows), {
                mask: "tempTruck",
              })
              .then(() =>
                base.searchSub("tempTruck", api.searchTempCarrierToChange(bp)),
              );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [baseParams, openPopup, closePopup, base]);

  // 용차 배차취소 — 전부 신규(2010)만 가능
  const onCancelDspchTemp = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      if (rows.some((r) => r.DSPCH_OP_STS !== DSPCH_OP_STS.OPEN)) {
        base.alert(Lang.get("MSG_CANCEL_DSPCH_OPEN_STATUS"));
        return;
      }
      base
        .callAjax(api.saveCancelPlanDispatchTemp(markU(rows)), {
          mask: "tempTruck",
        })
        .then(refresh);
    },
    [base, need, refresh],
  );

  // 용차 배차복사
  const onCopyDspch = useCallback(
    (rows: any[]) => {
      if (rows.length !== 1) {
        base.alert(Lang.get("MSG_SEL_VEH_TO_COPY"));
        return;
      }
      const row = rows[0];
      openPopup({
        title: "BTN_COPY_DSPCH",
        width: "md",
        content: (
          <DspchCountPop
            onConfirm={({ DSPCH_CNT }) => {
              closePopup();
              base
                .callAjax(
                  api.copyTempDispatch({
                    OLD_DSPCH_NO: row.DSPCH_NO,
                    LGST_GRP_CD: row.LGST_GRP_CD,
                    DSPCH_CNT,
                  }),
                  { mask: "tempTruck" },
                )
                .then(refresh);
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, openPopup, closePopup, refresh],
  );

  // 운수사 변경 — 상태(2010/2060) 검증 → 운수사변경 팝업
  const onChangeCarrier = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      if (
        rows.some(
          (r) =>
            r.DSPCH_OP_STS !== DSPCH_OP_STS.OPEN &&
            r.DSPCH_OP_STS !== DSPCH_OP_STS.TENDER_CANCELED,
        )
      ) {
        base.alert(Lang.get("MSG_ERR_CHANGE_CARRIER_STATUS"));
        return;
      }
      openPopup({
        title: "BTN_CHANGE_CARRIER",
        width: "3xl",
        content: (
          <CarrierChangePop
            initialValues={{
              LGST_GRP_CD: rows[0].LGST_GRP_CD,
              ...(rows.length === 1 && {
                DSPCH_NO: rows[0].DSPCH_NO,
                PLN_WGT: rows[0].PLN_NET_WGT,
                VEH_TP_NM: rows[0].VEH_TP_NM,
              }),
            }}
            onConfirm={({ CARR_CD, VEH_ID }) => {
              closePopup();
              const saveRows = markU(rows).map((r) => ({
                ...r,
                CARR_CD,
                CHANGE_VEH_ID: VEH_ID,
              }));
              base
                .callAjax(api.saveChangeCarrier(saveRows), {
                  mask: "tempTruck",
                })
                .then(refresh);
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, need, openPopup, closePopup, refresh],
  );

  // 톤급 변경 — 상태(AP_FI_STS < OPEN(4010)) 검증 → 톤급변경 팝업
  const onChangeTonType = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      if (rows.some((r) => String(r.AP_FI_STS ?? "") >= AP_FI_STS.OPEN)) {
        base.alert(Lang.get("MSG_ERR_CHANGE_TON_GROUP_STATUS"));
        return;
      }
      openPopup({
        title: "BTN_CHANGE_TON_TYPE",
        width: "2xl",
        content: (
          <TonGroupChangePop
            onConfirm={({ VEH_TP_CD }) => {
              closePopup();
              const saveRows = markU(rows).map((r) => ({
                ...r,
                TRG_VEH_TP_CD: VEH_TP_CD,
              }));
              base
                .callAjax(api.saveChangeTonType(saveRows), {
                  mask: "tempTruck",
                })
                .then(refresh);
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, need, openPopup, closePopup, refresh],
  );

  // 메모 등록(용차) — 공통 배차메모 팝업 (단건만)
  const onMemoRegTemp = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      if (!needSingle(rows, "MSG_CHECK_SINGLE_RECORD")) return;
      const row = rows[0];
      if (!row?.DSPCH_NO) {
        base.alert("배차가 없어 메모를 등록할 수 없습니다.");
        return;
      }
      openPopup({
        title: "LBL_MEMO",
        width: "4xl",
        content: (
          <DispatchMemoPopup
            row={row}
            statusLabel={
              model.codeMap.dspchOpSts?.[row.DSPCH_OP_STS] ??
              String(row.DSPCH_OP_STS ?? "")
            }
            fetchMemo={(dspchNo) =>
              api.searchDispatchMemo({ DSPCH_NO: dspchNo })
            }
            saveMemo={(record) => api.saveDispatchMemo(record)}
            onSaved={() => {
              closePopup();
              refresh();
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [
      base,
      need,
      needSingle,
      openPopup,
      closePopup,
      refresh,
      model.codeMap.dspchOpSts,
    ],
  );

  // 메모 취소(용차) — 선택행 배차메모 등록취소 (단건만)
  const onMemoCancelTemp = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      if (!needSingle(rows, "MSG_CHECK_SINGLE_RECORD")) return;
      base.confirm("메모를 취소하시겠습니까?", () => {
        base
          .callAjax(api.cancelDspchMemo(rows), { mask: "tempTruck" })
          .then(refresh);
      });
    },
    [base, need, needSingle, refresh],
  );

  // 용차 계획확정
  const onSetPlannedTemp = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_EXCEPTION_DISPATCH_SET_TO_PLAN_SELECT")) return;
      base
        .callAjax(api.savePlannedPlanDispatchTemp(markU(rows)), {
          mask: "tempTruck",
        })
        .then(refresh);
    },
    [base, need, refresh],
  );

  // 용차 계획확정취소 — 신규(2010)는 불가
  const onReturnOpenTemp = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      if (rows.some((r) => r.DSPCH_OP_STS === DSPCH_OP_STS.OPEN)) {
        base.alert("배차 확정 취소할 수 없는 상태입니다.");
        return;
      }
      base
        .callAjax(api.saveCancelTender(markU(rows)), { mask: "tempTruck" })
        .then(refresh);
    },
    [base, need, refresh],
  );

  // 앱설치 SMS 발송
  const onSendSmsAppInstall = useCallback(
    (rows: any[]) => {
      if (!need(rows, "MSG_SELECT_NO_DATA")) return;
      const row = rows[0];
      openPopup({
        title: "BTN_SEND_SMS_FOR_INSTALL",
        width: "lg",
        content: (
          <SendSmsAppInstallPop
            initialValues={{ DSPCH_NO: row.DSPCH_NO }}
            onConfirm={({ MBL_PHN_NO }) => {
              closePopup();
              base.callAjax(
                api.sendSmsForAppInstall({
                  DSPCH_NO: row.DSPCH_NO,
                  DIV_CD: row.DIV_CD,
                  LGST_GRP_CD: row.LGST_GRP_CD,
                  DRVR_ID: row.DRVR_ID,
                  MBL_PHN_NO,
                }),
              );
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, need, openPopup, closePopup],
  );

  // 배송요청 확인문자 발송(운수사) — 운수사 콤보 로드 후 팝업
  const onSendSmsToCarr = useCallback(() => {
    const lgstGrpCd = baseParams().LGST_GRP_CD;
    commonApi
      .getCodesAndNames({
        key: "dsOut",
        sqlProp: "selectCarrierFromLogisticsGroup",
        keyParam: "LGST_GRP_CD",
        LGST_GRP_CD: lgstGrpCd,
      } as any)
      .then((res: any) => {
        const opts = res?.data?.data?.dsOut ?? [];
        openPopup({
          title: "BTN_SEND_SMS_TO_CARR",
          width: "lg",
          content: (
            <SendSmsPopCarr
              initialValues={{ LGST_GRP_CD: lgstGrpCd }}
              carrOptions={opts}
              onConfirm={({ LGST_GRP_CD, CARR_CD }) => {
                closePopup();
                base.callAjax(api.sendSmsToCarr({ LGST_GRP_CD, CARR_CD }));
              }}
              onClose={closePopup}
            />
          ),
        });
      })
      .catch(console.error);
  }, [base, baseParams, openPopup, closePopup]);

  // ════════════════ 액션 배열 ════════════════

  const dedActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_VEHICLE_SWAP",
        label: "BTN_VEHICLE_SWAP",
        onClick: (e: any) => onVehicleSwapDed(e?.data ?? []),
      },
      {
        type: "button",
        key: "BTN_SHOW_VEHICLE_LOCATION",
        label: "BTN_SHOW_VEHICLE_LOCATION",
        onClick: (e: any) => onShowVehLocation(e?.data ?? []),
      },
      {
        type: "group",
        key: "BTN_DISPATCH_CREATE_DELETE",
        label: "BTN_DISPATCH_CREATE_DELETE",
        items: [
          {
            type: "button",
            key: "BTN_DISPATCH_CANCEL",
            label: "BTN_DISPATCH_CANCEL",
            onClick: (e: any) => onCancelDspchDed(e?.data ?? []),
          },
          makeExcelUploadAction({ menuCode: MENU_CODE, onUploaded: refresh }),
          makeExcelTemplateDownloadAction({
            menuCode: MENU_CODE,
            fileName: menuName,
          }),
          makeExcelTemplateDownloadAction({
            menuCode: MENU_CODE,
            gridId: "DED_MULTI_PICK",
            fileName: menuName,
            key: "BTN_MULTI_PICK_EXCEL_TEMPLATE_DOWNLOAD",
            label: "BTN_MULTI_PICK_EXCEL_TEMPLATE_DOWNLOAD",
          }),
        ],
      },
      {
        type: "group",
        key: "LBL_MEMO",
        label: "LBL_MEMO",
        items: [
          {
            type: "button",
            key: "BTN_REGISTRATION",
            label: "BTN_REGISTRATION",
            onClick: (e: any) => onMemoRegDed(e?.data ?? []),
          },
          {
            type: "button",
            key: "BTN_CANCEL",
            label: "BTN_CANCEL",
            onClick: (e: any) => onMemoCancelDed(e?.data ?? []),
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
            onClick: (e: any) => onSetPlannedDed(e?.data ?? []),
          },
          {
            type: "button",
            key: "BTN_RETURN_TO_OPEN",
            label: "BTN_RETURN_TO_OPEN",
            onClick: (e: any) => onReturnOpenDed(e?.data ?? []),
          },
        ],
      },
      {
        type: "button",
        key: "BTN_REPORT",
        label: "BTN_REPORT",
        onClick: onReport,
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.dedicatedTruck.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.searchDedicatedTruckDispatchList(baseParams()),
        rows: () => model.grids.dedicatedTruck.rows,
      }),
    ],
    [
      baseParams,
      menuName,
      model.grids.dedicatedTruck,
      refresh,
      onVehicleSwapDed,
      onShowVehLocation,
      onCancelDspchDed,
      onMemoRegDed,
      onMemoCancelDed,
      onSetPlannedDed,
      onReturnOpenDed,
      onReport,
    ],
  );

  const conActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_REG_SPOT_VEH",
        label: "BTN_REG_SPOT_VEH",
        onClick: (e: any) => onRegSpotVeh(e?.data ?? []),
      },
      {
        type: "button",
        key: "BTN_CHANGE_TO_DED_VEH",
        label: "BTN_CHANGE_TO_DED_VEH",
        onClick: (e: any) => onChangeToDedVeh(e?.data ?? []),
      },
      {
        type: "button",
        key: "BTN_SHOW_VEHICLE_LOCATION",
        label: "BTN_SHOW_VEHICLE_LOCATION",
        onClick: (e: any) => onShowVehLocation(e?.data ?? []),
      },
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
            key: "BTN_CREATE_ITINERARY_PLAN",
            label: "BTN_CREATE_ITINERARY_PLAN",
            onClick: (e: any) => onCreateItinerary(),
          },
          {
            type: "button",
            key: "BTN_CREATE_ITINERARY_GRP_PLAN",
            label: "BTN_CREATE_ITINERARY_GRP_PLAN",
            onClick: (e: any) => onCreateItineraryGrpDispatch(),
          },
          {
            type: "button",
            key: "BTN_DISPATCH_CANCEL",
            label: "BTN_DISPATCH_CANCEL",
            onClick: (e: any) => onCancelDspchTemp(e?.data ?? []),
          },
          {
            type: "button",
            key: "BTN_COPY_DSPCH",
            label: "BTN_COPY_DSPCH",
            onClick: (e: any) => onCopyDspch(e?.data ?? []),
          },
          makeExcelTemplateDownloadAction({
            menuCode: MENU_CODE,
            gridId: "DED_MULTI_PICK",
            fileName: menuName,
            key: "BTN_MULTI_PICK_EXCEL_TEMPLATE_DOWNLOAD",
            label: "BTN_MULTI_PICK_EXCEL_TEMPLATE_DOWNLOAD",
          }),
        ],
      },
      {
        type: "group",
        key: "BTN_CHANGE",
        label: "BTN_CHANGE",
        items: [
          {
            type: "button",
            key: "BTN_CHANGE_CARRIER",
            label: "BTN_CHANGE_CARRIER",
            onClick: (e: any) => onChangeCarrier(e?.data ?? []),
          },
          {
            type: "button",
            key: "BTN_CHANGE_TON_TYPE",
            label: "BTN_CHANGE_TON_TYPE",
            onClick: (e: any) => onChangeTonType(e?.data ?? []),
          },
        ],
      },
      {
        type: "group",
        key: "LBL_MEMO",
        label: "LBL_MEMO",
        items: [
          {
            type: "button",
            key: "BTN_REGISTRATION",
            label: "BTN_REGISTRATION",
            onClick: (e: any) => onMemoRegTemp(e?.data ?? []),
          },
          {
            type: "button",
            key: "BTN_CANCEL",
            label: "BTN_CANCEL",
            onClick: (e: any) => onMemoCancelTemp(e?.data ?? []),
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
            onClick: (e: any) => onSetPlannedTemp(e?.data ?? []),
          },
          {
            type: "button",
            key: "BTN_RETURN_TO_OPEN",
            label: "BTN_RETURN_TO_OPEN",
            onClick: (e: any) => onReturnOpenTemp(e?.data ?? []),
          },
          {
            type: "button",
            key: "BTN_SEND_SMS_FOR_INSTALL",
            label: "BTN_SEND_SMS_FOR_INSTALL",
            onClick: (e: any) => onSendSmsAppInstall(e?.data ?? []),
          },
          {
            type: "button",
            key: "BTN_SEND_SMS_TO_CARR",
            label: "BTN_SEND_SMS_TO_CARR",
            onClick: onSendSmsToCarr,
          },
        ],
      },
    ],
    [
      onCreateNewDspch,
      menuName,
      onSendSmsToCarr,
      onRegSpotVeh,
      onChangeToDedVeh,
      onShowVehLocation,
      onCreateItinerary,
      onCreateItineraryGrpDispatch,
      onCancelDspchTemp,
      onCopyDspch,
      onChangeCarrier,
      onChangeTonType,
      onMemoRegTemp,
      onMemoCancelTemp,
      onSetPlannedTemp,
      onReturnOpenTemp,
      onSendSmsAppInstall,
    ],
  );

  // 좌측 그리드 엑셀(보이는 데이터만)
  const volumeActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        hideAll: true,
        excelColumns: () => model.grids.locationShpmVolume.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.searchShpmVolumePerLocation(baseParams()),
        rows: () => model.grids.locationShpmVolume.rows,
      }),
    ],
    [baseParams, menuName, model.grids.locationShpmVolume],
  );

  const dspchActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        hideAll: true,
        excelColumns: () => model.grids.locationDspch.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.searchDspchPerLocation(baseParams()),
        rows: () => model.grids.locationDspch.rows,
      }),
    ],
    [baseParams, menuName, model.grids.locationDspch],
  );

  return {
    fetchList,
    onSearchCallback,
    loadVolume,
    loadDspch,
    dedActions,
    conActions,
    volumeActions,
    dspchActions,
    onShowVehLocation,
    refreshVehLoc,
    refresh,
    onGridDrop,
  };
}
