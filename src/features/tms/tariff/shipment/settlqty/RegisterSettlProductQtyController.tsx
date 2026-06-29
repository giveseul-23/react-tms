import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { dirtyRows, toDsSave, ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { registerSettlProductQtyApi as api } from "./RegisterSettlProductQtyApi";
import { MENU_CODE } from "./RegisterSettlProductQty";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { RegisterSettlProductQtyModel, GridKey } from "./RegisterSettlProductQtyModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: RegisterSettlProductQtyModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useRegisterSettlProductQtyController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  // 센차 settingCondition 대응 — 필수값/기간 검증 후 등록 params 생성
  const settingCondition = useCallback(() => {
    const s = getSearch();
    const dlvryFrom = String(s.SRCH_DLVRY_DT_FROM ?? "");
    const dlvryTo = String(s.SRCH_DLVRY_DT_TO ?? "");
    const carrCd = String(s.SRCH_DV_CARR_CD ?? "");
    const lgstGrpCd = String(s.SRCH_A_LGST_GRP_CD ?? "");

    if (!dlvryFrom || !dlvryTo || !carrCd || !lgstGrpCd) {
      base.alert(Lang.get("MSG_SEL_DLVRY_DT"), Lang.get("TTL_CONFIRM"));
      return null;
    }
    if (dlvryFrom.replace(/-/g, "") > dlvryTo.replace(/-/g, "")) {
      base.alert(Lang.get("MSG_INPUT_DATE_VALIDATION"), Lang.get("TTL_CONFIRM"));
      return null;
    }
    return {
      DLVRY_DT_FROM: dlvryFrom,
      DLVRY_DT_TO: dlvryTo,
      CARR_CD: carrCd,
      LGST_GRP_CD: lgstGrpCd,
    };
  }, [base, getSearch]);

  // ── 조회 ───────────────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      if (settingCondition() == null) return EMPTY_RESULT;
      return api.getList(params);
    },
    [settingCondition],
  );

  const onSearchCallback = useCallback(
    (data: any) => model.grids.main.setData(data),
    [model.grids.main],
  );

  // ── 납품일 등록 ─────────────────────────────────────────────────────
  const onRegisterDeliveryDate = useCallback(() => {
    const params = settingCondition();
    if (params == null) return;
    void base
      .callAjax(api.registerDeliveryDate(params), { mask: "main" })
      .then(() => base.search());
  }, [base, settingCondition]);

  // ── 납품일 등록 취소 ────────────────────────────────────────────────
  const onCancelRegisterDeliveryDate = useCallback(
    (selected: any[]) => {
      const rows = selected ?? [];
      if (!rows.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
        return;
      }
      for (const r of rows) {
        if (r.ITEMQTY_OP_STS !== "1005") {
          base.alert(
            Lang.get("MSG_FAIL_CANCEL_DELIVERY_DATE", r.DSPCH_NO),
            Lang.get("TTL_ALERT"),
          );
          return;
        }
      }
      const dsSave = toDsSave(
        rows.map((r) => ({ ...r, EDIT_STS: ROW_STATUS.UPDATE })),
      );
      void base
        .callAjax(api.cancelRegisterDeliveryDate({ dsSave }), { mask: "main" })
        .then(() => base.search());
    },
    [base],
  );

  // ── 저장 ((실)납품일/수량) ──────────────────────────────────────────
  const onSaveItmUomValue = useCallback(() => {
    const dirty = dirtyRows(model.grids.main.rows);
    if (!dirty.length) {
      base.alert(Lang.get("MSG_NO_CHANGE_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    for (const r of dirty) {
      if (String(r.ITEMQTY_OP_STS) >= "1010") {
        base.alert(Lang.get("MSG_FAIL_MODIFY_FOR_APSETTL"), Lang.get("TTL_CONFIRM"));
        return;
      }
      if (!r.ITEMQTY_DLVRY_DT) {
        base.alert(
          Lang.get("MSG_REQUIRED_VALUE", Lang.get("LBL_REAL_DELIVERY_DT")),
          Lang.get("TTL_ALERT"),
        );
        return;
      }
    }
    const dsSave = toDsSave(
      dirty.map((r) => ({
        ...r,
        ITEMQTY_DLVRY_DT: String(r.ITEMQTY_DLVRY_DT).substring(0, 10).replace(/-/g, ""),
      })),
    );
    void base.callAjax(api.saveItmUomValue({ dsSave }), { mask: "main" }).then(() => base.search());
  }, [base, model.grids.main]);

  // ── 그리드 액션 ─────────────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_REGIST_DLVRY_DT",
        label: "BTN_REGIST_DLVRY_DT",
        onClick: onRegisterDeliveryDate,
      },
      {
        type: "button",
        key: "BTN_CAN_REGIST_DLVRY_DT",
        label: "BTN_CAN_REGIST_DLVRY_DT",
        onClick: ({ data }: { data: any[] }) => onCancelRegisterDeliveryDate(data),
      },
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: onSaveItmUomValue,
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [
      menuName,
      model.grids.main,
      model.filtersRef,
      onRegisterDeliveryDate,
      onCancelRegisterDeliveryDate,
      onSaveItmUomValue,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
