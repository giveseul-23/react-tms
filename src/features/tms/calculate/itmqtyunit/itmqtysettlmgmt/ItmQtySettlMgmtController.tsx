import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeSaveAction,
  makeExcelGroupAction,
  makeMemoGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { itmQtySettlMgmtApi as api } from "./ItmQtySettlMgmtApi";
import { MENU_CODE, AUTH } from "./ItmQtySettlMgmt";
import { CreateApDocPop } from "./popup/CreateApDocPop";
import { LaneDetailPop } from "./popup/LaneDetailPop";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ItmQtySettlMgmtModel, GridKey } from "./ItmQtySettlMgmtModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: ItmQtySettlMgmtModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

// 조회조건 raw 값에서 키 후보를 안전하게 추출 (서버 meta 키 명세 불확실 → 후보 나열)
function pick(raw: Record<string, any>, ...keys: string[]): string {
  for (const k of keys) {
    const v = raw?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "")
      return String(v).trim();
  }
  return "";
}

export function useItmQtySettlMgmtController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  const getCommonParams = useCallback(() => {
    const s = getSearch();
    return {
      DIV_CD: pick(s, "SRCH_A_DIV_CD", "SRCH_DIV_CD", "DIV_CD"),
      LGST_GRP_CD: pick(s, "SRCH_A_LGST_GRP_CD", "SRCH_LGST_GRP_CD", "LGST_GRP_CD"),
      FRM_DTTM: pick(s, "SRCH_A_FRM_DTTM", "SRCH_A_FRM_DTTM_FRM", "FRM_DTTM"),
      TO_DTTM: pick(s, "SRCH_A_TO_DTTM", "SRCH_A_TO_DTTM_TO", "TO_DTTM"),
      CARR_CD: pick(s, "SRCH_A_PAY_CARR_CD", "SRCH_PAY_CARR_CD", "PAY_CARR_CD"),
      CARR_NM: pick(
        s,
        "SRCH_A_PAY_CARR_NM",
        "SRCH_A_PAY_CARR_CD_NM",
        "PAY_CARR_NM",
      ),
    };
  }, [getSearch]);

  // ── 조회 / cascade ────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getMainList(params),
    [],
  );

  const fetchSub01 = useCallback((mainRow: any) => {
    if (!mainRow?.AP_ID) return EMPTY_RESULT;
    return api.getSub01List({ AP_ID: mainRow.AP_ID });
  }, []);

  const fetchSub02 = useCallback((sub01Row: any) => {
    if (!sub01Row?.AP_ID || !sub01Row?.CHG_CD) return EMPTY_RESULT;
    return api.getSub02List({ AP_ID: sub01Row.AP_ID, CHG_CD: sub01Row.CHG_CD });
  }, []);

  const onMainGridClick = useCallback(
    (row: any) => {
      void base.handleRowClick("main", row, [
        { to: "sub01", fetch: fetchSub01 },
      ], { alsoReset: ["sub02"] });
    },
    [base, fetchSub01],
  );

  const onSub01GridClick = useCallback(
    (row: any) => {
      void base.handleRowClick("sub01", row, [
        { to: "sub02", fetch: fetchSub02 },
      ]);
    },
    [base, fetchSub02],
  );

  // sub02 행 선택만 (더블클릭으로 구간상세 팝업)
  const onSub02GridClick = useCallback(
    (row: any) => base.handleRowClick("sub02", row),
    [base],
  );

  const onSub02CellDoubleClicked = useCallback(
    (e: any) => {
      const row = e?.data;
      if (!row?.AP_ID || !row?.CHG_CD) return;
      openPopup({
        title: "LBL_LANE_DETAIL",
        width: "2xl",
        content: (
          <LaneDetailPop
            apId={String(row.AP_ID)}
            chgCd={String(row.CHG_CD)}
            laneId={String(row.LANE_ID ?? "")}
            onClose={closePopup}
          />
        ),
      });
    },
    [openPopup, closePopup],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      base.resetGrids(["sub01", "sub02"]);
    },
    [base, model.grids.main],
  );

  // ── 상태 검증 공용 (서버 valiCheckSts) ────────────────────────────
  const requireSelected = useCallback(
    (rows: any[]): rows is any[] => {
      if (!rows?.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return false;
      }
      return true;
    },
    [base],
  );

  const checkSts = useCallback(
    (rows: any[], status: string, failMsg: string) => {
      // VOLUME_AP_AUTO_CONFIRM='Y' 인 경우 서버는 tempStatus 로 분기하나, 여기선 기본 status 검증.
      for (const r of rows) {
        if (String(r.AP_FI_STS) !== status) {
          base.alert(Lang.get(failMsg));
          return false;
        }
      }
      return true;
    },
    [base],
  );

  // 선택행 dsSave 저장 공용 (상태변경 U + 기간 주입 옵션)
  const saveSelected = useCallback(
    (
      rows: any[],
      apiFn: (p: any) => Promise<any>,
      opts?: { withDateRange?: boolean; extra?: Record<string, any> },
    ) => {
      const { FRM_DTTM, TO_DTTM } = getCommonParams();
      const dsSave = toDsSave(
        rows.map((r) => ({
          ...r,
          ...(opts?.withDateRange ? { FRM_DTTM, TO_DTTM } : {}),
          ...(opts?.extra ?? {}),
          EDIT_STS: ROW_STATUS.UPDATE,
        })),
      );
      void base.callAjax(apiFn({ dsSave })).then(() => base.search());
    },
    [base, getCommonParams],
  );

  // ── 매입문서생성 팝업 ─────────────────────────────────────────────
  const onCreateApDocument = useCallback(() => {
    const p = getCommonParams();
    const toOptions = (m?: Record<string, string>) =>
      Object.entries(m ?? {}).map(([CODE, NAME]) => ({
        CODE,
        NAME: String(NAME),
      }));
    openPopup({
      title: "BTN_CREATE_AP_DOC_PUBLISH",
      width: "lg",
      content: (
        <CreateApDocPop
          initialValues={p}
          dateTypeOptions={toOptions(model.codeMap?.dateType)}
          creationMethodOptions={toOptions(model.codeMap?.creationMethod)}
          uomOptions={toOptions(model.codeMap?.itmUom)}
          onPublish={(payload) => {
            closePopup();
            void base
              .callAjax(api.publishApDoc(payload))
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, getCommonParams, model.codeMap, openPopup]);

  // ── 매입문서취소 (상태 4010 검증) ─────────────────────────────────
  const onCancelApDocument = useCallback(
    ({ data }: { data: any[] }) => {
      const rows = data ?? [];
      if (!requireSelected(rows)) return;
      if (!checkSts(rows, "4010", "MSG_FAIL_ITMQTY_CANCEL")) return;
      saveSelected(rows, api.cancelApDocument);
    },
    [requireSelected, checkSts, saveSelected],
  );

  // ── 계획확정 (상태 4010 검증) ─────────────────────────────────────
  const onConfirmApDocument = useCallback(
    ({ data }: { data: any[] }) => {
      const rows = data ?? [];
      if (!requireSelected(rows)) return;
      if (!checkSts(rows, "4010", "MSG_FAIL_ITMQTY_CONFIRM")) return;
      saveSelected(rows, api.confirmApDocument);
    },
    [requireSelected, checkSts, saveSelected],
  );

  // ── 승인취소 (상태 4030 검증, 기간 주입) ──────────────────────────
  const onCancelApprove = useCallback(
    ({ data }: { data: any[] }) => {
      const rows = data ?? [];
      if (!requireSelected(rows)) return;
      if (!checkSts(rows, "4030", "MSG_FAIL_ITMQTY_APPROVE")) return;
      saveSelected(rows, api.cancelApproveApDocument, { withDateRange: true });
    },
    [requireSelected, checkSts, saveSelected],
  );

  // ── 일마감 / 일마감취소 (DLY_SETL_STS 검증) ───────────────────────
  const onDlySetl = useCallback(
    ({ data }: { data: any[] }) => {
      const rows = data ?? [];
      if (!requireSelected(rows)) return;
      for (const r of rows) {
        if (String(r.DLY_SETL_STS) !== "10") {
          base.alert(Lang.get("MSG_CHECK_DLY_SETL_STS_NEW"));
          return;
        }
      }
      saveSelected(rows, api.saveDlySetl);
    },
    [requireSelected, saveSelected, base],
  );

  const onDlySetlCancel = useCallback(
    ({ data }: { data: any[] }) => {
      const rows = data ?? [];
      if (!requireSelected(rows)) return;
      for (const r of rows) {
        if (String(r.DLY_SETL_STS) < "15" || String(r.AP_FI_STS) === "3000") {
          base.alert(Lang.get("MSG_CHECK_DLY_SETL_STS_CMPLT"));
          return;
        }
      }
      saveSelected(rows, api.saveDlySetlCancel);
    },
    [requireSelected, saveSelected, base],
  );

  // ── sub01 저장 (확정금액 변경 시 사유 필수 — 서버 onSaveSub01Grid) ──
  const onSaveSub01 = useCallback(() => {
    return base.saveGrid("sub01", api.saveChargeCode, {
      beforeSave: () => {
        const dirty = model.grids.sub01.rows.filter(
          (r: any) => r.EDIT_STS && r.EDIT_STS !== "R",
        );
        for (const r of dirty) {
          if (
            (!r.RSN_DESC || String(r.RSN_DESC).trim() === "") &&
            String(r.PLN_RATE) !== String(r.CFM_RATE)
          ) {
            base.alert(Lang.get("MSG_ERR_INPUT_ADJ_RSN_DESC"));
            return false;
          }
        }
        return true;
      },
      afterSave: "refresh",
    });
  }, [base, model.grids.sub01]);

  // ── 액션 ──────────────────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CREATE_AP_DOCUMENT",
        label: "BTN_CREATE_AP_DOCUMENT",
        onClick: onCreateApDocument,
      },
      {
        type: "button",
        key: "BTN_CANCEL_AP_DOCUMENT",
        label: "BTN_CANCEL_AP_DOCUMENT",
        onClick: onCancelApDocument,
      },
      {
        type: "button",
        key: "BTN_DLY_SETL",
        label: "BTN_DLY_SETL",
        onClick: onDlySetl,
      },
      {
        type: "button",
        key: "BTN_DLY_SETL_CANCEL",
        label: "BTN_DLY_SETL_CANCEL",
        onClick: onDlySetlCancel,
      },
      {
        type: "button",
        key: "BTN_CONFIRM_PLANNED",
        label: "BTN_CONFIRM_PLANNED",
        onClick: onConfirmApDocument,
      },
      {
        type: "button",
        key: "LBL_CONFIRM_CANCEL",
        label: "LBL_CONFIRM_CANCEL",
        onClick: onCancelApprove,
      },
      makeMemoGroupAction({
        saveMemo: (rows, text) =>
          api.saveApplnMemo({
            dsSave: toDsSave(
              rows.map((r) => ({
                ...r,
                MEMO_DESC: text,
                EDIT_STS: ROW_STATUS.INSERT,
              })),
            ),
          }),
        cancelMemo: (rows) =>
          api.cancelApplnMemo({
            dsSave: toDsSave(
              rows.map((r) => ({ ...r, EDIT_STS: ROW_STATUS.INSERT })),
            ),
          }),
        onDone: () => base.search(),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getMainList(model.filtersRef.current),
        rows: model.grids.main.rows,
        upload: {
          gridId: AUTH.grids.main,
          onUploaded: () => base.search(),
        },
        templateDownload: { gridId: AUTH.grids.main, fileName: menuName },
      }),
    ],
    [
      base,
      menuName,
      model.grids.main,
      model.filtersRef,
      onCreateApDocument,
      onCancelApDocument,
      onDlySetl,
      onDlySetlCancel,
      onConfirmApDocument,
      onCancelApprove,
    ],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeSaveAction({ onClick: onSaveSub01 }),
      // TODO: 파일다운로드(onFileDown) — 서버 fileDownload(binary, ZIP). React 미구현.
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub01(main) : EMPTY_RESULT;
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [
      menuName,
      model.grids.sub01,
      model.grids.main.selectedRef,
      fetchSub01,
      onSaveSub01,
    ],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const sub01 = model.grids.sub01.selectedRef.current;
          return sub01 ? fetchSub02(sub01) : EMPTY_RESULT;
        },
        rows: model.grids.sub02.rows,
      }),
    ],
    [menuName, model.grids.sub02, model.grids.sub01.selectedRef, fetchSub02],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    onSub02GridClick,
    onSub02CellDoubleClicked,
    mainActions,
    sub01Actions,
    sub02Actions,
  };
}
