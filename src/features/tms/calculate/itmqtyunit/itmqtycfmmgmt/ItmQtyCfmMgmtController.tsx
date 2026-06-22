import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { itmQtyCfmMgmtApi as api } from "./ItmQtyCfmMgmtApi";
import { MENU_CODE } from "./ItmQtyCfmMgmt";
import { DateTypePop } from "./popup/DateTypePop";
import { ItemQtyConfirmCreatePop } from "./popup/ItemQtyConfirmCreatePop";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ItmQtyCfmMgmtModel, GridKey } from "./ItmQtyCfmMgmtModel";

interface Args {
  model: ItmQtyCfmMgmtModel;
}

export function useItmQtyCfmMgmtController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  // ── 메인 조회 ─────────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getMainList(params),
    [],
  );

  // 조회/저장 후 메인 재조회 + 하위 그리드 초기화
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      base.resetGrids(["sub01", "sub02", "sub03"]);
    },
    [base, model.grids.main],
  );

  // ── cascade: main → sub01, sub01 → sub02, sub02 → sub03 ───────────
  const onMainGridClick = useCallback(
    (row: any) => {
      if (!row) return;
      base.handleRowClick("main", row, [
        { to: "sub01", fetch: (r: any) => api.getSub01List({ DSPCH_NO: r.DSPCH_NO }) },
      ], { alsoReset: ["sub02", "sub03"] });
    },
    [base],
  );

  const onSub01GridClick = useCallback(
    (row: any) => {
      if (!row) return;
      base.handleRowClick("sub01", row, [
        { to: "sub02", fetch: (r: any) => api.getSub02List({ SHPM_ID: r.SHPM_ID }) },
      ], { alsoReset: ["sub03"] });
    },
    [base],
  );

  const onSub02GridClick = useCallback(
    (row: any) => {
      if (!row) return;
      const main = model.grids.main.selectedRef.current;
      base.handleRowClick("sub02", row, [
        {
          to: "sub03",
          fetch: (r: any) =>
            api.getSub03List({
              ITEMQTY_LINE_ID: main?.ITEMQTY_LINE_ID,
              SHPM_ID: r.SHPM_ID,
              SHPM_DTL_ID: r.SHPM_DTL_ID,
            }),
        },
      ]);
    },
    [base, model.grids.main],
  );

  // ── 메인 저장 — 변경 행 검증 (checkSaveChgQty 대응) ─────────────────
  const onSaveMain = useCallback(() => {
    base.saveGrid("main", api.saveMain, {
      beforeSave: () => {
        const rows = model.grids.main.rows ?? [];
        // 확정 이후 상태(>1010) 인데 확정수치를 변경한 행 차단
        for (const r of rows) {
          if (
            r.EDIT_STS === ROW_STATUS.UPDATE &&
            String(r.ITEMQTY_OP_STS) > "1010"
          ) {
            base.alert(Lang.get("MSG_UPD_CHG_DSPCH_OP_STS"));
            return false;
          }
        }
        // 계획수치 ≠ 확정수치 인데 메모 없는 행 차단
        for (const r of rows) {
          if (
            r.EDIT_STS === ROW_STATUS.UPDATE &&
            String(r.PLN_QTY) !== String(r.CFM_QTY) &&
            !String(r.MEMO_DESC ?? "").trim()
          ) {
            base.alert(Lang.get("MSG_ERR_RET_PBOX_MEMO"));
            return false;
          }
        }
        return true;
      },
    });
  }, [base, model.grids.main]);

  // ── 물동량 확정 / 확정취소 ────────────────────────────────────────
  const runConfirm = useCallback(
    (apiFn: (payload: any) => Promise<any>, rows: any[]) => {
      const dsSave = toDsSave(
        rows.map((r) => ({ ...r, EDIT_STS: ROW_STATUS.UPDATE })),
      );
      void base.callAjax(apiFn({ dsSave }), { mask: "main" }).then(() => base.search());
    },
    [base],
  );

  // 일자기준 확정/확정취소 팝업 (선택 행 없을 때)
  const openDateTypePop = useCallback(
    (isCancel: boolean) => {
      const s = getSearch();
      openPopup({
        title: "LBL_DT_TP_NM",
        width: "md",
        content: (
          <DateTypePop
            initialValues={{
              DIV_CD: s.SRCH_QTY_DIV_CD ?? "",
              LGST_GRP_CD: s.SRCH_QTY_LGST_GRP_CD ?? "",
              ITEMQTY_OP_STS: s.SRCH_ITEMQTY_OP_STS ?? "",
            }}
            onConfirm={(p) => {
              closePopup();
              const apiFn = isCancel
                ? api.onDateItemQtyConfirmCancel
                : api.onDateItemQtyConfirm;
              void base.callAjax(apiFn(p), { mask: "main" }).then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, closePopup, getSearch, openPopup],
  );

  const onConfirm = useCallback(() => {
    const sel = (model.grids.main.selectedRef.current ?? null) as any;
    const rows = sel ? [sel] : [];
    if (rows.length) {
      // 확정대상은 신규(1010)만 허용
      for (const r of rows) {
        if (String(r.ITEMQTY_OP_STS) !== "1010") {
          base.alert(Lang.get("MSG_ALERT_CHECK_HISTORY"));
          return;
        }
      }
      base.confirm(Lang.get("MSG_ITM_QTY_CONFIRM"), () =>
        runConfirm(api.onItemQtyConfirm, rows),
      );
    } else {
      base.confirm(Lang.get("MSG_DATE_ITM_QTY_CONFIRM"), () =>
        openDateTypePop(false),
      );
    }
  }, [base, model.grids.main, openDateTypePop, runConfirm]);

  const onConfirmCancel = useCallback(() => {
    const sel = (model.grids.main.selectedRef.current ?? null) as any;
    const rows = sel ? [sel] : [];
    if (rows.length) {
      for (const r of rows) {
        const sts = String(r.ITEMQTY_OP_STS);
        if (sts === "1000") {
          base.alert(Lang.get("MSG_ALERT_ALREADY_CANCELED"));
          return;
        }
        if (sts === "1010") {
          base.alert(Lang.get("MSG_ALERT_NOTHING_CONFIRM_CANCEL"));
          return;
        }
        if (sts === "1030") {
          base.alert(Lang.get("MSG_ALERT_A/P_GENERATED"));
          return;
        }
      }
      base.confirm(Lang.get("MSG_ITM_QTY_CONFIRM_CANCEL"), () =>
        runConfirm(api.onItemQtyConfirmCancel, rows),
      );
    } else {
      base.confirm(Lang.get("MSG_DATE_ITM_QTY_CONFIRM_CANCEL"), () =>
        openDateTypePop(true),
      );
    }
  }, [base, model.grids.main, openDateTypePop, runConfirm]);

  // ── 마감 AP 생성 / 취소 ───────────────────────────────────────────
  const checkSrchCarr = useCallback(() => {
    const s = getSearch();
    if (!String(s.SRCH_QTY_CARR_CD ?? "")) {
      base.alert(Lang.get("MSG_SEL_CARR"));
      return false;
    }
    return true;
  }, [base, getSearch]);

  const onCreateDeadLineAp = useCallback(() => {
    if (!checkSrchCarr()) return;
    const s = getSearch();
    openPopup({
      title: "LBL_ITM_QTY_POP",
      width: "sm",
      content: (
        <ItemQtyConfirmCreatePop
          params={{
            DIV_CD: s.SRCH_QTY_DIV_CD ?? "",
            LGST_GRP_CD: s.SRCH_QTY_LGST_GRP_CD ?? "",
            CARR_CD: s.SRCH_QTY_CARR_CD ?? "",
          }}
          onConfirm={(p) => {
            closePopup();
            void base.callAjax(api.createApSettlQty(p), { mask: "main" }).then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, checkSrchCarr, closePopup, getSearch, openPopup]);

  const onCancelDeadLineAp = useCallback(() => {
    const s = getSearch();
    void base
      .callAjax(
        api.cancelApSettlQty({
          DIV_CD: s.SRCH_QTY_DIV_CD ?? "",
          LGST_GRP_CD: s.SRCH_QTY_LGST_GRP_CD ?? "",
          DLVRY_DT_FROM: s.SRCH_DLVRY_DT_FROM ?? "",
          DLVRY_DT_TO: s.SRCH_DLVRY_DT_TO ?? "",
        }),
        { mask: "main" },
      )
      .then(() => base.search());
  }, [base, getSearch]);

  // ── 그리드별 액션 ─────────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "BTN_CREATE_DEADLINE_AP", label: "BTN_CREATE_DEADLINE_AP", onClick: onCreateDeadLineAp },
      { type: "button", key: "BTN_CANCEL_DEADLINE_AP", label: "BTN_CANCEL_DEADLINE_AP", onClick: onCancelDeadLineAp },
      { type: "button", key: "BTN_QTY_CONFIRM", label: "BTN_QTY_CONFIRM", onClick: onConfirm },
      { type: "button", key: "BTN_QTY_CONFIRM_CANCEL", label: "BTN_QTY_CONFIRM_CANCEL", onClick: onConfirmCancel },
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getMainList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [
      menuName,
      model.grids.main,
      model.filtersRef,
      onCreateDeadLineAp,
      onCancelDeadLineAp,
      onConfirm,
      onConfirmCancel,
      onSaveMain,
    ],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getSub01List(model.filtersRef.current),
        rows: model.grids.sub01.rows,
      }),
    ],
    [menuName, model.grids.sub01, model.filtersRef],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getSub02List(model.filtersRef.current),
        rows: model.grids.sub02.rows,
      }),
    ],
    [menuName, model.grids.sub02, model.filtersRef],
  );

  const sub03Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub03.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getSub03List(model.filtersRef.current),
        rows: model.grids.sub03.rows,
      }),
    ],
    [menuName, model.grids.sub03, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    onSub02GridClick,
    mainActions,
    sub01Actions,
    sub02Actions,
    sub03Actions,
  };
}
