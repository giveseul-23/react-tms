// src/views/dispatchPlan/DispatchPlanController.tsx
import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchPlanApi as api } from "./dispatchPlanApi";
import { useGuard } from "@/hooks/useGuard";
import { MENU_CODE } from "./DispatchPlan";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DispatchPlanModel, GridKey } from "./DispatchPlanModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import { usePopup } from "@/app/components/popup/PopupContext";
import ChangeVehiclePopup from "@/app/components/popup/ChangeVehiclePopup";
import CreateEmptyDispatchVehiclePop from "./popup/CreateEmptyDispatchVehiclePop";
import SplitQtyPop from "./popup/SplitQtyPop";
import ChangeDlvryDatePop from "./popup/ChangeDlvryDatePop";
import RegiSpotPop from "./popup/RegiSpotPop";
import CreateItineraryDispatchPop from "./popup/CreateItineraryDispatchPop";
import CreateItineraryGrpDispatchPop from "./popup/CreateItineraryGrpDispatchPop";
import DispatchMemoPopup from "@/app/components/popup/DispatchMemoPopup";
import PredictEstimateTimetoArrivalPop from "./popup/PredictEstimateTimetoArrivalPop";
import CreateQtyDispatchPop from "./popup/CreateQtyDispatchPop";
import { showErrorModal } from "@/app/components/popup/showErrorModal";

interface Args {
  model: DispatchPlanModel;
}

export function useDispatchPlanController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { guardHasData } = useGuard();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getDispatchPlanList(params),
    [],
  );

  // master 클릭 → stop, allocOrder cascade (unalloc 은 별도 조회)
  const onMainGridClick = useCallback(
    (row: any) => {
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "stop",
            fetch: (r) => api.getStopList({ DSPCH_NO: r.DSPCH_NO }),
          },
          {
            to: "allocOrder",
            fetch: (r) => api.getAllocOrderList({ DSPCH_NO: r.DSPCH_NO }),
          },
        ],
        { alsoReset: ["unallocOrder", "allocSub", "unallocSub"] },
      );
      // 차량위치 패널이 열려 있으면 클릭한 차량으로 패널 리프레시
      if (model.vehLocPanelOpen && row) model.setVehLocRows([row]);
    },
    [base, model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // alloc 행 클릭 → allocSub fetch
  const onAllocOrderRowClicked = useCallback(
    (row: any) => {
      if (!row?.ORD_NO) return;
      base.handleRowClick("allocOrder", row, [
        {
          to: "allocSub",
          fetch: (r) => api.getAllocOrderItemList({ ORD_NO: r.ORD_NO }),
        },
      ]);
    },
    [base],
  );

  // unalloc 행 클릭 → unallocSub fetch
  const onUnallocOrderRowClicked = useCallback(
    (row: any) => {
      if (!row?.ORD_NO) return;
      base.handleRowClick("unallocOrder", row, [
        {
          to: "unallocSub",
          fetch: (r) => api.getUnallocOrderItemList({ ORD_NO: r.ORD_NO }),
        },
      ]);
    },
    [base],
  );

  const handleUnallocAndAllocOrderSearch = useCallback(
    (cfg: {
      cond: Record<string, string>;
      searching: (v: boolean) => void;
      onSearch: (params: Record<string, unknown>) => Promise<any>;
      setData: (d: any) => void;
      extraParams?: Record<string, unknown>;
    }) => {
      const { cond, searching, onSearch, setData, extraParams } = cfg;
      const srchObj = model.rawFiltersRef.current;
      const c = cond;
      searching(true);
      onSearch({
        DIV_CD: srchObj["SRCH_DSPCH_DIV_CD"],
        LGST_GRP_CD: srchObj["SRCH_DSPCH_LGST_GRP_CD"],
        PLN_ID: srchObj["SRCH_DSPCH_PLN_ID"],
        DLVRY_DT: srchObj["SRCH_DSPCH_DLVRY_DT"],
        CUST_ITEM_CD: c.ITEM_CD,
        ITEM_NM: c.ITEM_NM,
        DLVRY_TP: c.DLVRY_TP === "ALL" ? "" : c.DLVRY_TP,
        TO_LOC_CD: c.TO_LOC_CD,
        TEMP_TCD: c.TEMP_TCD === "ALL" ? "" : c.TEMP_TCD,
        PBOX_TP: c.PBOX_TP === "ALL" ? "" : c.PBOX_TP,
        ...extraParams,
      })
        .then((res: any) => {
          const rows = res.data.result ?? res.data.data?.dsOut ?? [];
          setData({
            rows,
            totalCount: rows.length,
            page: 1,
            limit: 20,
          });
        })
        .catch((err) =>
          console.error("[DispatchPlan] order search failed", err),
        )
        .finally(() => searching(false));
    },
    [model],
  );

  // 미할당 탭 조회 (조회조건 개별 값 기반) — ITEM=품목 상세 / ALL=주문 단위 API 분기
  const handleUnallocOrderSearch = useCallback(() => {
    handleUnallocAndAllocOrderSearch({
      cond: model.unallocCond,
      searching: model.setUnallocSearching,
      onSearch:
        model.unallocCond.SRCH_FILTER === "ITEM"
          ? api.getAllocAndUnallocOrderItemList
          : api.getUnallocOrderList,
      extraParams:
        model.unallocCond.SRCH_FILTER === "" &&
        model.unallocCond.DLVRY_TP !== "ALL"
          ? {
              DLVRY_TP: model.unallocCond.DLVRY_TP,
            }
          : {},
      setData: model.grids.unallocOrder.setData,
    });
  }, [handleUnallocAndAllocOrderSearch, model]);

  // 할당 탭 조회 (조회조건 개별 값 기반) — 미할당과 동일 UI, 상태는 allocCond 로 별도 관리.
  const handleAllocOrderSearch = useCallback(() => {
    handleUnallocAndAllocOrderSearch({
      cond: model.allocCond,
      searching: model.setAllocSearching,
      onSearch:
        model.allocCond.SRCH_FILTER === "ITEM"
          ? api.getAllocAndUnallocOrderItemList
          : api.getAllocOrderList,
      setData: model.grids.allocOrder.setData,
      extraParams: {
        DSPCH_NO: model.grids.main.selectedRef.current?.DSPCH_NO,
      },
    });
  }, [handleUnallocAndAllocOrderSearch, model]);

  const handleVehMgmtSearch = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;
    const c = model.vehMgmtCond;
    model.setVehMgmtSearching(true);
    api
      .searchVehInfo({
        DIV_CD: srchObj["SRCH_DSPCH_DIV_CD"],
        LGST_GRP_CD: srchObj["SRCH_DSPCH_LGST_GRP_CD"],
        PLN_ID: srchObj["SRCH_DSPCH_PLN_ID"],
        DLVRY_DT: srchObj["SRCH_DSPCH_DLVRY_DT"],
        DRVR_NM: c.DRVR_NM,
      })
      .then((res: any) => {
        const rows = res.data.result ?? res.data.data?.dsOut ?? [];
        model.grids.vehMgmt.setData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: 20,
        });
      })
      .catch((err) =>
        console.error("[DispatchPlan] vehMgmt search failed", err),
      )
      .finally(() => model.setVehMgmtSearching(false));
  }, [model]);

  const isCheckOnlySingleSelectRecord = useCallback(
    (rows: any[], msg: string) => {
      if (rows.length > 1) {
        showErrorModal(Lang.get(msg));
        return false;
      }

      return true;
    },
    [],
  );

  // 등록차량(지입) 변경 — 단일선택 검증 후 ChangeVehiclePop → 선택 차량 머지 → 저장 → 재조회
  const onChangeRegVeh = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (
        !isCheckOnlySingleSelectRecord(
          rows,
          "MSG_EXCEPTION_ONE_VEHICLE_REPLACE",
        )
      )
        return;

      const main = rows[0];
      if (!guardHasData(main)) return;

      openPopup({
        title: "BTN_VEHICLE_CHANGE",
        width: "4xl",
        content: (
          <ChangeVehiclePopup
            fetchVehicles={(p) => api.searchChangeVehicle(p)}
            initialValues={{
              LGST_GRP_CD: main.LGST_GRP_CD,
              DSPCH_NO: main.DSPCH_NO,
              ORG_VEH_ID: main.VEH_ID,
              showType: "100",
            }}
            onConfirm={(picked) => {
              closePopup();
              base
                .callAjax(
                  api.saveChangeVehicle([
                    { ...main, ...picked, ORG_VEH_ID: main.VEH_ID },
                  ]),
                  { mask: "main" },
                )
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [isCheckOnlySingleSelectRecord, guardHasData, openPopup, closePopup, base],
  );

  // 배차생성 공통 — 본 화면 조회조건의 필수값(부서/운영그룹/배송일/계획ID) 추출 + 검증
  const requireDispatchMandatory = useCallback(() => {
    const f = model.rawFiltersRef.current ?? {};
    const DIV_CD = f["SRCH_DSPCH_DIV_CD"];
    const LGST_GRP_CD = f["SRCH_DSPCH_LGST_GRP_CD"];
    const DLVRY_DT = f["SRCH_DSPCH_DLVRY_DT"];
    const PLN_ID = f["SRCH_DSPCH_PLN_ID"];
    const DSPCH_TP = f["SRCH_DSPCH_TP"];
    if (!DIV_CD || !LGST_GRP_CD || !DLVRY_DT || !PLN_ID) {
      showInfoModal(Lang.get("MSG_DUMMY_DISPATCH_BUILD_MANDATORY_CHK"));
      return null;
    }
    return { DIV_CD, LGST_GRP_CD, DLVRY_DT, PLN_ID, DSPCH_TP };
  }, [model.rawFiltersRef]);

  // 배차생성 — 본 화면 조회조건(부서/운영그룹/배송일/계획ID) 필수 확인 후 차량 선택 팝업
  const onCreateEmptyDispatch = useCallback(() => {
    const m = requireDispatchMandatory();
    if (!m) return;
    const { DIV_CD, LGST_GRP_CD, DLVRY_DT, PLN_ID, DSPCH_TP } = m;
    openPopup({
      title: "BTN_DISPATCH_CREATE",
      width: "4xl",
      content: (
        <CreateEmptyDispatchVehiclePop
          initialValues={{ DIV_CD, LGST_GRP_CD, DLVRY_DT, PLN_ID, DSPCH_TP }}
          onConfirm={(picked) => {
            closePopup();
            const rows = picked.map((p) => ({
              ...p,
              PAY_CARR_CD: p.CARR_CD,
              PAY_CARR_NM: p.CARR_NM,
              DIV_CD,
              LGST_GRP_CD,
              DLVRY_DT,
              PLN_ID,
              DSPCH_TP,
            }));
            base
              .callAjax(api.saveCreateEmptyDispatch(rows), { mask: "main" })
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [requireDispatchMandatory, openPopup, closePopup, base]);

  //고정노선배차생성
  const onCreateItineraryDispatch = useCallback(() => {
    const m = requireDispatchMandatory();
    if (!m) return;
    const { DIV_CD, LGST_GRP_CD, DLVRY_DT, PLN_ID } = m;
    openPopup({
      title: "TTL_CREATE_ITINERARY_PLAN",
      width: "2xl",
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
                mask: "main",
              })
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [requireDispatchMandatory, openPopup, closePopup, base]);

  //고정그룹배차생성
  const onCreateItineraryGrpDispatch = useCallback(() => {
    const m = requireDispatchMandatory();
    if (!m) return;
    const { DIV_CD, LGST_GRP_CD, DLVRY_DT, PLN_ID } = m;
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
                mask: "main",
              })
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [requireDispatchMandatory, openPopup, closePopup, base]);

  // 배차취소 — 선택 배차 행 confirm 후 취소
  const onCancelPlanDispatch = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (!guardHasData(rows)) return;
      base.confirm("MSG_CHK_DELETE", () => {
        base
          .callAjax(api.saveCancelPlanDispatch(rows), { mask: "main" })
          .then(() => base.search());
      });
    },
    [guardHasData, base],
  );

  // 계획확정 — 선택 배차행
  const onPlanned = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (!guardHasData(rows)) return;
      base
        .callAjax(
          api.savePlannedPlanDispatch(
            rows.map((r) => ({ ...r, rowStatus: "U" })),
          ),
          { mask: "main" },
        )
        .then(() => base.search());
    },
    [guardHasData, base],
  );

  // 계획확정취소 — 적재요청 초과(DSPCH_OP_STS >= "2070") 행은 취소 불가
  const onCancelPlanned = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (!guardHasData(rows)) return;
      const blocked = rows.find((r) => String(r.DSPCH_OP_STS ?? "") >= "2070");
      if (blocked) {
        showInfoModal(
          Lang.get("MSG_LOADING_REQUEST_OVER_CANNOT_CANCEL", blocked.DSPCH_NO),
        );
        return;
      }
      base
        .callAjax(
          api.saveCancelPlannedPlanDispatch(
            rows.map((r) => ({ ...r, rowStatus: "U" })),
          ),
          { mask: "main" },
        )
        .then(() => base.search());
    },
    [guardHasData, base],
  );

  // 경유순서 자동조정 — 단일 선택만 허용
  const onAutoChangeStopSeq = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (rows.length === 0) {
        showInfoModal(
          Lang.get("MSG_EXCEPTION_STOP_RESEQUENCE_DISPATCH_SELECT"),
        );
        return;
      }
      if (rows.length > 1) {
        showInfoModal(Lang.get("MSG_STOP_RE_SEQ_DISPATCH_CHK"));
        return;
      }
      base
        .callAjax(
          api.saveAutoChangeStopSeq(
            rows.map((r) => ({ ...r, rowStatus: "U" })),
          ),
          { mask: "main" },
        )
        .then(() => base.search());
    },
    [base],
  );

  // 물동량 배차생성 — 본 화면 조회조건 필수값 확인 후 CreateQtyDispatchPop
  const onQtyDispatch = useCallback(() => {
    const m = requireDispatchMandatory();
    if (!m) return;
    openPopup({
      title: "LBL_CREATE_DSPCH_QTY",
      width: "full",
      content: (
        <CreateQtyDispatchPop
          initial={{
            DIV_CD: m.DIV_CD,
            LGST_GRP_CD: m.LGST_GRP_CD,
            DLVRY_DT: m.DLVRY_DT,
            PLN_ID: m.PLN_ID,
            BATCH_NO: 1,
          }}
          onApplied={() => {
            closePopup();
            base.search();
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [requireDispatchMandatory, openPopup, closePopup, base]);

  // 차량교환 — 정확히 2건 선택, 두 배차의 차량정보를 맞교환
  const onSwapVehicle = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (rows.length !== 2) {
        showInfoModal(Lang.get("MSG_SEL_VEH_TO_SWAP"));
        return;
      }
      const SWAP_FIELDS = [
        "VEH_ID",
        "CARR_CD",
        "VEH_NO",
        "VEH_TP_CD",
        "DRVR_ID",
        "DRVR_NM",
        "ASST_ID",
        "ASST_NM",
        "AP_PROC_TP",
      ];
      const swap = (dst: any, src: any) => ({
        ...dst,
        ORG_VEH_ID: dst.VEH_ID,
        ORG_VEH_NO: dst.VEH_NO,
        ORG_DRVR_ID: dst.DRVR_ID,
        ...Object.fromEntries(SWAP_FIELDS.map((f) => [f, src[f]])),
        rowStatus: "U",
      });
      const [a, b] = rows;
      base
        .callAjax(api.saveChangeVehicleSwap([swap(a, b), swap(b, a)]), {
          mask: "main",
        })
        .then(() => base.search());
    },
    [base],
  );

  // 운송일변경 — 선택 배차행들의 운송일을 팝업에서 고른 날짜로 일괄 변경
  const onChangeDlvryDate = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (!guardHasData(rows)) return;
      openPopup({
        title: "BTN_DELIVERY_DATE_CHANGE",
        width: "md",
        content: (
          <ChangeDlvryDatePop
            initialValues={{ DLVRY_DT: rows[0]?.DLVRY_DT }}
            onConfirm={(dlvryDt) => {
              closePopup();
              const dt = dlvryDt.replace(/-/g, "");
              const payload = rows.map((r) => ({
                ...r,
                DLVRY_DT: dt,
                rowStatus: "U",
              }));
              base
                .callAjax(api.changeDlvryDate(payload), { mask: "main" })
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [guardHasData, openPopup, closePopup, base],
  );

  const validatorMemo = useCallback(
    (rows: any[]) => {
      if (!base.requireParentRow(rows[0], "배차")) return false;

      if (rows.some((row) => row.DSPCH_OP_STS >= "2110")) {
        base.alert(Lang.get("MSG_DISPATCH_STATUS_CMPLT_CHK_MEMO"));
        return false;
      }

      return true;
    },
    [base],
  );

  const validatorPredictEta = useCallback(
    (row: Record<string, string>) => {
      if (!base.requireParentRow(row, "배차")) return false;

      if (row.DSPCH_OP_STS >= "2090") {
        base.alert(Lang.get("MSG_PRIDICT_ETA_EXCEPTION_WHEN_IN_TRANSIT"));
        return false;
      }
      if (row.DSPCH_OP_STS >= "2110") {
        base.alert(Lang.get("MSG_PRIDICT_ETA_EXCEPTION_WHEN_DELIVERED"));
        return false;
      }

      return true;
    },
    [base],
  );

  const validatorCalctEta = useCallback(
    (row: Record<string, string>) => {
      if (!base.requireParentRow(row, "배차")) return false;

      if (row.DSPCH_OP_STS < "2090") {
        base.alert(
          Lang.get("MSG_CAL_ETA_EXCEPTION_BEFORE_TRANSIT_PARTIALLY_DELIVERED"),
        );
        return false;
      }
      if (row.DSPCH_OP_STS == "2110") {
        base.alert(Lang.get("MSG_CAL_ETA_EXCEPTION_DELIVERED"));
        return false;
      }

      if (row.DSPCH_OP_STS == "2090" || row.DSPCH_OP_STS == "2100") {
        const blocked = model.grids.stop.rows.find(
          (data) => data.ATA_DTTM != null && data.ATD_DTTM == null,
        );
        if (blocked) {
          base.alert(
            Lang.get("MSG_CAL_ETA_EXCEPTION_IN_TRANSIT", [
              row.VEH_NO,
              blocked.LOC_NM,
            ]),
          );
          return false;
        }
      }

      return true;
    },
    [base, model.grids.stop.rows],
  );

  // 메모 등록 — 선택 배차행(첫 행) 기준 4개 메모 등록 팝업 (메모는 배차 1건 단위)
  const onRegisterMemo = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (!isCheckOnlySingleSelectRecord(rows, "MSG_CHECK_SINGLE_RECORD"))
        return;
      if (!validatorMemo(rows)) return;
      openPopup({
        title: "LBL_MEMO",
        width: "4xl",
        content: (
          <DispatchMemoPopup
            row={rows[0]}
            statusLabel={
              model.codeMap.dspchOpSts?.[rows[0].DSPCH_OP_STS] ??
              String(rows[0].DSPCH_OP_STS ?? "")
            }
            fetchMemo={(dspchNo) => api.searchDispatchMemo({ DSPCH_NO: dspchNo })}
            saveMemo={(record) => api.saveDispatchMemo(record)}
            onSaved={() => {
              closePopup();
              base.search();
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [
      isCheckOnlySingleSelectRecord,
      validatorMemo,
      openPopup,
      model.codeMap.dspchOpSts,
      closePopup,
      base,
    ],
  );

  // 임시차량변경 — 단일 배차행 선택 → 스팟차량(차량/기사/연락처) 등록
  const onChangeTempVeh = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (
        !isCheckOnlySingleSelectRecord(
          rows,
          "MSG_EXCEPTION_ONE_VEHICLE_REPLACE",
        )
      )
        return;

      const main = rows[0];

      openPopup({
        title: "BTN_REG_SPOT_VEH",
        width: "md",
        content: (
          <RegiSpotPop
            initialValues={main}
            onConfirm={(patch) => {
              closePopup();
              const payload = {
                DSPCH_NO: main.DSPCH_NO,
                LGST_GRP_CD: main.LGST_GRP_CD,
                DIV_CD: main.DIV_CD,
                PLN_ID: main.PLN_ID,
                DLVRY_DT: main.DLVRY_DT,
                VEH_ID: main.VEH_ID,
                VEH_OP_TP: main.VEH_OP_TP,
                VEH_TP_NM: main.VEH_TP_NM,
                DRVR_ID: main.DRVR_ID,
                CARR_CD: main.CARR_CD,
                CARR_NM: main.CARR_NM,
                AP_PROC_TP: main.AP_PROC_TP,
                VEH_NO: patch.VEH_NO,
                DRVR_NM: patch.DRVR_NM,
                MBL_PHN_NO: patch.MBL_PHN_NO,
                VEH_TP_CD: patch.VEH_TP_CD,
              };
              base
                .callAjax(api.saveDspchSpotVeh(payload), { mask: "main" })
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [isCheckOnlySingleSelectRecord, openPopup, closePopup, base],
  );

  // 주문할당취소 (할당주문 탭 선택 행들)
  const onUnassignedShipment = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (!guardHasData(rows)) return;
      base
        .callAjax(api.saveUnAssignedShipment(rows), { mask: "main" })
        .then(() => base.search());
    },
    [guardHasData, base],
  );

  // 주문할당 (미할당주문 탭 선택 행들 → 선택 배차에 할당)
  const onAssignedShipment = useCallback(
    (e: any) => {
      const main = model.grids.main.selectedRef.current;
      const rows = (e?.data ?? []) as any[];
      if (!guardHasData(main ? [main] : [])) return;
      if (!guardHasData(rows)) return;
      base
        .callAjax(
          api.saveAssignedShipment(
            rows.map((r) => ({ ...r, DSPCH_NO: main.DSPCH_NO })),
          ),
        )
        .then(() => base.search());
    },
    [model.grids.main, guardHasData, base],
  );

  // 품목 라인분할 — 상세 그리드 선택 행
  const onSplitLine = useCallback(
    (
      subKey: "allocSub" | "unallocSub",
      parentKey: "allocOrder" | "unallocOrder",
    ) => {
      const sub = model.grids[subKey].selectedRef.current;
      if (!guardHasData(sub ? [sub] : [])) return;
      base
        .callAjax(api.saveSplitShipmentLine([{ ...sub, rowStatus: "U" }]), {
          mask: subKey,
        })
        .then(() => {
          const parent = model.grids[parentKey].selectedRef.current;
          if (parent?.ORD_NO) {
            const fetch =
              subKey === "allocSub"
                ? api.getAllocOrderItemList
                : api.getUnallocOrderItemList;
            base.searchSub(subKey, fetch({ ORD_NO: parent.ORD_NO }));
          }
        });
    },
    [model.grids, guardHasData, base],
  );

  // 착지 ETA 계산
  const onPredictETA = useCallback(
    (row: Record<string, string>) => {
      const s = model.rawFiltersRef.current;
      openPopup({
        title: "BTN_PREDICT_ETA",
        width: "sm",
        content: (
          <PredictEstimateTimetoArrivalPop
            onConfirm={(data: any) => {
              closePopup();

              base
                .callAjax(
                  api.predictEta({
                    ATD_DTTM: data.TRNS_STDT_DATE,
                    DSPCH_NO: row.DSPCH_NO,
                    TRIP_ID: row.TRIP_ID,
                    TRIP_SEQ: row.TRIP_SEQ,
                    MENU_CD: MENU_CODE,
                    DIV_CD: s.SRCH_DSPCH_DIV_CD,
                    LGST_GRP_CD: s.SRCH_DSPCH_LGST_GRP_CD,
                  }),
                  { mask: "stop" },
                )
                .then(() =>
                  base.searchSub(
                    "stop",
                    api.getStopList({ DSPCH_NO: row.DSPCH_NO }),
                  ),
                );
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [model.rawFiltersRef, openPopup, closePopup, base],
  );

  // 품목 수량분할 — 상세 그리드 단일 선택 → SplitQtyPop
  const onSplitQty = useCallback(
    (
      subKey: "allocSub" | "unallocSub",
      parentKey: "allocOrder" | "unallocOrder",
    ) => {
      const main = model.grids.main.selectedRef.current;
      const sub = model.grids[subKey].selectedRef.current;
      if (!guardHasData(sub ? [sub] : [])) return;
      openPopup({
        title: "BTN_ITEM_QTY_SPLIT",
        width: "xl",
        content: (
          <SplitQtyPop
            record={{ ...sub, DSPCH_NO: main?.DSPCH_NO }}
            onConfirm={(payload) => {
              closePopup();
              base
                .callAjax(api.saveSplitShipmentQty(payload), { mask: subKey })
                .then(() => {
                  const parent = model.grids[parentKey].selectedRef.current;
                  if (parent?.ORD_NO) {
                    const fetch =
                      subKey === "allocSub"
                        ? api.getAllocOrderItemList
                        : api.getUnallocOrderItemList;
                    base.searchSub(subKey, fetch({ ORD_NO: parent.ORD_NO }));
                  }
                });
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [model.grids, guardHasData, openPopup, closePopup, base],
  );

  // 선택행 검증 — 비어있으면 안내 후 false
  const requireSelected = useCallback(
    (rows: any[], msg = "MSG_SELECT_NO_DATA") => {
      if (!rows || rows.length === 0) {
        base.alert(Lang.get(msg));
        return false;
      }
      return true;
    },
    [base],
  );

  const onCreateNewDspch = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (!requireSelected(rows, "MSG_EMPTY_DISPATCH_VEH_SELECT_CHK")) return;

      const vehIds: any[] = [];
      const params: any[] = [];
      const s = model.rawFiltersRef.current;
      rows.forEach((row) => {
        const vehId = row.VEH_ID;
        if (vehId !== null && vehIds.indexOf(vehId) < 0) {
          vehIds.push(vehId);
          params.push({
            ...row,
            DLVRY_DT: s.SRCH_DSPCH_DLVRY_DT,
            DSPCH_TP: "10",
            PLN_ID: s.SRCH_DSPCH_PLN_ID,
            rowStatus: "U",
          });
        }
      });

      base
        .callAjax(api.saveCreateEmptyDispatch(params), {
          mask: "vehMgmt",
        })
        .then(() => {
          base.search();
          handleVehMgmtSearch();
        });
    },
    [base, handleVehMgmtSearch, model.rawFiltersRef, requireSelected],
  );

  const handleSave = useCallback(() => {
    const rows = model.grids.main.ref.current?.rows ?? [];
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) return;
    api.saveDispatchPlan({ dsSave: dirty }).then(() => base.search());
  }, [model, base]);

  // 이 화면은 팝업이 아니라 우측 사이드패널(VehicleLocationSidePanel)로 차량위치를 표시
  const onShowVehicleLocation = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      model.setVehLocRows(rows);
      model.setRoutePanelOpen(false);
      model.setVehLocPanelOpen(true);
    },
    [model],
  );

  // 차량위치 패널이 열려 있을 때 체크(다중 선택) 변경 시 선택 차량으로 리프레시
  const onMainSelectionForVehLoc = useCallback(
    (rows: any[]) => {
      if (model.vehLocPanelOpen) model.setVehLocRows(rows ?? []);
    },
    [model],
  );

  const onShowRoute = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (!isCheckOnlySingleSelectRecord(rows, "MSG_CHECK_SINGLE_RECORD"))
        return;

      model.setVehLocPanelOpen(false);
      model.setRoutePanelOpen(true);
    },
    [isCheckOnlySingleSelectRecord, model],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      // 배차생성및취소
      {
        type: "group",
        key: "BTN_DISPATCH_CREATE_DELETE",
        label: "BTN_DISPATCH_CREATE_DELETE",
        items: [
          {
            type: "button",
            key: "BTN_DISPATCH_CREATE",
            label: "BTN_DISPATCH_CREATE",
            onClick: onCreateEmptyDispatch,
          },
          {
            type: "button",
            key: "BTN_CREATE_ITINERARY_PLAN",
            label: "BTN_CREATE_ITINERARY_PLAN",
            onClick: onCreateItineraryDispatch,
          },
          {
            type: "button",
            key: "BTN_CREATE_ITINERARY_GRP_PLAN",
            label: "BTN_CREATE_ITINERARY_GRP_PLAN",
            onClick: onCreateItineraryGrpDispatch,
          },
          {
            type: "button",
            key: "BTN_DISPATCH_CANCEL",
            label: "BTN_DISPATCH_CANCEL",
            onClick: onCancelPlanDispatch,
          },
        ],
      },
      // 배차조정
      {
        type: "group",
        key: "BTN_PLAN_REVIEW",
        label: "BTN_PLAN_REVIEW",
        items: [
          {
            type: "button",
            key: "BTN_STOP_RESEQUENCE",
            label: "BTN_STOP_RESEQUENCE",
            onClick: onAutoChangeStopSeq,
          },
          {
            type: "button",
            key: "BTN_DELIVERY_DATE_CHANGE",
            label: "BTN_DELIVERY_DATE_CHANGE",
            onClick: onChangeDlvryDate,
          },
        ],
      },
      // 차량변경
      {
        type: "group",
        key: "BTN_VEHICLE_CHANGE",
        label: "BTN_VEHICLE_CHANGE",
        items: [
          {
            type: "button",
            key: "BTN_CHANGE_REG_VEH",
            label: "BTN_CHANGE_REG_VEH",
            onClick: onChangeRegVeh,
          },
          {
            type: "button",
            key: "BTN_REG_SPOT_VEH",
            label: "BTN_REG_SPOT_VEH",
            onClick: onChangeTempVeh,
          },
          {
            type: "button",
            key: "BTN_SWAP_VEH",
            label: "BTN_SWAP_VEH",
            onClick: onSwapVehicle,
          },
        ],
      },
      {
        type: "button",
        key: "BTN_PROC_QTY_DSPCH",
        label: "BTN_PROC_QTY_DSPCH",
        onClick: onQtyDispatch,
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
            onClick: onRegisterMemo,
          },
          {
            type: "button",
            key: "BTN_CANCEL",
            label: "BTN_CANCEL",
            onClick: (e: any) => {
              const rows = (e?.data ?? []) as any[];
              if (!validatorMemo(rows)) return;
              base.callAjax(api.cancelDspchMemo(rows)).then(() => {});
            },
          },
        ],
      },

      // 정보조회
      {
        type: "group",
        key: "BTN_INFO_SHOW",
        label: "BTN_INFO_SHOW",
        items: [
          {
            type: "button",
            key: "BTN_SHOW_VEHICLE_LOCATION",
            label: "BTN_SHOW_VEHICLE_LOCATION",
            onClick: onShowVehicleLocation, //todo
          },
          {
            type: "button",
            key: "BTN_SHOW_ROUTE",
            label: "BTN_SHOW_ROUTE",
            onClick: onShowRoute,
          },
        ],
      },
      // 계획확정
      {
        type: "group",
        key: "BTN_SET_TO_PLANNED",
        label: "BTN_SET_TO_PLANNED",
        items: [
          {
            type: "button",
            key: "BTN_SET_TO_PLANNED",
            label: "BTN_SET_TO_PLANNED",
            onClick: onPlanned,
          },
          {
            type: "button",
            key: "BTN_RETURN_TO_OPEN",
            label: "BTN_RETURN_TO_OPEN",
            onClick: onCancelPlanned,
          },
        ],
      },
      makeSaveAction({ onClick: handleSave }),
      makeExcelGroupAction({
        hideAll: true,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getDispatchPlanList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [
      onCreateEmptyDispatch,
      onCreateItineraryDispatch,
      onCreateItineraryGrpDispatch,
      onCancelPlanDispatch,
      onAutoChangeStopSeq,
      onChangeDlvryDate,
      onChangeRegVeh,
      onChangeTempVeh,
      onSwapVehicle,
      onQtyDispatch,
      onRegisterMemo,
      onShowVehicleLocation,
      onShowRoute,
      onPlanned,
      onCancelPlanned,
      handleSave,
      menuName,
      model.grids.main,
      model.filtersRef,
      validatorMemo,
      base,
    ],
  );

  const stopActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_PREDICT_ETA",
        label: "BTN_PREDICT_ETA",
        authId: "BTN_PREDICT_ETA_SUB01_GRID_RVDSPCH",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          if (!validatorPredictEta(row)) return;
          onPredictETA(row);
        },
      },
      {
        type: "button",
        key: "BTN_CALCULATE_ETA",
        label: "BTN_CALCULATE_ETA",
        authId: "BTN_CALCULATE_ETA_SUB01_GRID_RVDSPCH",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          if (!validatorCalctEta(row)) return;
          base
            .callAjax(api.calcEta({ DSPCH_NO: row.DSPCH_NO }), {
              mask: "stop",
            })
            .then(() => {
              base.searchSub(
                "stop",
                api.getStopList({ DSPCH_NO: row.DSPCH_NO }),
              );
            });
        },
      },
      {
        type: "button",
        key: "BTN_SPLIT_STOP",
        label: "BTN_SPLIT_STOP",
        authId: "BTN_SPLIT_STOP_SUB01_GRID_RVDSPCH",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ADJUST_STOP_SEQ_PLUS",
        label: "BTN_ADJUST_STOP_SEQ_PLUS",
        authId: "BTN_ADJ_STOP_SEQ_PLUS_SUB01_GRID_RVDSPCH",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ADJUST_STOP_SEQ_MINUS",
        label: "BTN_ADJUST_STOP_SEQ_MINUS",
        authId: "BTN_ADJ_STOP_SEQ_MINUS_SUB01_GRID_RVDSPCH",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ADJUST_STOP_SEQ",
        label: "BTN_ADJUST_STOP_SEQ",
        authId: "BTN_ADJ_STOP_SEQ_GRID_RVDSPCH",
        noLang: true,
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          base.callAjax(
            api.saveStopOrder({
              DSPCH_NO: row.DSPCH_NO,
              stops: model.grids.stop.rows,
            }),
            { mask: "stop" },
          );
        },
      },
      {
        type: "button",
        key: "BTN_ADJ_STOP_SEQ_GRID_RVDSPCH",
        label: "BTN_ADJ_STOP_SEQ_GRID_RVDSPCH",
        authId: "BTN_ADJ_STOP_SEQ_GRID_RVDSPCH",
        noLang: true,
        onClick: () => {},
      },
    ],
    [
      base,
      model.grids.main.selectedRef,
      model.grids.stop.rows,
      onPredictETA,
      validatorCalctEta,
      validatorPredictEta,
    ],
  );

  const allocOrderActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SEARCH",
        label: model.allocSearching ? "LBL_SEARCHING" : "BTN_SEARCH",
        disabled: model.allocSearching,
        onClick: handleAllocOrderSearch,
      },
      {
        type: "button",
        key: "BTN_UNASSIGNED_SHIPMENT",
        label: "BTN_UNASSIGNED_SHIPMENT",
        onClick: onUnassignedShipment,
      },
    ],
    [handleAllocOrderSearch, model.allocSearching, onUnassignedShipment],
  );

  const unallocOrderActions: ActionItem[] = useMemo(
    () => [
      // 조회는 탭 상단 조회조건 카드(PopupSearchCondition) 의 "조회" 버튼으로 일원화.
      {
        type: "button",
        key: "BTN_ASSIGN_SHIPMENT",
        label: "BTN_ASSIGN_SHIPMENT",
        onClick: onAssignedShipment,
      },
    ],
    [onAssignedShipment],
  );

  const unallocSubActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_ITEM_LINE_SPLIT",
        label: "BTN_ITEM_LINE_SPLIT",
        onClick: () => onSplitLine("unallocSub", "unallocOrder"),
      },
      {
        type: "button",
        key: "BTN_ITEM_QTY_SPLIT",
        label: "BTN_ITEM_QTY_SPLIT",
        onClick: () => onSplitQty("unallocSub", "unallocOrder"),
      },
    ],
    [onSplitLine, onSplitQty],
  );

  const vehMgmtActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_CREATE_NEW_DSPCH",
        label: "LBL_CREATE_NEW_DSPCH",
        onClick: onCreateNewDspch,
      },
    ],
    [onCreateNewDspch],
  );

  return {
    fetchDispatchPlanList: fetchList,
    onSearchCallback,
    onMainGridClick,
    onMainSelectionForVehLoc,
    onAllocOrderRowClicked,
    onUnallocOrderRowClicked,
    mainActions,
    stopActions,
    allocOrderActions,
    unallocOrderActions,
    unallocSubActions,
    vehMgmtActions,
    handleUnallocOrderSearch,
    handleAllocOrderSearch,
    handleVehMgmtSearch,
    resetGrids: base.resetGrids,
  };
}
