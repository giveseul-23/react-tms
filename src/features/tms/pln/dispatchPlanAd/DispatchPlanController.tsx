// src/views/dispatchPlan/DispatchPlanController.tsx
import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchPlanApi as api } from "./dispatchPlanApi";
import { useGuard } from "@/hooks/useGuard";
import { MENU_CODE } from "./DispatchPlan";
import {
  makeSaveAction,
  makeExcelGroupAction,
  makeMemoGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DispatchPlanModel, GridKey } from "./DispatchPlanModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import { usePopup } from "@/app/components/popup/PopupContext";
import ChangeVehiclePop from "./popup/ChangeVehiclePop";
import CreateEmptyDispatchVehiclePop from "./popup/CreateEmptyDispatchVehiclePop";
import SplitQtyPop from "./popup/SplitQtyPop";

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
    (row: any) =>
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
      ),
    [base],
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

  // 미할당 탭 조회 (조회조건 개별 값 기반)
  const handleUnallocOrderSearch = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;
    model.setUnallocSearching(true);
    api
      .getUnallocOrderList({
        DIV_CD: srchObj["SRCH_DSPCH_DIV_CD"],
        LGST_GRP_CD: srchObj["SRCH_DSPCH_LGST_GRP_CD"],
        PLN_ID: srchObj["SRCH_DSPCH_PLN_ID"],
        DLVRY_DT: srchObj["SRCH_DSPCH_DLVRY_DT"],
      })
      .then((res: any) => {
        const rows = res.data.result ?? res.data.data?.dsOut ?? [];
        model.grids.unallocOrder.setData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: 20,
        });
      })
      .catch((err) =>
        console.error("[DispatchPlan] unalloc search failed", err),
      )
      .finally(() => model.setUnallocSearching(false));
  }, [model]);

  // 등록차량(지입) 변경 — 단일선택 검증 후 ChangeVehiclePop → 선택 차량 머지 → 저장 → 재조회
  const onChangeRegVeh = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!guardHasData(main ? [main] : [])) return;
    openPopup({
      title: "BTN_VEHICLE_CHANGE",
      width: "4xl",
      content: (
        <ChangeVehiclePop
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
              )
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [model.grids.main, guardHasData, openPopup, closePopup, base]);

  // 배차생성 — 본 화면 조회조건(부서/운영그룹/배송일/계획ID) 필수 확인 후 차량 선택 팝업
  const onCreateEmptyDispatch = useCallback(() => {
    const f = model.rawFiltersRef.current ?? {};
    const DIV_CD = f["SRCH_DSPCH_DIV_CD"];
    const LGST_GRP_CD = f["SRCH_DSPCH_LGST_GRP_CD"];
    const DLVRY_DT = f["SRCH_DSPCH_DLVRY_DT"];
    const PLN_ID = f["SRCH_DSPCH_PLN_ID"];
    const DSPCH_TP = f["SRCH_DSPCH_TP"];
    if (!DIV_CD || !LGST_GRP_CD || !DLVRY_DT || !PLN_ID) {
      showInfoModal(Lang.get("MSG_DUMMY_DISPATCH_BUILD_MANDATORY_CHK"));
      return;
    }
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
              .callAjax(api.saveCreateEmptyDispatch(rows))
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [model.rawFiltersRef, openPopup, closePopup, base]);

  // 배차취소 — 선택 배차 행 confirm 후 취소
  const onCancelPlanDispatch = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!guardHasData(main ? [main] : [])) return;
    base.confirm("MSG_CHK_DELETE", () => {
      base
        .callAjax(api.saveCancelPlanDispatch([main]))
        .then(() => base.search());
    });
  }, [model.grids.main, guardHasData, base]);

  // 합차(주문병합) — 미할당주문 2건 이상 선택 → 최소 SHPM_NO 기준 병합
  const onShipmentMerge = useCallback(() => {
    const sel = model.grids.unallocOrder.selectedRef.current;
    const rows = Array.isArray(sel) ? sel : sel ? [sel] : [];
    if (rows.length < 2) {
      showInfoModal(Lang.get("MSG_SHIPMENT_MERGE_CHECK"));
      return;
    }
    const minShpmNo = rows
      .map((r) => r.SHPM_NO)
      .filter(Boolean)
      .sort()[0];
    const merged = rows.map((r) => ({
      ...r,
      MIN_SHPM_NO: minShpmNo,
      rowStatus: "U",
    }));
    base.callAjax(api.saveMergeShipment(merged)).then(() => base.search());
  }, [model.grids.unallocOrder, base]);

  // 주문할당취소 (할당주문 탭 선택 행)
  const onUnassignedShipment = useCallback(() => {
    const sel = model.grids.allocOrder.selectedRef.current;
    if (!guardHasData(sel ? [sel] : [])) return;
    base.callAjax(api.saveUnAssignedShipment([sel])).then(() => base.search());
  }, [model.grids.allocOrder, guardHasData, base]);

  // 주문할당 (미할당주문 탭 선택 행 → 선택 배차에 할당)
  const onAssignedShipment = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    const sel = model.grids.unallocOrder.selectedRef.current;
    if (!guardHasData(main ? [main] : [])) return;
    if (!guardHasData(sel ? [sel] : [])) return;
    base
      .callAjax(api.saveAssignedShipment([{ ...sel, DSPCH_NO: main.DSPCH_NO }]))
      .then(() => base.search());
  }, [model.grids.main, model.grids.unallocOrder, guardHasData, base]);

  // 품목 라인분할 — 상세 그리드 선택 행
  const onSplitLine = useCallback(
    (
      subKey: "allocSub" | "unallocSub",
      parentKey: "allocOrder" | "unallocOrder",
    ) => {
      const sub = model.grids[subKey].selectedRef.current;
      if (!guardHasData(sub ? [sub] : [])) return;
      base
        .callAjax(api.saveSplitShipmentLine([{ ...sub, rowStatus: "U" }]))
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
        width: "2xl",
        content: (
          <SplitQtyPop
            record={{ ...sub, DSPCH_NO: main?.DSPCH_NO }}
            onConfirm={(payload) => {
              closePopup();
              base.callAjax(api.saveSplitShipmentQty(payload)).then(() => {
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

  const handleSave = useCallback(() => {
    const rows = model.grids.main.ref.current?.rows ?? [];
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) return;
    api.saveDispatchPlan({ dsSave: dirty }).then(() => base.search());
  }, [model, base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
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
            key: "BTN_DISPATCH_CANCEL",
            label: "BTN_DISPATCH_CANCEL",
            onClick: onCancelPlanDispatch,
          },
        ],
      },
      {
        type: "group",
        key: "BTN_PLAN_REVIEW",
        label: "BTN_PLAN_REVIEW",
        items: [
          {
            type: "button",
            key: "합차",
            label: "합차",
            noLang: true,
            onClick: onShipmentMerge,
          },
          {
            type: "button",
            key: "분차",
            label: "분차",
            noLang: true,
            onClick: () => onSplitLine("unallocSub", "unallocOrder"),
          },
        ],
      },
      {
        type: "group",
        key: "BTN_VEHICLE_CHANGE",
        label: "BTN_VEHICLE_CHANGE",
        items: [
          {
            type: "button",
            key: "BTN_CHANGE_REG_DED_VEH",
            label: "BTN_CHANGE_REG_DED_VEH",
            onClick: onChangeRegVeh,
          },
          {
            type: "button",
            key: "LBL_CONTRACTED_VEHICLE",
            label: "LBL_CONTRACTED_VEHICLE",
            onClick: () => {},
          },
        ],
      },
      makeMemoGroupAction({
        saveMemo: (rows, text) => api.saveDispatchMemo(rows, text),
        cancelMemo: (rows) => api.cancelDspchMemo(rows),
        onDone: () => base.search(),
        confirmOnCancel: true,
        // 배차완료(DSPCH_OP_STS >= "2110") 행은 메모 등록/취소 불가 (서버 로직 동일)
        validate: (rows) => {
          if (rows.some((r) => String(r.DSPCH_OP_STS ?? "") >= "2110")) {
            showInfoModal(Lang.get("MSG_DISPATCH_STATUS_CMPLT_CHK_MEMO"));
            return false;
          }
          return true;
        },
      }),
      {
        type: "group",
        key: "BTN_INFO_SHOW",
        label: "BTN_INFO_SHOW",
        items: [
          {
            type: "button",
            key: "운행정보",
            label: "운행정보",
            onClick: () => {},
          },
        ],
      },
      {
        type: "group",
        key: "BTN_CONFIRM_PLANNED",
        label: "BTN_CONFIRM_PLANNED",
        items: [
          {
            type: "button",
            key: "BTN_CONFIRM",
            label: "BTN_CONFIRM",
            onClick: (e: any) => {
              if (!guardHasData(e.data)) return;
              base.callAjax(api.confirmPlan(e.data)).then(() => base.search());
            },
          },
        ],
      },
      makeSaveAction({ onClick: handleSave }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getDispatchPlanList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [
      handleSave,
      menuName,
      model.grids.main,
      model.filtersRef,
      guardHasData,
      base,
      onChangeRegVeh,
      onCreateEmptyDispatch,
      onCancelPlanDispatch,
      onShipmentMerge,
      onSplitLine,
    ],
  );

  const stopActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_PREDICT_ETA",
        label: "BTN_PREDICT_ETA",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          base.callAjax(api.predictEta({ DSPCH_NO: row.DSPCH_NO }));
        },
      },
      {
        type: "button",
        key: "BTN_CALCULATE_ETA",
        label: "BTN_CALCULATE_ETA",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          base.callAjax(api.calcEta({ DSPCH_NO: row.DSPCH_NO }));
        },
      },
      {
        type: "button",
        key: "BTN_SPLIT_STOP",
        label: "BTN_SPLIT_STOP",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ADJUST_STOP_SEQ_PLUS",
        label: "BTN_ADJUST_STOP_SEQ_PLUS",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ADJUST_STOP_SEQ_MINUS",
        label: "BTN_ADJUST_STOP_SEQ_MINUS",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ORDER_SAVE",
        label: "BTN_ORDER_SAVE",
        noLang: true,
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          base.callAjax(
            api.saveStopOrder({
              DSPCH_NO: row.DSPCH_NO,
              stops: model.grids.stop.rows,
            }),
          );
        },
      },
    ],
    [base, model],
  );

  const allocOrderActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_UNASSIGNED_SHIPMENT",
        label: "BTN_UNASSIGNED_SHIPMENT",
        onClick: onUnassignedShipment,
      },
    ],
    [onUnassignedShipment],
  );

  const unallocOrderActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SEARCH",
        label: model.unallocSearching ? "LBL_SEARCHING" : "BTN_SEARCH",
        disabled: model.unallocSearching,
        onClick: handleUnallocOrderSearch,
      },
      {
        type: "button",
        key: "BTN_ASSIGN_SHIPMENT",
        label: "BTN_ASSIGN_SHIPMENT",
        onClick: onAssignedShipment,
      },
    ],
    [model.unallocSearching, handleUnallocOrderSearch, onAssignedShipment],
  );

  const allocSubActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_ITEM_LINE_SPLIT",
        label: "BTN_ITEM_LINE_SPLIT",
        onClick: () => onSplitLine("allocSub", "allocOrder"),
      },
      {
        type: "button",
        key: "BTN_ITEM_QTY_SPLIT",
        label: "BTN_ITEM_QTY_SPLIT",
        onClick: () => onSplitQty("allocSub", "allocOrder"),
      },
    ],
    [onSplitLine, onSplitQty],
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

  return {
    fetchDispatchPlanList: fetchList,
    onSearchCallback,
    onMainGridClick,
    onAllocOrderRowClicked,
    onUnallocOrderRowClicked,
    mainActions,
    stopActions,
    allocOrderActions,
    unallocOrderActions,
    allocSubActions,
    unallocSubActions,
  };
}
