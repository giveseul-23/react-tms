import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { pboxRetQtyMgmtApi as api } from "./PboxRetQtyMgmtApi";
import { MENU_CODE } from "./PboxRetQtyMgmt";
import { TermTpPop } from "./popup/TermTpPop";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { PboxRetQtyMgmtModel, GridKey } from "./PboxRetQtyMgmtModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: PboxRetQtyMgmtModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function usePboxRetQtyMgmtController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );
  const getDateRange = useCallback(() => {
    const s = getSearch();
    return {
      FRM_DTTM: String(s.SRCH_QTY_DLVRY_DT_FROM ?? ""),
      TO_DTTM: String(s.SRCH_QTY_DLVRY_DT_TO ?? ""),
    };
  }, [getSearch]);

  // 운송일 시작/종료월 동일 검증
  const isSameMonth = useCallback(() => {
    const { FRM_DTTM, TO_DTTM } = getDateRange();
    if (!FRM_DTTM || !TO_DTTM) return true;
    return (
      FRM_DTTM.replace(/-/g, "").slice(0, 6) ===
      TO_DTTM.replace(/-/g, "").slice(0, 6)
    );
  }, [getDateRange]);

  // ── 메인 조회 — 동월 검증 후 협력사단위 조회 ──────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      if (!isSameMonth()) {
        base.alert("[조회조건] 운송일 시작월과 종료월은 같을 수 없습니다.");
        return EMPTY_RESULT;
      }
      return api.getMainList(params);
    },
    [base, isSameMonth],
  );

  // ── 조회 콜백 — 3그리드 동시 조회 ─────────────────────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const filters = model.filtersRef.current;
      void base.searchSub("sub01", api.getSub01List(filters));
      void base.searchSub("sub02", api.getSub02List(filters));
    },
    [base, model.grids.main, model.filtersRef],
  );

  const onMainGridClick = useCallback(
    (row: any) => base.handleRowClick("main", row),
    [base],
  );

  // ── 선택 행 저장 공용 (확인/확인취소/상세저장) ────────────────────
  const saveSelected = useCallback(
    (
      selected: any[],
      apiFn: (payload: any) => Promise<any>,
      validate?: (rows: any[]) => boolean,
    ) => {
      const rows = selected ?? [];
      if (!rows.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }
      if (validate && !validate(rows)) return;
      const { FRM_DTTM, TO_DTTM } = getDateRange();
      const dsSave = toDsSave(
        rows.map((r) => ({
          ...r,
          FRM_DTTM,
          TO_DTTM,
          EDIT_STS: ROW_STATUS.UPDATE,
        })),
      );
      void base.callAjax(apiFn({ dsSave }), { mask: "main" }).then(() => base.search());
    },
    [base, getDateRange],
  );

  // 저장 전 검증 — 신규(1010)·출고박스>0·변경 시 메모 필수
  const checkSaveSub02 = useCallback(
    (rows: any[]) => {
      for (const r of rows) {
        if (r.ITEMQTY_OP_STS !== "1010") return false;
        if (Number(r.OTBND_PBOX_QTY) < 1) return false;
        if (
          String(r.OTBND_PBOX_QTY) !== String(r.OTBND_PBOX_QTY_ORI) &&
          !String(r.MEMO_DESC ?? "").trim()
        ) {
          base.alert(Lang.get("MSG_ERR_RET_PBOX_MEMO"));
          return false;
        }
      }
      return true;
    },
    [base],
  );
  const checkStatus = useCallback(
    (rows: any[]) => rows.every((r) => r.ITEMQTY_OP_STS === "1010"),
    [],
  );

  // ── 기간구분 변경 팝업 ────────────────────────────────────────────
  const onChangeTermTp = useCallback(() => {
    const { FRM_DTTM, TO_DTTM } = getDateRange();
    const s = getSearch();
    const termTpOptions = Object.entries(model.codeMap?.pboxTermTp ?? {}).map(
      ([CODE, NAME]) => ({ CODE, NAME: String(NAME) }),
    );
    openPopup({
      title: "BTN_CHG_TERM_TP",
      width: "sm",
      content: (
        <TermTpPop
          initialValues={{ FRM_DTTM, TO_DTTM }}
          termTpOptions={termTpOptions}
          onConfirm={(p) => {
            closePopup();
            void base
              .callAjax(
                api.saveTermTp({
                  DIV_CD: s.SRCH_QTY_DIV_CD ?? "",
                  LGST_GRP_CD: s.SRCH_QTY_LGST_GRP_CD ?? "",
                  VEH_NO: s.SRCH_V_VEH_NO ?? "",
                  CARR_CD: s.SRCH_QTY_CARR_CD ?? "",
                  FRM_DTTM: p.FRM_DTTM,
                  TO_DTTM: p.TO_DTTM,
                  TERM_TP: p.TERM_TP,
                }),
                { mask: "main" },
              )
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, getDateRange, getSearch, model.codeMap, openPopup]);

  // ── 그리드별 액션 ─────────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getMainList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "BTN_CHG_TERM_TP", label: "BTN_CHG_TERM_TP", onClick: onChangeTermTp },
      {
        type: "button",
        key: "BTN_CONFIRM",
        label: "BTN_CONFIRM",
        onClick: ({ data }: { data: any[] }) =>
          saveSelected(data, api.saveConfirm, checkSaveSub02),
      },
      {
        type: "button",
        key: "CONFIRM_CANCEL",
        label: "CONFIRM_CANCEL",
        onClick: ({ data }: { data: any[] }) =>
          saveSelected(data, api.saveCancelConfirm, checkStatus),
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getSub01List(model.filtersRef.current),
        rows: model.grids.sub01.rows,
      }),
    ],
    [
      menuName,
      model.grids.sub01,
      model.filtersRef,
      onChangeTermTp,
      saveSelected,
      checkSaveSub02,
      checkStatus,
    ],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "BTN_CHG_TERM_TP", label: "BTN_CHG_TERM_TP", onClick: onChangeTermTp },
      {
        type: "button",
        key: "BTN_CONFIRM",
        label: "BTN_CONFIRM",
        onClick: ({ data }: { data: any[] }) =>
          saveSelected(data, api.saveConfirm, checkSaveSub02),
      },
      {
        type: "button",
        key: "CONFIRM_CANCEL",
        label: "CONFIRM_CANCEL",
        onClick: ({ data }: { data: any[] }) =>
          saveSelected(data, api.saveCancelConfirm, checkStatus),
      },
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: ({ data }: { data: any[] }) =>
          saveSelected(data, api.saveSub02, checkSaveSub02),
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getSub02List(model.filtersRef.current),
        rows: model.grids.sub02.rows,
      }),
    ],
    [
      menuName,
      model.grids.sub02,
      model.filtersRef,
      onChangeTermTp,
      saveSelected,
      checkSaveSub02,
      checkStatus,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    sub01Actions,
    sub02Actions,
  };
}
