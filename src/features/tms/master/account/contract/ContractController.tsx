import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows, toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { Lang } from "@/app/services/common/Lang";
import { contractApi as api } from "./ContractApi";
import { MENU_CODE } from "./Contract";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ContractModel, GridKey } from "./ContractModel";

interface Args {
  model: ContractModel;
}

export function useContractController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 행 클릭 — 사업장/매출계약 cascade reset/fetch ─────────
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        { to: "sub01", fetch: (r) => api.getBuplaList({ CUST_CD: r.CUST_CD }) },
        { to: "sub02", fetch: (r) => api.getCustCntrctList({ CUST_CD: r.CUST_CD }) },
      ]),
    [base],
  );

  // ── 메인 조회 콜백 — 첫 행 자동 선택 + cascade ───────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 메인 추가/저장 ───────────────────────────────────────────
  const onAddMain = useCallback(() => base.addRow("main", {}), [base]);
  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.save),
    [base],
  );

  // ── 사업장 추가 — 선택된 고객사의 CUST_CD 상속 ───────────────
  const onAddBupla = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "고객사")) return;
    base.addRow("sub01", { CUST_CD: main.CUST_CD });
  }, [base, model.grids.main]);

  const onSaveBupla = useCallback(
    () =>
      base.saveGrid("sub01", api.saveBupla, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (parent) => api.getBuplaList({ CUST_CD: parent.CUST_CD }),
        },
      }),
    [base],
  );

  // ── 매출계약 추가 — 선택된 고객사의 CUST_CD 상속 ─────────────
  const onAddCustCntrct = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main || !main.CUST_CD) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    base.addRow("sub02", { CUST_CD: main.CUST_CD });
  }, [base, model.grids.main]);

  // ── 매출계약 저장 — 중복체크(SAME 차단 / OTHER 확인) 후 저장 ──
  const onSaveCustCntrct = useCallback(async () => {
    const rows = model.grids.sub02.rows ?? [];
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }

    const dsSave = toDsSave(dirty);

    const refetch = () => {
      const main = model.grids.main.selectedRef.current;
      if (main?.CUST_CD) {
        void base.searchSub("sub02", api.getCustCntrctList({ CUST_CD: main.CUST_CD }));
      }
    };

    const doSave = (confirmOtherYn: string) => {
      const payload = dsSave.map((r) => ({ ...r, CONFIRM_OTHER_YN: confirmOtherYn }));
      void base
        .callAjax(api.saveCustCntrct({ dsSave: payload }), { mask: "sub02" })
        .then(() => refetch());
    };

    // 중복체크
    const res: any = await base.callAjax(api.checkCustCntrctDup({ dsSave }));
    const out = res?.data?.data?.dsOut ?? {};
    const dupType = out.DUP_TYPE ?? "N";
    const sameMsgCd = out.SAME_MSG_CD ?? "MSG_AR_CONTRACT_EXISTS";
    const otherMsgCd = out.OTHER_MSG_CD ?? "MSG_AR_CONTRACT_EXISTS_FOR_OTHER_CUSTOMER";

    if (dupType === "SAME") {
      base.alert(Lang.get(sameMsgCd));
      return;
    }
    if (dupType === "OTHER") {
      base.confirm(Lang.get(otherMsgCd), () => doSave("Y"));
      return;
    }
    doSave("N");
  }, [base, model.grids.sub02, model.grids.main]);

  // ── 그리드별 액션 ────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, menuName, model.grids.main, model.filtersRef],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddBupla }),
      makeSaveAction({ onClick: onSaveBupla }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.getBuplaList({
            CUST_CD: model.grids.main.selectedRef.current?.CUST_CD ?? "",
          }),
        rows: model.grids.sub01.rows,
      }),
    ],
    [onAddBupla, onSaveBupla, menuName, model.grids.sub01, model.grids.main],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddCustCntrct }),
      makeSaveAction({ onClick: onSaveCustCntrct }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.getCustCntrctList({
            CUST_CD: model.grids.main.selectedRef.current?.CUST_CD ?? "",
          }),
        rows: model.grids.sub02.rows,
      }),
    ],
    [onAddCustCntrct, onSaveCustCntrct, menuName, model.grids.sub02, model.grids.main],
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
