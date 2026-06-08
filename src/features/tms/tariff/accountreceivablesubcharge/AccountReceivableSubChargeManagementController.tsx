import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { accountReceivableSubChargeManagementApi as api } from "./AccountReceivableSubChargeManagementApi";
import { MENU_CODE } from "./AccountReceivableSubChargeManagement";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  AccountReceivableSubChargeManagementModel,
  GridKey,
} from "./AccountReceivableSubChargeManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import AccountReceivableSubChargeAddPopup from "./popup/AccountReceivableSubChargeAddPopup";

interface Args {
  model: AccountReceivableSubChargeManagementModel;
}

const DELETE_CASCADE_MSG =
  "등록된 모든 상세 내역과 금액이 삭제됩니다. 진행하시겠습니까?";

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

const nextSeq = (rows: any[], field: string) => {
  let max = 0;
  (rows ?? []).forEach((r) => {
    const n = Number(r[field]);
    if (!Number.isNaN(n) && n > max) max = n;
  });
  return max + 1;
};

export function useAccountReceivableSubChargeManagementController({
  model,
}: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onDetail01RowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("detail01", row, [
        {
          to: "detail02",
          fetch: (r) => {
            const main = model.grids.main.selectedRef.current;
            return api.getDetail02List({
              AR_TRF_CD: main?.AR_TRF_CD,
              AR_CHG_CD: main?.AR_CHG_CD,
              AR_SUBCHG_CD: main?.AR_SUBCHG_CD,
              COST_CD: r.COST_CD,
            });
          },
        },
      ]),
    [base, model.grids.main],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["detail01", "detail02"]);
      if (!row) return;
      const detail01Rows = await base.searchSub(
        "detail01",
        api.getDetail01List({
          AR_TRF_CD: row.AR_TRF_CD,
          AR_CHG_CD: row.AR_CHG_CD,
          AR_SUBCHG_CD: row.AR_SUBCHG_CD,
        }),
      );
      if (detail01Rows[0]) onDetail01RowClicked(detail01Rows[0]);
    },
    [model, base, onDetail01RowClicked],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 메인 추가 (청구요율 라인 선택 팝업) ────────────────────
  const onOpenAdd = useCallback(() => {
    openPopup({
      title: Lang.get("MENU_ACCOUNT_RECEIVABLE_CONTRACT_CHARGE_MANAGEMENT"),
      width: "full",
      content: (
        <AccountReceivableSubChargeAddPopup
          onConfirm={(sel) => {
            closePopup();
            base.addRow("main", {
              CUST_CD: sel.CUST_CD,
              CUST_NM: sel.CUST_NM,
              AR_TRF_LCD: sel.AR_TRF_LCD,
              CUST_CNTRCT_CD: sel.CUST_CNTRCT_CD,
              CUST_CNTRCT_NM: sel.CUST_CNTRCT_NM,
              AR_TRF_CD: sel.AR_TRF_CD,
              AR_TRF_NM: sel.AR_TRF_NM,
              AR_CHG_CD: sel.AR_CHG_CD,
              AR_CHG_NM: sel.AR_CHG_NM,
              CALC_RNK: 1,
              MIN_COST: 0,
              MAX_COST: 9999999999,
              BSE_COST: 0,
              RDNG_RCD: "0300",
              ACCM_SUM_YN: "N",
              USE_YN: "Y",
            });
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [openPopup, closePopup, base]);

  // ── 비용(sub01) 추가 ───────────────────────────────────────
  const onAddCost = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main || !main.AR_SUBCHG_CD || main.EDIT_STS === "I") {
      base.alert(
        Lang.get("MSG_SUBCHG_SAVE_MAIN_BEFORE_COST"),
        Lang.get("TTL_CONFIRM"),
      );
      return;
    }
    base.addRow("detail01", {
      SEQ: nextSeq(model.grids.detail01.rows ?? [], "SEQ"),
      AR_TRF_CD: main.AR_TRF_CD,
      AR_CHG_CD: main.AR_CHG_CD,
      AR_SUBCHG_CD: main.AR_SUBCHG_CD,
      OPR: "*",
      ADJ_RT: 1,
      COST_AMT: 0,
    });
  }, [model.grids.main, model.grids.detail01, base]);

  // ── 조건(sub02) 추가 ───────────────────────────────────────
  const onAddCond = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    const cost = model.grids.detail01.selectedRef.current;
    if (!main || !cost || !cost.COST_CD) {
      base.alert(
        Lang.get("MSG_SUBCHG_SAVE_COST_BEFORE_COND"),
        Lang.get("TTL_CONFIRM"),
      );
      return;
    }
    const seq = nextSeq(model.grids.detail02.rows ?? [], "COND_SEQ");
    base.addRow("detail02", {
      AR_TRF_CD: main.AR_TRF_CD,
      AR_CHG_CD: main.AR_CHG_CD,
      AR_SUBCHG_CD: main.AR_SUBCHG_CD,
      COST_CD: cost.COST_CD,
      COND_SEQ: seq,
      COND_SEQ_ORIG: seq,
      LGC_OPR: "AND",
    });
  }, [model.grids.main, model.grids.detail01, model.grids.detail02, base]);

  const fetchSub01 = useCallback(
    (row: any) =>
      api.getDetail01List({
        AR_TRF_CD: row.AR_TRF_CD,
        AR_CHG_CD: row.AR_CHG_CD,
        AR_SUBCHG_CD: row.AR_SUBCHG_CD,
      }),
    [],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onOpenAdd }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("main", api.save, {
            confirmOnDelete: DELETE_CASCADE_MSG,
          }),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onOpenAdd, base, menuName, model.filtersRef, model.grids.main],
  );

  const detail01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddCost }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("detail01", api.saveCost, {
            afterSave: {
              cascadeFrom: "main",
              fetch: (m: any) => fetchSub01(m),
            },
          }),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.detail01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub01(main) : EMPTY_RESULT;
        },
        rows: model.grids.detail01.rows,
      }),
    ],
    [
      onAddCost,
      menuName,
      model.grids.detail01,
      model.grids.main.selectedRef,
      base,
      fetchSub01,
    ],
  );

  const detail02Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddCond }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("detail02", api.saveCostCond, {
            beforeSave: () => {
              const rows = (model.grids.detail02.rows ?? []).filter(
                (r: any) => r.EDIT_STS !== "D" && r.delStatus !== true,
              );
              const seen = new Set<string>();
              for (const r of rows) {
                const v = r.COND_SEQ;
                if (v == null || String(v).trim() === "") continue;
                const key = String(v).trim();
                if (seen.has(key)) {
                  base.alert(
                    `COND_SEQ(순번)은 중복될 수 없습니다. (${key})`,
                    Lang.get("TTL_CONFIRM"),
                  );
                  return false;
                }
                seen.add(key);
              }
              return true;
            },
            afterSave: {
              cascadeFrom: "detail01",
              fetch: (c: any) => {
                const main = model.grids.main.selectedRef.current;
                return api.getDetail02List({
                  AR_TRF_CD: main?.AR_TRF_CD,
                  AR_CHG_CD: main?.AR_CHG_CD,
                  AR_SUBCHG_CD: main?.AR_SUBCHG_CD,
                  COST_CD: c.COST_CD,
                });
              },
            },
          }),
      }),
    ],
    [onAddCond, base, model.grids.detail02, model.grids.main],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onDetail01RowClicked,
    mainActions,
    detail01Actions,
    detail02Actions,
  };
}
