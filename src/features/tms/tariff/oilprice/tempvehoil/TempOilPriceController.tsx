import { useCallback, useMemo, MutableRefObject } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { tempOilPriceApi as api } from "./TempOilPriceApi";
import { MENU_CODE } from "./TempOilPrice";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeCommonActions,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { TempOilPriceModel, GridKey } from "./TempOilPriceModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import TempOilPricePop from "./popup/TempOilPricePop";

interface Args {
  model: TempOilPriceModel;
  activeTabRef: MutableRefObject<string>;
}

const stripSep = (v: any) => String(v ?? "").replace(/[\s\-:/T]/g, "");
const todayCompact = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

export function useTempOilPriceController({ model, activeTabRef }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      if (activeTabRef.current === "PERIOD") {
        return api.getTempOilPriceByPeriod(params);
      }
      return api.getList(params);
    },
    [activeTabRef],
  );

  const onMasterRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("master", row, [
        {
          to: "oilPrice",
          fetch: (r) => api.getTempOilPrice({ LGST_GRP_CD: r.LGST_GRP_CD }),
        },
      ]),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      if (activeTabRef.current === "PERIOD") {
        model.grids.period.setData(data);
        return;
      }
      model.grids.master.setData(data);
      onMasterRowClicked(data?.rows?.[0]);
    },
    [model, activeTabRef, onMasterRowClicked],
  );

  // ── 전체 유가 생성 ─────────────────────────────────────────
  const onCreateOilPriceAll = useCallback(() => {
    openPopup({
      title: "LBL_CF_OIL_PRICE_CREATE",
      width: "md",
      content: (
        <TempOilPricePop
          onConfirm={(params) => {
            closePopup();
            base.callAjax(api.createOilPriceAll(params), { mask: "master" }).then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [openPopup, closePopup, base]);

  const handleOilPriceAdd = useCallback(() => {
    const main = model.grids.master.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    base.addRow("oilPrice", {
      LGST_GRP_CD: main.LGST_GRP_CD,
      LGST_GRP_NM: main.LGST_GRP_NM,
    });
  }, [model, base]);

  const handleOilPriceSave = useCallback(
    () =>
      base.saveGrid("oilPrice", api.saveOilPrice, {
        beforeSave: () => {
          const rows = model.grids.oilPrice.rows ?? [];
          // 추가 행: FRM<=TO
          if (
            rows.some(
              (r: any) =>
                r.EDIT_STS === "I" &&
                r.FRM_DTTM &&
                r.TO_DTTM &&
                stripSep(r.FRM_DTTM) > stripSep(r.TO_DTTM),
            )
          ) {
            base.alert(Lang.get("MSG_INPUT_DATE_VALIDATION"), Lang.get("TTL_ERR"));
            return false;
          }
          // 삭제 행: 과거(시작일<오늘) 삭제 불가
          if (
            rows.some(
              (r: any) =>
                (r.EDIT_STS === "D" || r.delStatus === true) &&
                r.FRM_DTTM &&
                stripSep(r.FRM_DTTM) < todayCompact(),
            )
          ) {
            base.alert(
              Lang.get("MSG_TEMP_OIL_PRICE_DELETE_VALIDATION"),
              Lang.get("TTL_ERR"),
            );
            return false;
          }
          return true;
        },
        afterSave: {
          cascadeFrom: "master",
          fetch: (m: any) => api.getTempOilPrice({ LGST_GRP_CD: m.LGST_GRP_CD }),
        },
      }),
    [base, model.grids.oilPrice],
  );

  const oilPriceActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleOilPriceAdd }),
      makeSaveAction({ onClick: handleOilPriceSave }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.oilPrice.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getTempOilPrice(model.filtersRef.current),
        rows: () => model.grids.oilPrice.rows,
      }),
    ],
    [handleOilPriceAdd, handleOilPriceSave, menuName, model],
  );

  const masterActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CRE_ALL_OIL_MGMT",
        label: "BTN_CRE_ALL_OIL_MGMT",
        onClick: onCreateOilPriceAll,
      },
    ],
    [onCreateOilPriceAll],
  );

  const periodActions: ActionItem[] = useMemo(
    () =>
      makeCommonActions({
        excel: {
          excelColumns: () => model.grids.period.getExcelColumns(),
          menuCode: MENU_CODE,
          menuName: menuName,
          fetchFn: () => api.getTempOilPriceByPeriod(model.filtersRef.current),
          rows: () => model.grids.period.rows,
        },
      }),
    [model, menuName],
  );

  return {
    fetchList,
    onSearchCallback,
    onMasterRowClicked,
    masterActions,
    oilPriceActions,
    periodActions,
  };
}
